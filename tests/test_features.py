"""Feature/model sanity tests that don't require network access."""
from __future__ import annotations

import numpy as np
import pandas as pd

from src.utils import american_to_decimal, american_to_prob, safe_div, zscore


def test_american_to_prob():
    assert american_to_prob(-110) > 0.5
    assert american_to_prob(+100) == 0.5
    assert abs(american_to_prob(-200) - 2 / 3) < 1e-9


def test_american_to_decimal():
    assert american_to_decimal(+100) == 1.0
    assert american_to_decimal(-200) == 0.5


def test_safe_div():
    assert np.isnan(safe_div(1, 0))
    assert safe_div(10, 2) == 5


def test_zscore_zero_variance():
    s = pd.Series([3.0, 3.0, 3.0])
    assert (zscore(s) == 0).all()


def test_elo_is_pre_game_only():
    """Pre-game ELO of a game must equal post-game ELO of the prior game."""
    from src.features.elo import compute_elo
    games = pd.DataFrame({
        "game_id": ["g1", "g2"],
        "season": [2021, 2021],
        "week": [1, 2],
        "kickoff": pd.to_datetime(["2021-09-12", "2021-09-19"]),
        "home_team": ["A", "A"],
        "away_team": ["B", "C"],
        "home_score": [24, 17],
        "away_score": [20, 21],
        "result": [4, -4],
        "played": [True, True],
    })
    elo = compute_elo(games).set_index("game_id")
    # A's pre-game ELO in week 2 == A's post-game ELO from week 1
    assert elo.loc["g2", "home_elo_pre"] == elo.loc["g1", "home_elo_post"]
