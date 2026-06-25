"""Walk-forward ELO ratings (FiveThirtyEight-style).

The ratings are produced by replaying games in strict chronological order and
updating after each game. For any game G we expose the PRE-game ratings of both
teams — i.e. the rating computed from every game strictly before G. That is the
only number a predictor is allowed to see, so ELO is leak-free by construction.

Between seasons each team's rating reverts partway toward the 1500 mean
(`season_regression`), reflecting roster turnover.
"""
from __future__ import annotations

import math
from typing import Dict, List

import numpy as np
import pandas as pd

from src.utils import load_config


def _expected(r_a: float, r_b: float) -> float:
    return 1.0 / (1.0 + 10 ** ((r_b - r_a) / 400.0))


def _mov_multiplier(margin: int, elo_diff: float) -> float:
    """Margin-of-victory multiplier; dampens autocorrelation for favorites."""
    return math.log(abs(margin) + 1.0) * (2.2 / ((elo_diff * 0.001) + 2.2))


def compute_elo(games: pd.DataFrame) -> pd.DataFrame:
    """Return per-game pre-game ELO for home and away teams.

    Output columns: game_id, home_elo_pre, away_elo_pre, home_elo_post,
    away_elo_post. Only the *_pre columns are safe as features.
    """
    cfg = load_config()["features"]["elo"]
    base = cfg["base"]
    k = cfg["k"]
    hfa = cfg["hfa_points"]
    use_mov = cfg["mov_mult"]
    regress = cfg["season_regression"]

    ratings: Dict[str, float] = {}
    last_season: Dict[str, int] = {}
    rows: List[dict] = []

    g = games.sort_values(["season", "week", "kickoff", "game_id"])
    for _, row in g.iterrows():
        h, a = row["home_team"], row["away_team"]
        season = int(row["season"])

        for team in (h, a):
            if team not in ratings:
                ratings[team] = base
                last_season[team] = season
            elif last_season[team] != season:
                # between-season regression toward the mean
                ratings[team] = base + (1 - regress) * (ratings[team] - base)
                last_season[team] = season

        rh, ra = ratings[h], ratings[a]
        # Home-field advantage applied to expectation only.
        exp_h = _expected(rh + hfa, ra)

        rec = {"game_id": row["game_id"], "home_elo_pre": rh, "away_elo_pre": ra}

        if bool(row.get("played", pd.notna(row.get("home_score")))) and pd.notna(row.get("result")):
            margin = float(row["result"])  # home - away
            s_h = 1.0 if margin > 0 else (0.5 if margin == 0 else 0.0)
            elo_diff = (rh + hfa) - ra
            mult = _mov_multiplier(margin, elo_diff if margin > 0 else -elo_diff) if use_mov else 1.0
            shift = k * mult * (s_h - exp_h)
            ratings[h] = rh + shift
            ratings[a] = ra - shift
        rec["home_elo_post"] = ratings[h]
        rec["away_elo_post"] = ratings[a]
        rows.append(rec)

    return pd.DataFrame(rows)
