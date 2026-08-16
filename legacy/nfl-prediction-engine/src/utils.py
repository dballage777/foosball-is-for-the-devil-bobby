"""Shared utilities: config loading, paths, logging, small numeric helpers.

Nothing in here knows anything about football — it is pure plumbing so the
rest of the codebase stays focused on modeling and leakage control.
"""
from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict

import numpy as np
import pandas as pd
import yaml

# Repository root = parent of the `src` package directory.
ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "config.yaml"


@lru_cache(maxsize=1)
def load_config(path: str | os.PathLike | None = None) -> Dict[str, Any]:
    """Load and cache the YAML config."""
    p = Path(path) if path else CONFIG_PATH
    with open(p, "r") as fh:
        cfg = yaml.safe_load(fh)
    return cfg


def get_path(key: str) -> Path:
    """Resolve a configured directory (creating it if needed)."""
    cfg = load_config()
    rel = cfg["paths"][key]
    out = ROOT / rel
    out.mkdir(parents=True, exist_ok=True)
    return out


def setup_logger(name: str = "nfl") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        fmt = logging.Formatter("%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
                                 datefmt="%H:%M:%S")
        handler.setFormatter(fmt)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        logger.propagate = False
    return logger


LOG = setup_logger()


@dataclass(frozen=True, order=True)
class WeekKey:
    """A (season, week) pair with chronological ordering."""
    season: int
    week: int

    def __str__(self) -> str:  # pragma: no cover - cosmetic
        return f"{self.season}-W{self.week:02d}"


def all_weeks(games: pd.DataFrame) -> list[WeekKey]:
    """Distinct (season, week) keys present in a games frame, sorted in time."""
    keys = (
        games[["season", "week"]]
        .drop_duplicates()
        .sort_values(["season", "week"])
        .itertuples(index=False)
    )
    return [WeekKey(int(s), int(w)) for s, w in keys]


def safe_div(num: float, den: float, default: float = np.nan) -> float:
    """Division that returns `default` instead of raising / inf on a zero den."""
    if den is None or den == 0 or pd.isna(den):
        return default
    return num / den


def american_to_prob(odds: float) -> float:
    """Convert American moneyline odds to implied probability (with vig)."""
    if pd.isna(odds):
        return np.nan
    odds = float(odds)
    if odds < 0:
        return (-odds) / ((-odds) + 100.0)
    return 100.0 / (odds + 100.0)


def american_to_decimal(odds: float) -> float:
    """Convert American odds to decimal payout multiplier (profit per 1 staked)."""
    if pd.isna(odds):
        return np.nan
    odds = float(odds)
    if odds < 0:
        return 100.0 / (-odds)
    return odds / 100.0


def zscore(s: pd.Series) -> pd.Series:
    """Z-score a series, robust to zero variance (returns zeros)."""
    sd = s.std(ddof=0)
    if sd == 0 or pd.isna(sd):
        return pd.Series(np.zeros(len(s)), index=s.index)
    return (s - s.mean()) / sd


def set_global_seed(seed: int | None = None) -> int:
    cfg = load_config()
    seed = cfg.get("random_seed", 42) if seed is None else seed
    np.random.seed(seed)
    return seed
