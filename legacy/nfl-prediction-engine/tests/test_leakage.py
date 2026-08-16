"""Leakage / point-in-time correctness tests.

These run on the built feature matrix when present (the real pipeline), and on
synthetic data otherwise, so `pytest` is meaningful even on a fresh clone.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import pytest

from src.features.build_features import _prior_aggregates
from src.utils import ROOT

FEATS = ROOT / "features" / "game_features_composite.parquet"


def test_prior_aggregates_exclude_current_game():
    """Season-to-date form must NOT include the current game's own stats."""
    df = pd.DataFrame({
        "team": ["A", "A", "A", "A"],
        "season": [2021, 2021, 2021, 2021],
        "week": [1, 2, 3, 4],
        "opponent": ["B", "C", "D", "E"],
        "kickoff": pd.to_datetime(["2021-09-12", "2021-09-19",
                                   "2021-09-26", "2021-10-03"]),
        "off_epa_play": [0.1, 0.2, 0.3, 0.4],
    })
    for c in ["def_epa_play", "off_success", "def_success",
              "off_explosive_rate", "def_explosive_rate", "off_rz_td_rate",
              "def_rz_td_rate", "off_third_down_rate", "def_third_down_rate",
              "def_pressure_rate", "sack_rate_diff", "turnover_diff",
              "points_for", "points_against"]:
        df[c] = 0.0
    out = _prior_aggregates(df).sort_values("week")
    # week 1 has no history -> NaN season-to-date
    assert np.isnan(out.iloc[0]["off_epa_play_std"])
    # week 3 season-to-date == mean of weeks 1,2 = 0.15 (NOT including week 3)
    assert out.iloc[2]["off_epa_play_std"] == pytest.approx(0.15)
    # week 4 season-to-date == mean of weeks 1,2,3 = 0.2
    assert out.iloc[3]["off_epa_play_std"] == pytest.approx(0.2)


@pytest.mark.skipif(not FEATS.exists(), reason="run the pipeline first")
def test_no_feature_references_future():
    f = pd.read_parquet(FEATS)
    f["kickoff"] = pd.to_datetime(f["kickoff"])
    f["max_feature_date"] = pd.to_datetime(f["max_feature_date"])
    has_hist = f["max_feature_date"].notna()
    leaked = f[has_hist & (f["max_feature_date"] >= f["kickoff"])]
    assert len(leaked) == 0, f"{len(leaked)} games reference data at/after kickoff"


@pytest.mark.skipif(not FEATS.exists(), reason="run the pipeline first")
def test_composite_weights_sum_to_100():
    from src.utils import load_config
    assert sum(load_config()["composite_weights"].values()) == 100
