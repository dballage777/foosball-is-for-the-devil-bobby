"""Reporting system — turns predictions + bet ledgers into the required reports.

Writes CSVs under reports/ and a human-readable performance_summary.md. Every
number traces back to a row in predictions_<model>.csv or bets_<model>.csv, so
the whole thing is auditable end to end.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from src.backtest.engine import betting_metrics, classification_metrics
from src.utils import LOG, american_to_prob, get_path


def _grouped_betting(ledger: pd.DataFrame, by) -> pd.DataFrame:
    rows = []
    for key, g in ledger.groupby(by):
        m = betting_metrics(g)
        if not m:
            continue
        if not isinstance(key, tuple):
            key = (key,)
        rec = dict(zip(by if isinstance(by, list) else [by], key))
        rec.update(m)
        rows.append(rec)
    return pd.DataFrame(rows)


def write_reports(pred: pd.DataFrame, ledger: pd.DataFrame, model_label: str) -> dict:
    rpt = get_path("reports")
    summary = {}

    # raw artifacts
    pred.to_csv(rpt / f"predictions_{model_label}.csv", index=False)
    if not ledger.empty:
        ledger.to_csv(rpt / f"bets_{model_label}.csv", index=False)

    # 1 — overall
    overall = {**classification_metrics(pred)}
    for mk in ["ats", "moneyline", "total"]:
        bm = betting_metrics(ledger, mk) if not ledger.empty else {}
        for k, v in bm.items():
            overall[f"{mk}_{k}"] = v
    pd.DataFrame([overall]).to_csv(rpt / f"01_overall_{model_label}.csv", index=False)
    summary["overall"] = overall

    # 2 — by season
    season_rows = []
    for s, g in pred.groupby("season"):
        rec = {"season": int(s), **classification_metrics(g)}
        lg = ledger[ledger.season == s] if not ledger.empty else pd.DataFrame()
        rec.update({f"ats_{k}": v for k, v in betting_metrics(lg, "ats").items()})
        season_rows.append(rec)
    pd.DataFrame(season_rows).to_csv(rpt / f"02_season_{model_label}.csv", index=False)

    # 3 — by week
    week_rows = []
    for (s, w), g in pred.groupby(["season", "week"]):
        rec = {"season": int(s), "week": int(w), **classification_metrics(g)}
        week_rows.append(rec)
    pd.DataFrame(week_rows).to_csv(rpt / f"03_weekly_{model_label}.csv", index=False)

    # 4 — confidence tiers
    if not ledger.empty:
        tier = _grouped_betting(ledger, "conf_tier")
        tier.to_csv(rpt / f"04_confidence_tier_{model_label}.csv", index=False)
    # SU accuracy by tier (from predictions)
    tier_su = []
    for t, g in pred.groupby("conf_tier", observed=True):
        d = g[g["home_win"].isin([0.0, 1.0])]
        if len(d):
            acc = float(np.mean((d["home_win_prob"] >= 0.5) == (d["home_win"] == 1)))
            tier_su.append({"conf_tier": str(t), "n": len(d), "su_accuracy": acc})
    pd.DataFrame(tier_su).to_csv(rpt / f"04b_tier_su_{model_label}.csv", index=False)

    # 5 — home vs away picks (ATS)
    if not ledger.empty:
        ha = _grouped_betting(ledger[ledger.market == "ats"], "pick_home")
        ha.to_csv(rpt / f"05_home_away_{model_label}.csv", index=False)

    # 6 — favorite vs underdog (by market implied side)
    fav = pred.copy()
    mkt_pick = np.where(fav["pick_home"], fav["market_home_prob"], 1 - fav["market_home_prob"])
    fav["pick_is_favorite"] = mkt_pick >= 0.5
    fav_rows = []
    for is_fav, g in fav.groupby("pick_is_favorite"):
        d = g[g["home_win"].isin([0.0, 1.0])]
        rec = {"pick_is_favorite": bool(is_fav), "n": len(g)}
        if len(d):
            rec["su_accuracy"] = float(np.mean(
                (d["home_win_prob"] >= 0.5) == (d["home_win"] == 1)))
        if not ledger.empty:
            ids = set(g["game_id"])
            lg = ledger[(ledger.market == "ats") & (ledger.game_id.isin(ids))]
            rec.update({f"ats_{k}": v for k, v in betting_metrics(lg).items()})
        fav_rows.append(rec)
    pd.DataFrame(fav_rows).to_csv(rpt / f"06_favorite_underdog_{model_label}.csv", index=False)

    # 7 — safe bets
    safe = pred[pred["safe_bet"]]
    safe_rec = {"n_safe_bets": int(len(safe)), **classification_metrics(safe)}
    if not ledger.empty:
        ls = ledger[ledger["safe_bet"]]
        safe_rec.update({f"ats_{k}": v for k, v in betting_metrics(ls, "ats").items()})
    pd.DataFrame([safe_rec]).to_csv(rpt / f"07_safe_bets_{model_label}.csv", index=False)
    summary["safe_bets"] = safe_rec

    # 8 — market comparison (model vs always-bet-the-favorite baseline)
    mc = pred.dropna(subset=["home_win", "market_home_prob"])
    mc = mc[mc["home_win"].isin([0.0, 1.0])]
    market_rec = {}
    if len(mc):
        mp = mc["market_home_prob"].clip(1e-6, 1 - 1e-6)
        y = mc["home_win"]
        market_rec = {
            "model_su": float(np.mean((mc["home_win_prob"] >= 0.5) == (y == 1))),
            "market_su": float(np.mean((mp >= 0.5) == (y == 1))),
            "model_brier": float(np.mean((mc["home_win_prob"] - y) ** 2)),
            "market_brier": float(np.mean((mp - y) ** 2)),
        }
    pd.DataFrame([market_rec]).to_csv(rpt / f"08_market_comparison_{model_label}.csv", index=False)
    summary["market"] = market_rec

    LOG.info("[%s] reports written to %s", model_label, rpt)
    return summary


def write_markdown_summary(summaries: dict) -> None:
    """Combine per-model summaries into reports/performance_summary.md."""
    rpt = get_path("reports")
    lines = ["# NFL Prediction Engine — Performance Summary", ""]
    lines.append("All metrics are out-of-sample, produced by strict weekly "
                 "walk-forward validation (train on the past, predict the next "
                 "week). 'Market' = the closing-line implied favorite baseline.")
    lines.append("")
    for label, s in summaries.items():
        o = s.get("overall", {})
        m = s.get("market", {})
        sb = s.get("safe_bets", {})
        lines.append(f"## {label}")
        lines.append("")
        lines.append(f"- Games scored: **{o.get('n_games', 'NA')}**")
        lines.append(f"- Straight-up accuracy: **{_pct(o.get('su_accuracy'))}** "
                     f"(market baseline {_pct(m.get('market_su'))})")
        lines.append(f"- Brier score: **{_f(o.get('brier'))}** "
                     f"(market {_f(m.get('market_brier'))}) — lower is better")
        lines.append(f"- Log loss: **{_f(o.get('log_loss'))}**, "
                     f"Calibration ECE: **{_f(o.get('calibration_ece'))}**")
        lines.append(f"- ATS: {o.get('ats_n_bets', 0)} bets, "
                     f"win {_pct(o.get('ats_win_pct'))}, ROI **{_pct(o.get('ats_roi'))}**, "
                     f"profit {_f(o.get('ats_profit_units'))}u, "
                     f"max DD {_f(o.get('ats_max_drawdown'))}u")
        lines.append(f"- Moneyline (value): {o.get('moneyline_n_bets', 0)} bets, "
                     f"win {_pct(o.get('moneyline_win_pct'))}, "
                     f"ROI **{_pct(o.get('moneyline_roi'))}**")
        lines.append(f"- Totals: {o.get('total_n_bets', 0)} bets, "
                     f"ROI **{_pct(o.get('total_roi'))}**")
        lines.append(f"- Safe-bet ATS: {sb.get('ats_n_bets', 0)} bets, "
                     f"win {_pct(sb.get('ats_win_pct'))}, ROI **{_pct(sb.get('ats_roi'))}**")
        lines.append("")
    # interpretation guardrail
    lines.append("## How to read these numbers")
    lines.append("")
    lines.append("- Beating ~52.4% ATS is the break-even line at -110. Results "
                 "near or below that mean **no demonstrated edge** — which is the "
                 "honest and expected outcome for a transparent public-data model.")
    lines.append("- A straight-up accuracy close to the market baseline means the "
                 "model has roughly learned what the closing line already knows. "
                 "Substantially *beating* the market on out-of-sample data would be "
                 "the signal to investigate for leakage, not to celebrate.")
    (rpt / "performance_summary.md").write_text("\n".join(lines))
    LOG.info("wrote performance_summary.md")


def _pct(x):
    return "NA" if x is None or (isinstance(x, float) and np.isnan(x)) else f"{x*100:.1f}%"


def _f(x):
    return "NA" if x is None or (isinstance(x, float) and np.isnan(x)) else f"{x:.4f}"
