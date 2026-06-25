"""Data ingestion — pull real NFL data from nflverse and cache it locally.

Sources (all public, reproducible, free):
  * play-by-play : nflverse-data release assets  (EPA, success, situational)
  * games/lines  : nflverse `nfldata/games.csv`   (scores + closing Vegas lines)
  * injuries     : nflverse-data release assets   (weekly pre-game reports)

Why a hand-rolled downloader instead of `nfl_data_py`?  The release assets
302-redirect to a signed CDN host, and some HTTP stacks mishandle that redirect
in restricted network environments. `requests` with `allow_redirects=True`
handles it cleanly, and downloading the raw files ourselves keeps the data
provenance fully auditable (every file lands in data/raw with a source record).

Nothing here looks at outcomes or lines in a way that could leak — it only
fetches and caches. Point-in-time discipline is enforced later in feature land.
"""
from __future__ import annotations

import io
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, List

import pandas as pd
import requests

from src.utils import LOG, get_path, load_config

_SESSION = requests.Session()
_SESSION.headers.update({"User-Agent": "nfl-prediction-engine/1.0 (+research)"})


def _download(url: str, dest: Path, force: bool = False) -> Path:
    """Download `url` to `dest` (cached). Returns the local path."""
    if dest.exists() and not force:
        LOG.info("cache hit  %s", dest.name)
        return dest
    LOG.info("downloading %s", url)
    resp = _SESSION.get(url, timeout=180, allow_redirects=True)
    resp.raise_for_status()
    dest.write_bytes(resp.content)
    LOG.info("saved %s (%.1f MB)", dest.name, len(resp.content) / 1e6)
    return dest


