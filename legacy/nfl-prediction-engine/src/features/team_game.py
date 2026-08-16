"""Collapse play-by-play into one row per (team, game): the atomic unit that
every point-in-time feature is later built from.

Each row holds that single game's OFFENSIVE production for the team and the
DEFENSIVE production it allowed, plus enough metadata (date, opponent, home
flag, points) to do opponent adjustment and rolling windows later.

Crucially this module computes *per-game* values only. It performs NO
aggregation across games and looks at NO future information — a team-game row
depends solely on the plays of that one game. All time-ordering and history
windows happen in build_features.py.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from src.utils import LOG, get_path, safe_div

# A "scrimmage play" for efficiency purposes: pass or run with a defined EPA,
# excluding two-point conversions and aborted plays (kept out of rate stats).
def _scrimmage(pbp: pd.DataFrame) -> pd.DataFrame:
    m = (
        pbp["play_type"].isin(["pass", "run"])
        & pbp["epa"].notna()
        & (pbp.get("two_point_attempt", 0).fillna(0) == 0)
        & (pbp.get("aborted_play", 0).fillna(0) == 0)
    )
    return pbp[m].copy()


def _explosive(df: pd.DataFrame) -> pd.Series:
    """Explosive play = pass gain >= 20 yds or rush gain >= 10 yds."""
    yards = df["yards_gained"].fillna(0)
    is_pass = df["pass"].fillna(0) == 1
    return ((is_pass & (yards >= 20)) | (~is_pass & (yards >= 10))).astype(int)


def _side_stats(plays: pd.DataFrame, team_col: str, prefix: str) -> pd.DataFrame:
    """Aggregate efficiency stats grouped by game and `team_col` (posteam/defteam).

    `prefix` is "off" when team_col is the offense, "def" when team_col is the
    defense (i.e. these are stats the defense ALLOWED).
    """
    p = plays.copy()
    p["explosive"] = _explosive(p)
    p["dropback"] = p.get("qb_dropback", p["pass"]).fillna(0)
    p["is_pass"] = (p["pass"].fillna(0) == 1).astype(int)
    p["is_rush"] = (p["rush"].fillna(0) == 1).astype(int)
    p["redzone"] = (p["yardline_100"].fillna(99) <= 20).astype(int)
    p["sack"] = p["sack"].fillna(0)
    p["qb_hit"] = p.get("qb_hit", 0).fillna(0)
    p["third_att"] = (p["down"] == 3).astype(int)
    p["third_conv"] = p.get("third_down_converted", 0).fillna(0)
    p["turnover"] = (
        (p.get("interception", 0).fillna(0) == 1)
        | (p.get("fumble_lost", 0).fillna(0) == 1)
    ).astype(int)

    grp = p.groupby(["game_id", team_col], observed=True)
    agg = grp.agg(
        plays=("epa", "size"),
        epa_play=("epa", "mean"),
        success=("success", "mean"),
        pass_epa=("epa", lambda s: s[p.loc[s.index, "is_pass"] == 1].mean()),
        rush_epa=("epa", lambda s: s[p.loc[s.index, "is_rush"] == 1].mean()),
        explosive_rate=("explosive", "mean"),
        dropbacks=("dropback", "sum"),
        sacks=("sack", "sum"),
        pressures=("qb_hit", "sum"),
        third_att=("third_att", "sum"),
        third_conv=("third_conv", "sum"),
        rz_plays=("redzone", "sum"),
        turnovers=("turnover", "sum"),
    )
    agg["third_down_rate"] = agg.apply(lambda r: safe_div(r.third_conv, r.third_att), axis=1)
    agg["sack_rate"] = agg.apply(lambda r: safe_div(r.sacks, r.dropbacks), axis=1)
    agg["pressure_rate"] = agg.apply(lambda r: safe_div(r.pressures, r.dropbacks), axis=1)
    agg = agg.rename(columns={"game_id": "game_id"}).reset_index()
    agg = agg.rename(columns={team_col: "team"})
    keep = ["game_id", "team", "plays", "epa_play", "success", "pass_epa",
            "rush_epa", "explosive_rate", "third_down_rate", "sack_rate",
            "pressure_rate", "rz_plays", "turnovers", "sacks", "dropbacks"]
    agg = agg[keep]
    agg.columns = ["game_id", "team"] + [f"{prefix}_{c}" for c in keep[2:]]
    return agg


def _redzone_td(pbp: pd.DataFrame, team_col: str, prefix: str) -> pd.DataFrame:
    """Red-zone TD rate = red-zone drives ending in a TD / red-zone drives.

    Drive-level, so a team isn't double counted for multiple red-zone plays on
    one possession.
    """
    rz = pbp[(pbp["yardline_100"].fillna(99) <= 20) & pbp[team_col].notna()].copy()
    if rz.empty:
        return pd.DataFrame(columns=["game_id", "team", f"{prefix}_rz_td_rate"])
    rz["drive_key"] = rz["game_id"].astype(str) + "_" + rz["fixed_drive"].astype(str)
    rz["td_here"] = ((rz.get("touchdown", 0).fillna(0) == 1) &
                     (rz.get("td_team") == rz[team_col])).astype(int)
    drive = rz.groupby(["game_id", team_col, "drive_key"], observed=True)["td_here"].max()
    drive = drive.reset_index()
    out = drive.groupby(["game_id", team_col], observed=True)["td_here"].mean().reset_index()
    out.columns = ["game_id", "team", f"{prefix}_rz_td_rate"]
    return out


def build_team_game(pbp: pd.DataFrame, games: pd.DataFrame) -> pd.DataFrame:
    """Return one row per (game_id, team) with offense + defense-allowed stats."""
    plays = _scrimmage(pbp)

    off = _side_stats(plays, "posteam", "off")
    deff = _side_stats(plays, "defteam", "def")  # stats the defense ALLOWED
    off_rz = _redzone_td(pbp, "posteam", "off")
    def_rz = _redzone_td(pbp, "defteam", "def")

    tg = off.merge(deff, on=["game_id", "team"], how="outer")
    tg = tg.merge(off_rz, on=["game_id", "team"], how="left")
    tg = tg.merge(def_rz, on=["game_id", "team"], how="left")

    # Attach game metadata (date, opponent, home flag, points, season/week).
    meta = games[["game_id", "season", "week", "kickoff", "gameday",
                  "home_team", "away_team", "home_score", "away_score"]].copy()
    long = []
    for _, r in meta.iterrows():
        long.append((r.game_id, r.home_team, r.away_team, 1, r.home_score, r.away_score,
                     r.season, r.week, r.kickoff, r.gameday))
        long.append((r.game_id, r.away_team, r.home_team, 0, r.away_score, r.home_score,
                     r.season, r.week, r.kickoff, r.gameday))
    meta_long = pd.DataFrame(long, columns=[
        "game_id", "team", "opponent", "is_home", "points_for", "points_against",
        "season", "week", "kickoff", "gameday"])

    tg = meta_long.merge(tg, on=["game_id", "team"], how="left")
    tg["won"] = (tg["points_for"] > tg["points_against"]).astype(float)
    tg.loc[tg["points_for"] == tg["points_against"], "won"] = 0.5
    # turnover differential at the team-game level (takeaways - giveaways)
    tg["turnover_diff"] = tg["def_turnovers"].fillna(0) - tg["off_turnovers"].fillna(0)
    # sack-rate differential (defense sack rate forced - offense sack rate allowed)
    tg["sack_rate_diff"] = tg["def_sack_rate"].fillna(0) - tg["off_sack_rate"].fillna(0)
    tg = tg.sort_values(["kickoff", "game_id", "team"]).reset_index(drop=True)

    out = get_path("processed") / "team_game.parquet"
    tg.to_parquet(out, index=False)
    LOG.info("team_game built: %d team-games -> %s", len(tg), out.name)
    return tg
