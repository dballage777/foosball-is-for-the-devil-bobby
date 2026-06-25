"""The baseline weighted-composite model (the 100-point spec model).

Each team is scored 0-100 as a weighted blend of percentile ranks across the
slate that week. The weights mirror the project specification exactly (Tier 1
60 / Tier 2 20 / Tier 3 15 / Tier 4 5, summing to 100). The home-minus-away
composite is the model's edge signal.

The composite is then *calibrated* to a win probability and a point margin with
a logistic / linear fit that is trained ONLY on past games inside the
walk-forward loop — so the mapping from "score advantage" to "probability"
never sees the week being predicted.

Every prediction is fully auditable: we keep each feature's home percentile,
away percentile, weight, and weighted contribution to the edge.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, LogisticRegression

from src.utils import LOG, load_config

# feature_key -> (base stat column (without home_/away_), higher_is_better, kind)
# kind: "team"   -> percentile vs the slate using home_<col>/away_<col>
#       "elo"    -> uses home_elo_pre / away_elo_pre
#       "hfa"    -> home field indicator
#       "rest"   -> rest_diff
#       "market" -> market_home_prob
#       "injury" -> injury impact (higher worse)
FEATURE_SPEC: Dict[str, Tuple[str, bool, str]] = {
    "off_epa_play":      ("off_epa_play_form", True, "team"),
    "def_epa_play":      ("def_epa_play_form", False, "team"),
    "off_success":       ("off_success_form", True, "team"),
    "def_success":       ("def_success_form", False, "team"),
    "off_dvoa_proxy":    ("off_dvoa_proxy", True, "team"),
    "def_dvoa_proxy":    ("def_dvoa_proxy", True, "team"),
    "elo":               ("elo_pre", True, "elo"),
    "sos":               ("sos", True, "team"),
    "hfa":               ("hfa", True, "hfa"),
    "rest_travel":       ("rest_diff", True, "rest"),
    "red_zone_td":       ("off_rz_td_rate_form", True, "team"),
    "third_down":        ("off_third_down_rate_form", True, "team"),
    "pressure_rate":     ("def_pressure_rate_form", True, "team"),
    "sack_rate_diff":    ("sack_rate_diff_form", True, "team"),
    "turnover_diff":     ("turnover_diff_form", True, "team"),
    "closing_line_value": ("market_home_prob", True, "market"),
    "injury_impact":     ("injury_impact", False, "injury"),
}


def _pooled_pct(df: pd.DataFrame, home_col: str, away_col: str,
                higher_better: bool) -> Tuple[pd.Series, pd.Series]:
    """Percentile-rank each team (0-100) against the full slate that week."""
    hp = pd.Series(np.nan, index=df.index)
    ap = pd.Series(np.nan, index=df.index)
    for _, g in df.groupby(["season", "week"]):
        pooled = pd.concat([g[home_col], g[away_col]])
        r = pooled.rank(pct=True, na_option="keep")
        if not higher_better:
            r = 1.0 - r
        r = (r * 100.0).fillna(50.0)
        n = len(g)
        hp.loc[g.index] = r.iloc[:n].to_numpy()
        ap.loc[g.index] = r.iloc[n:].to_numpy()
    return hp, ap


def compute_composite(features: pd.DataFrame) -> pd.DataFrame:
    """Add home/away composite scores, composite_adv, and per-feature contribs.

    Pure function of within-week cross-sections (all pre-kickoff) — safe to run
    on the whole frame at once.
    """
    weights = load_config()["composite_weights"]
    total_w = sum(weights.values())  # == 100 by spec
    df = features.copy()

    home_score = pd.Series(0.0, index=df.index)
    away_score = pd.Series(0.0, index=df.index)
    contrib_cols: List[str] = []

    for key, (col, higher, kind) in FEATURE_SPEC.items():
        w = weights[key]
        if kind == "team":
            hp, ap = _pooled_pct(df, f"home_{col}", f"away_{col}", higher)
        elif kind == "elo":
            hp, ap = _pooled_pct(df, "home_elo_pre", "away_elo_pre", True)
        elif kind == "hfa":
            hp = 50.0 + 50.0 * df["hfa"].fillna(1.0)
            ap = 50.0 - 50.0 * df["hfa"].fillna(1.0)
        elif kind == "rest":
            scaled = (df["rest_diff"].clip(-7, 7).fillna(0) / 7.0) * 50.0
            hp, ap = 50.0 + scaled, 50.0 - scaled
        elif kind == "market":
            mhp = df["market_home_prob"].fillna(0.5)
            tmp = df.assign(_h=mhp, _a=1 - mhp)
            hp, ap = _pooled_pct(tmp, "_h", "_a", True)
        elif kind == "injury":
            hp, ap = _pooled_pct(df, "home_injury_impact", "away_injury_impact", higher)
        else:  # pragma: no cover
            continue

        home_score += (w / total_w) * hp
        away_score += (w / total_w) * ap
        contrib = (w / total_w) * (hp - ap)
        df[f"contrib_{key}"] = contrib
        contrib_cols.append(f"contrib_{key}")

    df["home_composite"] = home_score
    df["away_composite"] = away_score
    df["composite_adv"] = home_score - away_score   # positive favors home
    df["epa_diff"] = (df["home_off_epa_play_form"] - df["home_def_epa_play_form"]) - \
                     (df["away_off_epa_play_form"] - df["away_def_epa_play_form"])
    df["dvoa_proxy_diff"] = (df["home_off_dvoa_proxy"] + df["home_def_dvoa_proxy"]) - \
                            (df["away_off_dvoa_proxy"] + df["away_def_dvoa_proxy"])
    df.attrs["contrib_cols"] = contrib_cols
    return df


@dataclass
class CompositeModel:
    """Calibrates composite_adv -> win probability + point margin (walk-forward)."""
    name: str = "composite_baseline"
    _logit: LogisticRegression = field(default=None, repr=False)
    _linear: LinearRegression = field(default=None, repr=False)
    _fallback_prob: float = 0.5

    def fit(self, train: pd.DataFrame) -> "CompositeModel":
        d = train.dropna(subset=["composite_adv", "home_win"])
        d = d[d["home_win"].isin([0.0, 1.0])]  # drop ties for classification
        if len(d) < 30 or d["home_win"].nunique() < 2:
            self._fallback_prob = float(d["home_win"].mean()) if len(d) else 0.5
            self._logit = None
            return self
        X = d[["composite_adv"]].to_numpy()
        self._logit = LogisticRegression(max_iter=1000)
        self._logit.fit(X, d["home_win"].astype(int))
        m = train.dropna(subset=["composite_adv", "result"])
        self._linear = LinearRegression().fit(m[["composite_adv"]], m["result"])
        return self

    def predict(self, week: pd.DataFrame) -> pd.DataFrame:
        cfg = load_config()["confidence_tiers"]
        out = week.copy()
        X = out[["composite_adv"]].fillna(0.0).to_numpy()
        if self._logit is not None:
            p = self._logit.predict_proba(X)[:, 1]
        else:
            p = np.full(len(out), self._fallback_prob)
        out["home_win_prob"] = p
        out["pred_margin"] = (self._linear.predict(X) if self._linear is not None
                              else out["composite_adv"] * 0.0)
        out["pick_home"] = out["home_win_prob"] >= 0.5
        out["pick_team"] = np.where(out["pick_home"], out["home_team"], out["away_team"])
        out["win_prob"] = np.where(out["pick_home"], p, 1 - p)
        out["confidence"] = out["win_prob"] * 100.0
        out["conf_tier"] = pd.cut(
            out["confidence"],
            bins=[-1, cfg["moderate"], cfg["strong"], cfg["elite"], 1000],
            labels=["Pass", "Moderate", "Strong", "Elite"],
        )
        return out
