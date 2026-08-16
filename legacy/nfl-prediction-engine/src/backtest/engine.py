"""Walk-forward backtest + realistic betting simulation + performance metrics.

Walk-forward protocol (strict, no shuffling, no k-fold):

    for each (season, week) in chronological order starting at the configured
    first prediction week:
        train  = every PLAYED game with kickoff strictly before this week
        refit  the model on train
        predict this week's games
        record predictions and (later) settle bets against real results

Because the training cutoff is a kickoff timestamp, a game can never be trained
on its own week or any later week — the walk-forward boundary is itself a
leakage guard independent of the feature-level audit.

Betting simulation uses the real closing lines stored with each game (spread,
moneyline, total). Flat 1-unit stakes; book vig respected via American odds;
missing odds default to -110 and are flagged.
"""
from __future__ import annotations

from typing import Callable

import numpy as np
import pandas as pd

from src.utils import (LOG, american_to_decimal, american_to_prob, get_path,
                       load_config)


# --------------------------------------------------------------------------- #
# Walk-forward prediction loop
# --------------------------------------------------------------------------- #
def run_walk_forward(features: pd.DataFrame,
                     model_factory: Callable[[], object],
                     label: str) -> pd.DataFrame:
    cfg = load_config()
    start_s, start_w = cfg["start_season"], cfg["start_week"]
    f = features.sort_values(["season", "week", "kickoff", "game_id"]).copy()
    f["kickoff"] = pd.to_datetime(f["kickoff"])

    # weeks to predict (evaluation seasons, from the configured start)
    weeks = (f[["season", "week"]].drop_duplicates()
             .sort_values(["season", "week"]))
    weeks = weeks[(weeks.season > start_s) |
                  ((weeks.season == start_s) & (weeks.week >= start_w))]

    preds = []
    for season, week in weeks.itertuples(index=False):
        slate = f[(f.season == season) & (f.week == week)]
        slate = slate[slate["played"]]               # only score real outcomes
        if slate.empty:
            continue
        cutoff = slate["kickoff"].min()
        train = f[(f["kickoff"] < cutoff) & (f["played"])]
        if len(train) < 30:
            continue
        model = model_factory()
        model.fit(train)
        pred = model.predict(slate)
        pred["model"] = label
        pred["train_games"] = len(train)
        preds.append(pred)

    if not preds:
        return pd.DataFrame()
    out = pd.concat(preds, ignore_index=True)
    out = _apply_safe_bet_filter(out)
    LOG.info("[%s] walk-forward produced %d predictions", label, len(out))
    return out


def _apply_safe_bet_filter(p: pd.DataFrame) -> pd.DataFrame:
    """Tag Safe-Bet candidates per spec (all conditions must hold)."""
    cfg = load_config()["safe_bet_filter"]
    # advantage oriented to the picked side
    adv = np.where(p["pick_home"], p["composite_adv"], -p["composite_adv"])
    epa = np.where(p["pick_home"], p["epa_diff"], -p["epa_diff"])
    dvoa = np.where(p["pick_home"], p["dvoa_proxy_diff"], -p["dvoa_proxy_diff"])
    pick_qb = np.where(p["pick_home"], p["home_qb_injury"], p["away_qb_injury"])
    opp_qb = np.where(p["pick_home"], p["away_qb_injury"], p["home_qb_injury"])
    # market-implied prob for the picked side (proxy: closing line; no movement feed)
    mkt_pick = np.where(p["pick_home"], p["market_home_prob"], 1 - p["market_home_prob"])

    cond = adv >= cfg["min_score_advantage_pct"]
    if cfg["require_positive_epa_diff"]:
        cond &= epa > 0
    if cfg["require_positive_dvoa_diff"]:
        cond &= dvoa > 0
    if cfg["block_on_qb_injury_disadvantage"]:
        cond &= (pick_qb <= opp_qb)
    if cfg["block_when_market_opposes"]:
        cond &= (mkt_pick >= 0.40)   # market does not strongly oppose the pick
    p = p.copy()
    p["safe_bet"] = cond
    p["pick_side_adv"] = adv
    return p