def _record_source(name: str, url: str, rows: int, dest: Path) -> dict:
    return {
        "dataset": name,
        "url": url,
        "rows": int(rows),
        "local_file": str(dest.relative_to(get_path("raw").parent.parent)),
        "downloaded_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }


def fetch_pbp(seasons: Iterable[int], force: bool = False) -> pd.DataFrame:
    """Fetch + concatenate play-by-play parquet for the given seasons."""
    cfg = load_config()
    raw = get_path("raw")
    template = cfg["data_sources"]["pbp_url"]
    frames, sources = [], []
    for yr in seasons:
        url = template.format(season=yr)
        dest = raw / f"pbp_{yr}.parquet"
        _download(url, dest, force=force)
        df = pd.read_parquet(dest)
        frames.append(df)
        sources.append(_record_source(f"pbp_{yr}", url, len(df), dest))
    _append_sources(sources)
    out = pd.concat(frames, ignore_index=True)
    LOG.info("pbp loaded: %d plays across %d seasons", len(out), len(frames))
    return out


def fetch_games(force: bool = False) -> pd.DataFrame:
    """Fetch the master games/lines file (all seasons in one csv)."""
    cfg = load_config()
    raw = get_path("raw")
    url = cfg["data_sources"]["games_url"]
    dest = raw / "games.csv"
    _download(url, dest, force=force)
    df = pd.read_csv(dest, low_memory=False)
    _append_sources([_record_source("games", url, len(df), dest)])
    LOG.info("games loaded: %d rows (%d-%d)", len(df), df.season.min(), df.season.max())
    return df


def fetch_injuries(seasons: Iterable[int], force: bool = False) -> pd.DataFrame:
    """Fetch weekly injury reports. Tolerant: missing seasons are skipped."""
    cfg = load_config()
    raw = get_path("raw")
    template = cfg["data_sources"]["injuries_url"]
    frames, sources = [], []
    for yr in seasons:
        url = template.format(season=yr)
        dest = raw / f"injuries_{yr}.parquet"
        try:
            _download(url, dest, force=force)
            df = pd.read_parquet(dest)
            frames.append(df)
            sources.append(_record_source(f"injuries_{yr}", url, len(df), dest))
        except Exception as exc:  # noqa: BLE001 - injuries are a best-effort feed
            LOG.warning("injuries %s unavailable (%s) — flagged missing", yr, exc)
    if not frames:
        return pd.DataFrame()
    _append_sources(sources)
    out = pd.concat(frames, ignore_index=True)
    LOG.info("injuries loaded: %d weekly report rows", len(out))
    return out


def _append_sources(records: List[dict]) -> None:
    """Maintain reports/data_sources.json so every run documents its inputs."""
    rpt = get_path("reports") / "data_sources.json"
    existing = {}
    if rpt.exists():
        existing = {r["dataset"]: r for r in json.loads(rpt.read_text())}
    for r in records:
        existing[r["dataset"]] = r
    rpt.write_text(json.dumps(list(existing.values()), indent=2))


# --------------------------------------------------------------------------- #
# Processed games table
# --------------------------------------------------------------------------- #
GAME_COLS = [
    "game_id", "season", "game_type", "week", "gameday", "weekday", "gametime",
    "away_team", "home_team", "away_score", "home_score", "result", "total",
    "overtime", "old_game_id", "away_rest", "home_rest", "div_game",
    "roof", "surface", "temp", "wind", "location", "stadium",
    "spread_line", "away_spread_odds", "home_spread_odds",
    "total_line", "under_odds", "over_odds", "away_moneyline", "home_moneyline",
]


def build_processed_games(games: pd.DataFrame, seasons: Iterable[int]) -> pd.DataFrame:
    """Slim, typed games table restricted to seasons of interest.

    `result` is home_score - away_score. `spread_line` is the home spread
    expressed as points home is favored by (positive = home favored), matching
    nflverse convention. We do NOT impute missing scores or lines — missing
    stays missing and is flagged downstream (never estimated from the future).
    """
    seasons = set(int(s) for s in seasons)
    g = games[games.season.isin(seasons)].copy()
    keep = [c for c in GAME_COLS if c in g.columns]
    g = g[keep].copy()
    g["gameday"] = pd.to_datetime(g["gameday"], errors="coerce")
    # kickoff timestamp: combine gameday + gametime when present (UTC-naive, local)
    g["kickoff"] = pd.to_datetime(
        g["gameday"].dt.strftime("%Y-%m-%d") + " " + g["gametime"].fillna("13:00"),
        errors="coerce",
    )
    g["kickoff"] = g["kickoff"].fillna(g["gameday"])
    for c in ["home_score", "away_score", "result", "spread_line", "total_line",
              "away_moneyline", "home_moneyline", "home_rest", "away_rest",
              "temp", "wind"]:
        if c in g.columns:
            g[c] = pd.to_numeric(g[c], errors="coerce")
    g["played"] = g["home_score"].notna() & g["away_score"].notna()
    g["home_win"] = (g["result"] > 0).astype("float")
    g.loc[g["result"] == 0, "home_win"] = 0.5  # ties
    g.loc[~g["played"], "home_win"] = pd.NA
    g = g.sort_values(["season", "week", "kickoff", "game_id"]).reset_index(drop=True)
    out = get_path("processed") / "games.parquet"
    g.to_parquet(out, index=False)
    LOG.info("processed games written: %d rows -> %s", len(g), out.name)
    return g


def run_ingestion(force: bool = False) -> dict:
    """Top-level ingestion entrypoint. Returns the in-memory frames."""
    cfg = load_config()
    seasons = sorted(set(cfg["seasons"]["warmup"]) | set(cfg["seasons"]["evaluate"]))
    LOG.info("=== INGESTION: seasons %s ===", seasons)
    pbp = fetch_pbp(seasons, force=force)
    games_all = fetch_games(force=force)
    injuries = fetch_injuries(seasons, force=force)
    games = build_processed_games(games_all, seasons)
    # Persist pbp slim cache for fast feature rebuilds.
    pbp.to_parquet(get_path("processed") / "pbp.parquet", index=False)
    if not injuries.empty:
        injuries.to_parquet(get_path("processed") / "injuries.parquet", index=False)
    return {"pbp": pbp, "games": games, "injuries": injuries}


if __name__ == "__main__":  # pragma: no cover
    run_ingestion()
