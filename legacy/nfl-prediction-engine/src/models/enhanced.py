"""Enhanced (V2) model — gradient-boosted learner over a richer feature set.

It consumes the same point-in-time features as the baseline plus the V2
additions the spec asks for, where the underlying data exists:

  * Explosive play rate (off & def)            -> off/def_explosive_rate_form
  * Pass-block / pressure proxies              -> sack_rate_diff, pressure_rate
  * Weather impact                             -> temp, wind, dome indicator
  * Market resistance / closing-line efficiency-> market_home_prob, spread_line
  * Injury severity                            -> injury_impact (QB-weighted)
  * Composite edge from the baseline model     -> composite_adv

Items the spec lists that have no reliable free historical feed (Pass-Block Win
Rate, Run-Stop Win Rate as charted by PFF, QB VOR/EPA-VOR, coaching stability)
are approximated from pbp or flagged unavailable in the model card — never
fabricated and never sourced from the future.

Backend: LightGBM/XGBoost if installed, otherwise scikit-learn
HistGradientBoosting. The estimator is refit each walk-forward step on past
games only.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List

import numpy as np
import pandas as pd
from sklearn.ensemble import (HistGradientBoostingClassifier,
                              HistGradientBoostingRegressor)

from src.utils import LOG, load_config

# Differential / matchup feature columns fed to the learner.
ENHANCED_FEATURES: List[str] = [
    "composite_adv", "epa_diff", "dvoa_proxy_diff",
    "home_off_epa_play_form", "away_off_epa_play_form",
    "home_def_epa_play_form", "away_def_epa_play_form",
    "home_off_success_form", "away_off_success_form",
    "home_def_success_form", "away_def_success_form",
    "home_off_explosive_rate_form", "away_off_explosive_rate_form",
    "home_def_explosive_rate_form", "away_def_explosive_rate_form",
    "home_off_rz_td_rate_form", "away_off_rz_td_rate_form",
    "home_off_third_down_rate_form", "away_off_third_down_rate_form",
    "home_def_pressure_rate_form", "away_def_pressure_rate_form",
    "home_sack_rate_diff_form", "away_sack_rate_diff_form",
    "home_turnover_diff_form", "away_turnover_diff_form",
    "home_sos", "away_sos",
    "home_elo_pre", "away_elo_pre",
    "rest_diff", "hfa", "is_dome", "temp", "wind",
    "market_home_prob", "spread_line",
    "home_injury_impact", "away_injury_impact",
    "home_qb_injury", "away_qb_injury",
]


def available_features(df: pd.DataFrame) -> List[str]:
    return [c for c in ENHANCED_FEATURES if c in df.columns]


@dataclass
class EnhancedModel:
    name: str = "enhanced_gbm"
    feature_cols: List[str] = field(default_factory=list)
    _clf: object = field(default=None, repr=False)
    _reg: object = field(default=None, repr=False)
    _fallback_prob: float = 0.5

    def _make_estimators(self):
        seed = load_config().get("random_seed", 42)
        try:
            import lightgbm as lgb  # noqa
            clf = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.03,
                                     num_leaves=31, subsample=0.8,
                                     colsample_bytree=0.8, random_state=seed,
                                     verbose=-1)
            reg = lgb.LGBMRegressor(n_estimators=300, learning_rate=0.03,
                                    num_leaves=31, subsample=0.8,
                                    colsample_bytree=0.8, random_state=seed,
                                    verbose=-1)
            return clf, reg, "lightgbm"
        except Exception:
            pass
        try:
            import xgboost as xgb  # noqa
            clf = xgb.XGBClassifier(n_estimators=300, learning_rate=0.03,
                                    max_depth=4, subsample=0.8,
                                    colsample_bytree=0.8, random_state=seed,
                                    eval_metric="logloss", verbosity=0)
            reg = xgb.XGBRegressor(n_estimators=300, learning_rate=0.03,
                                   max_depth=4, subsample=0.8,
                                   colsample_bytree=0.8, random_state=seed,
                                   verbosity=0)
            return clf, reg, "xgboost"
        except Exception:
            pass
        clf = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.05,
                                             max_depth=4, random_state=seed)
        reg = HistGradientBoostingRegressor(max_iter=300, learning_rate=0.05,
                                            max_depth=4, random_state=seed)
        return clf, reg, "sklearn-hgb"

    def fit(self, train: pd.DataFrame) -> "EnhancedModel":
        if not self.feature_cols:
            self.feature_cols = available_features(train)
        d = train.dropna(subset=["home_win"])
        d = d[d["home_win"].isin([0.0, 1.0])]
        if len(d) < 60 or d["home_win"].nunique() < 2:
            self._fallback_prob = float(d["home_win"].mean()) if len(d) else 0.5
            self._clf = None
            return self
        X = d[self.feature_cols].astype(float)
        clf, reg, backend = self._make_estimators()
        self._backend = backend
        clf.fit(X, d["home_win"].astype(int))
        m = train.dropna(subset=["result"])
        reg.fit(m[self.feature_cols].astype(float), m["result"])
        self._clf, self._reg = clf, reg
        return self

    def predict(self, week: pd.DataFrame) -> pd.DataFrame:
        cfg = load_config()["confidence_tiers"]
        out = week.copy()
        X = out[self.feature_cols].astype(float)
        if self._clf is not None:
            p = self._clf.predict_proba(X)[:, 1]
            margin = self._reg.predict(X)
        else:
            p = np.full(len(out), self._fallback_prob)
            margin = np.zeros(len(out))
        out["home_win_prob"] = p
        out["pred_margin"] = margin
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