# --------------------------------------------------------------------------- #
# Betting simulation
# --------------------------------------------------------------------------- #
def simulate_betting(pred: pd.DataFrame) -> pd.DataFrame:
    """Settle ATS / moneyline / total bets against real outcomes.

    Returns a long bet ledger (one row per placed bet) with profit in units.
    """
    cfg = load_config()["betting"]
    unit = cfg["unit"]
    vig = cfg["default_vig_odds"]
    min_conf = cfg["min_confidence_to_bet"]
    markets = cfg["bet_markets"]

    p = pred[pred["confidence"] >= min_conf].copy()
    ledger = []

    for _, r in p.iterrows():
        result = r["result"]            # home - away
        pick_home = bool(r["pick_home"])

        # ---- Against the spread ------------------------------------------
        if "ats" in markets and pd.notna(r.get("spread_line")):
            sl = r["spread_line"]       # home favored by sl points
            if pick_home:
                ats_margin = result - sl
                odds = r.get("home_spread_odds", vig)
            else:
                ats_margin = sl - result
                odds = r.get("away_spread_odds", vig)
            odds = vig if pd.isna(odds) else odds
            ledger.append(_settle("ats", r, ats_margin, odds, unit))

        # ---- Moneyline (value only) --------------------------------------
        if "moneyline" in markets:
            ml = r["home_moneyline"] if pick_home else r["away_moneyline"]
            if pd.notna(ml):
                implied = american_to_prob(ml)
                edge = r["win_prob"] - implied
                if edge > cfg["value_threshold"]:
                    won = (result > 0) if pick_home else (result < 0)
                    margin = 1 if won else (-1 if result != 0 else 0)
                    ledger.append(_settle("moneyline", r, margin, ml, unit, edge=edge))

        # ---- Total (over/under) ------------------------------------------
        if "total" in markets and pd.notna(r.get("total_line")) and pd.notna(r.get("pred_total")):
            diff = r["pred_total"] - r["total_line"]
            if abs(diff) >= 1.0:        # only bet with a point of model edge
                actual_total = r["home_score"] + r["away_score"]
                over = diff > 0
                if over:
                    margin = actual_total - r["total_line"]
                else:
                    margin = r["total_line"] - actual_total
                ledger.append(_settle("total", r, margin, vig, unit,
                                      side="over" if over else "under"))

    if not ledger:
        return pd.DataFrame()
    return pd.DataFrame(ledger)


def _settle(market, r, margin, odds, unit, edge=np.nan, side=None) -> dict:
    """Resolve a single bet. `margin` > 0 win, == 0 push, < 0 loss."""
    dec = american_to_decimal(odds)
    if margin > 0:
        profit = unit * dec
        res = "win"
    elif margin == 0:
        profit = 0.0
        res = "push"
    else:
        profit = -unit
        res = "loss"
    return {
        "model": r["model"], "game_id": r["game_id"], "season": r["season"],
        "week": r["week"], "market": market, "pick_team": r["pick_team"],
        "pick_home": bool(r["pick_home"]), "side": side,
        "confidence": r["confidence"], "conf_tier": str(r["conf_tier"]),
        "safe_bet": bool(r.get("safe_bet", False)),
        "odds": odds, "stake": unit, "profit": profit, "result": res,
        "edge": edge,
    }


# --------------------------------------------------------------------------- #
# Metrics
# --------------------------------------------------------------------------- #
def classification_metrics(pred: pd.DataFrame) -> dict:
    """Probabilistic metrics over games with a binary outcome (ties dropped)."""
    d = pred.dropna(subset=["home_win", "home_win_prob"])
    d = d[d["home_win"].isin([0.0, 1.0])]
    if d.empty:
        return {}
    y = d["home_win"].to_numpy()
    p = d["home_win_prob"].clip(1e-6, 1 - 1e-6).to_numpy()
    brier = float(np.mean((p - y) ** 2))
    logloss = float(-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p)))
    su_acc = float(np.mean((p >= 0.5) == (y == 1)))
    # Expected calibration error (10 bins)
    bins = np.linspace(0, 1, 11)
    idx = np.digitize(p, bins) - 1
    ece = 0.0
    for b in range(10):
        m = idx == b
        if m.sum():
            ece += (m.sum() / len(p)) * abs(p[m].mean() - y[m].mean())
    return {"n_games": int(len(d)), "su_accuracy": su_acc,
            "brier": brier, "log_loss": logloss, "calibration_ece": float(ece)}


def betting_metrics(ledger: pd.DataFrame, market: str | None = None) -> dict:
    """ROI / win% / profit factor / drawdown / Sharpe for a bet ledger."""
    d = ledger if market is None else ledger[ledger["market"] == market]
    d = d[d["result"] != "push"] if "result" in d else d
    settled = d if market is None else d
    if len(settled) == 0:
        return {}
    staked = settled["stake"].sum()
    profit = settled["profit"].sum()
    wins = settled[settled["result"] == "win"]
    losses = settled[settled["result"] == "loss"]
    gross_win = wins["profit"].sum()
    gross_loss = -losses["profit"].sum()
    n_decided = len(wins) + len(losses)
    win_pct = len(wins) / n_decided if n_decided else np.nan
    roi = profit / staked if staked else np.nan
    pf = gross_win / gross_loss if gross_loss > 0 else np.inf
    # bankroll curve / drawdown
    curve = settled.sort_values(["season", "week"])["profit"].cumsum()
    peak = curve.cummax()
    dd = (curve - peak)
    max_dd = float(dd.min()) if len(dd) else 0.0
    # Sharpe of per-bet returns (profit per unit staked)
    rets = settled["profit"] / settled["stake"]
    sharpe = float(rets.mean() / rets.std(ddof=0) * np.sqrt(len(rets))) \
        if rets.std(ddof=0) > 0 else np.nan
    exp_roi = float(settled["edge"].dropna().mean()) if "edge" in settled else np.nan
    return {
        "n_bets": int(len(settled)), "win_pct": float(win_pct),
        "roi": float(roi), "expected_roi": exp_roi, "profit_units": float(profit),
        "profit_factor": float(pf), "max_drawdown": max_dd, "sharpe": sharpe,
    }
