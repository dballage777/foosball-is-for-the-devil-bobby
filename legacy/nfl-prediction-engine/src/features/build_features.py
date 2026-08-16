"""Point-in-time feature engineering — the heart of the leakage discipline.

For every scheduled game we build a feature row using ONLY information that
existed before kickoff:

  * team efficiency form (season-to-date, rolling-4, rolling-8, weighted recent)
    computed from team-games that finished strictly before this kickoff;
  * opponent-adjusted efficiency and a documented DVOA *proxy*;
  * walk-forward ELO (pre-game ratings only);
  * strength of schedule, rest/travel, home field;
  * situational efficiency (red zone, third down, pressure, sacks, turnovers);
  * market features (the closing line for THIS game is pre-kickoff info) and an
    injury-impact score from reports filed before kickoff.

Every row also records `max_feature_date` — the latest event date any feature
depended on — which the leakage auditor checks against kickoff.
"""
from __future__ import annotations

from typing import Dict, List

import numpy as np
import pandas as pd

from src.features.elo import compute_elo
from src.utils import LOG, get_path, load_config, safe_div, zscore

# Per-game team stats that we roll forward into "form".
STAT_COLS = [
    "off_epa_play", "def_epa_play", "off_success", "def_success",
    "off_explosive_rate", "def_explosive_rate",
    "off_rz_td_rate", "def_rz_td_rate",
    "off_third_down_rate", "def_third_down_rate",
    "def_pressure_rate", "sack_rate_diff", "turnover_diff",
    "points_for", "points_against",
]


# --------------------------------------------------------------------------- #
# Step 1 — prior-only rolling aggregates per team-game
# --------------------------------------------------------------------------- #
def _prior_aggregates(tg: pd.DataFrame) -> pd.DataFrame:
    """Attach season-to-date / rolling / weighted form built ONLY from games
    that finished before each team-game (shift(1) guarantees exclusion of the
    current game)."""
    cfg = load_config()["features"]
    hl = cfg["ewm_halflife"]
    g = tg.sort_values(["team", "kickoff"]).copy()
    by_team = g.groupby("team", group_keys=False)
    by_team_season = g.groupby(["team", "season"], group_keys=False)

    # number of games already played this season before this row
    g["gp_season"] = by_team_season.cumcount()
    # number of games played overall before this row
    g["gp_total"] = by_team.cumcount()

    for stat in STAT_COLS:
        g[f"{stat}_std"] = by_team_season[stat].apply(
            lambda s: s.expanding(min_periods=1).mean().shift(1))
        g[f"{stat}_r4"] = by_team[stat].apply(
            lambda s: s.rolling(4, min_periods=1).mean().shift(1))
        g[f"{stat}_r8"] = by_team[stat].apply(
            lambda s: s.rolling(8, min_periods=1).mean().shift(1))
        g[f"{stat}_wtd"] = by_team[stat].apply(
            lambda s: s.ewm(halflife=hl, min_periods=1).mean().shift(1))
        # Primary "form" value: season-to-date once a team has >=3 games,
        # otherwise lean on recent-8 (which may cross the offseason) so Week 1
        # is informed rather than empty. Final fallback is weighted recent.
        std, r8, wtd = g[f"{stat}_std"], g[f"{stat}_r8"], g[f"{stat}_wtd"]
        primary = std.where(g["gp_season"] >= 3, r8)
        primary = primary.fillna(r8).fillna(wtd)
        g[f"{stat}_form"] = primary

    # latest prior team-game date this row's form depends on
    g["prior_max_date"] = by_team["kickoff"].apply(lambda s: s.shift(1).cummax())
    return g


# --------------------------------------------------------------------------- #
# Step 2 — opponent adjustment + strength of schedule (leak-free)
# --------------------------------------------------------------------------- #
def _opponent_adjustment(g: pd.DataFrame) -> pd.DataFrame:
    """Schedule-adjust offense/defense using opponents' season-to-date form as
    of the SAME week (all strictly pre-kickoff), and compute SoS.

    adj_off = off_form - (avg opponent def-allowed form - league mean)
    adj_def = def_form - (avg opponent off form        - league mean)
    sos     = avg opponent net rating faced (relative to league)
    """
    # lookup of each team's as-of-week form, keyed (season, week, team)
    key = g.set_index(["season", "week", "team"])
    off_lk = key["off_epa_play_form"]
    def_lk = key["def_epa_play_form"]

    # league means per (season, week) to center the adjustment
    league = g.groupby(["season", "week"]).agg(
        lg_off=("off_epa_play_form", "mean"),
        lg_def=("def_epa_play_form", "mean"),
    )

    adj_off, adj_def, sos = [], [], []
    # opponents faced so far this season, per team-game
    tg_sorted = g.sort_values(["team", "season", "week"])
    faced: Dict[tuple, List[str]] = {}
    prev_key = None
    opp_hist: List[str] = []
    for _, r in tg_sorted.iterrows():
        cur = (r["team"], r["season"])
        if cur != prev_key:
            opp_hist = []
            prev_key = cur
        faced[(r["team"], r["season"], r["week"])] = list(opp_hist)
        opp_hist.append(r["opponent"])

    for _, r in g.iterrows():
        s, w, t = r["season"], r["week"], r["team"]
        opps = faced.get((t, s, w), [])
        lg = league.loc[(s, w)] if (s, w) in league.index else None
        if not opps or lg is None:
            adj_off.append(r["off_epa_play_form"])
            adj_def.append(r["def_epa_play_form"])
            sos.append(0.0)
            continue
        opp_def = [def_lk.get((s, w, o), np.nan) for o in opps]
        opp_off = [off_lk.get((s, w, o), np.nan) for o in opps]
        opp_def_m = np.nanmean(opp_def) if np.any(~np.isnan(opp_def)) else lg["lg_def"]
        opp_off_m = np.nanmean(opp_off) if np.any(~np.isnan(opp_off)) else lg["lg_off"]
        adj_off.append(r["off_epa_play_form"] - (opp_def_m - lg["lg_def"]))
        # defense: facing strong offenses (high opp_off) should *help* the rating
        adj_def.append(r["def_epa_play_form"] - (opp_off_m - lg["lg_off"]))
        # net opponent quality faced (offense good + defense stingy => strong)
        sos.append((opp_off_m - lg["lg_off"]) - (opp_def_m - lg["lg_def"]))

    g = g.copy()
    g["adj_off_epa"] = adj_off
    g["adj_def_epa"] = adj_def
    g["sos"] = sos
    return g


# --------------------------------------------------------------------------- #
# Step 3 — DVOA proxy (documented, flagged)
# --------------------------------------------------------------------------- #
def _dvoa_proxy(g: pd.DataFrame) -> pd.DataFrame:
    """DVOA PROXY — NOT real Football Outsiders DVOA.

    True historical weekly DVOA snapshots are not freely/reliably available, and
    end-of-season DVOA is forbidden (leakage). We therefore build a transparent
    proxy from already-computed point-in-time inputs only:

        off_dvoa_proxy = z(opponent-adjusted offensive EPA/play)
                         blended with z(offensive success rate)
        def_dvoa_proxy = z(opponent-adjusted defensive EPA allowed) (inverted)
                         blended with z(defensive success allowed)   (inverted)

    Z-scores are computed WITHIN each (season, week) cross-section, so the proxy
    only ever uses contemporaneous, pre-kickoff information. Columns are suffixed
    `_proxy` and flagged in the leakage audit as proxy='True'.
    """
    out = []
    for (_, _), blk in g.groupby(["season", "week"]):
        b = blk.copy()
        off = 0.6 * zscore(b["adj_off_epa"]) + 0.4 * zscore(b["off_success_form"])
        # lower EPA allowed / success allowed is better -> invert
        deff = 0.6 * zscore(-b["adj_def_epa"]) + 0.4 * zscore(-b["def_success_form"])
        b["off_dvoa_proxy"] = off
        b["def_dvoa_proxy"] = deff
        out.append(b)
    return pd.concat(out).sort_index()


# --------------------------------------------------------------------------- #
# Step 4 — assemble per-game matchup features
# --------------------------------------------------------------------------- #
def _injury_impact(games: pd.DataFrame, injuries: pd.DataFrame) -> pd.DataFrame:
    """Per (game_id, team) injury-impact score from pre-game reports.

    Score = weighted count of players ruled Out/Doubtful, with QBs weighted
    heavily. Reports are joined on (season, week, team) — nflverse injury rows
    are the weekly report filed before that week's game, so this is pre-kickoff.
    If the feed is unavailable the score is 0 and `injury_data` is flagged False.
    """
    base = games[["game_id", "season", "week", "home_team", "away_team"]]
    long = pd.concat([
        base.rename(columns={"home_team": "team"})[["game_id", "season", "week", "team"]],
        base.rename(columns={"away_team": "team"})[["game_id", "season", "week", "team"]],
    ], ignore_index=True)
    if injuries is None or injuries.empty:
        long["injury_impact"] = 0.0
        long["qb_injury"] = 0.0
        long["injury_data"] = False
        return long

    inj = injuries.copy()
    inj.columns = [c.lower() for c in inj.columns]
    team_col = "team" if "team" in inj.columns else "club_code"
    status_col = "report_status" if "report_status" in inj.columns else "game_status"
    pos_col = "position" if "position" in inj.columns else "pos"
    for c in (team_col, status_col, pos_col):
        if c not in inj.columns:
            inj[c] = np.nan
    weight = {"Out": 1.0, "Doubtful": 0.6, "Questionable": 0.2}
    inj["w"] = inj[status_col].map(weight).fillna(0.0)
    inj["is_qb"] = (inj[pos_col].astype(str).str.upper() == "QB").astype(float)
    inj["score"] = inj["w"] * np.where(inj["is_qb"] == 1, 4.0, 1.0)
    inj["qb_out"] = inj["w"] * inj["is_qb"]
    agg = inj.groupby(["season", "week", team_col]).agg(
        injury_impact=("score", "sum"),
        qb_injury=("qb_out", "max"),
    ).reset_index().rename(columns={team_col: "team"})
    agg["season"] = agg["season"].astype(int)
    agg["week"] = agg["week"].astype(int)
    long = long.merge(agg, on=["season", "week", "team"], how="left")
    long["injury_impact"] = long["injury_impact"].fillna(0.0)
    long["qb_injury"] = long["qb_injury"].fillna(0.0)
    long["injury_data"] = True
    return long


def _haversine(lat1, lon1, lat2, lon2):
    r = 3959.0  # miles
    p1, p2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dl = np.radians(lon2 - lon1)
    a = np.sin(dphi / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dl / 2) ** 2
    return 2 * r * np.arcsin(np.sqrt(a))


def build_features(tg: pd.DataFrame, games: pd.DataFrame,
                   injuries: pd.DataFrame | None) -> pd.DataFrame:
    """Produce the per-game feature matrix (one row per game)."""
    LOG.info("computing prior aggregates ...")
    g = _prior_aggregates(tg)
    g = _opponent_adjustment(g)
    g = _dvoa_proxy(g)

    # team-game feature columns to carry into matchup
    form_cols = [f"{s}_form" for s in STAT_COLS]
    carry = ["game_id", "team", "is_home", "gp_season", "gp_total", "prior_max_date",
             "adj_off_epa", "adj_def_epa", "sos", "off_dvoa_proxy", "def_dvoa_proxy"] + form_cols
    feat = g[carry].copy()

    home = feat[feat.is_home == 1].add_prefix("home_").rename(columns={"home_game_id": "game_id"})
    away = feat[feat.is_home == 0].add_prefix("away_").rename(columns={"away_game_id": "game_id"})
    # 'team'/'is_home' would collide with the games table's home_team/away_team
    home = home.drop(columns=["home_team", "home_is_home"], errors="ignore")
    away = away.drop(columns=["away_team", "away_is_home"], errors="ignore")
    m = games.merge(home, on="game_id", how="left").merge(away, on="game_id", how="left")

    # ELO (pre-game)
    elo = compute_elo(games)
    m = m.merge(elo[["game_id", "home_elo_pre", "away_elo_pre"]], on="game_id", how="left")

    # expected total points (simple points-form model for the totals market)
    home_exp = m[["home_points_for_form", "away_points_against_form"]].mean(axis=1)
    away_exp = m[["away_points_for_form", "home_points_against_form"]].mean(axis=1)
    m["pred_total"] = home_exp + away_exp

    # rest / travel / home field
    m["rest_diff"] = m["home_rest"].fillna(7) - m["away_rest"].fillna(7)
    m["hfa"] = np.where(m["location"].astype(str).str.lower() == "neutral", 0.0, 1.0)
    m["is_dome"] = m["roof"].isin(["dome", "closed"]).astype(float)

    # market features (closing line for THIS game = pre-kickoff information)
    m["spread_line"] = pd.to_numeric(m["spread_line"], errors="coerce")
    m["market_home_prob"] = 1.0 / (1.0 + 10 ** (-(m["spread_line"]) / 13.86))  # spread->prob

    # injury impact
    inj = _injury_impact(games, injuries if injuries is not None else pd.DataFrame())
    inj_home = inj.rename(columns={"team": "home_team"})[
        ["game_id", "home_team", "injury_impact", "qb_injury", "injury_data"]]
    inj_home = inj_home.rename(columns={"injury_impact": "home_injury_impact",
                                        "qb_injury": "home_qb_injury"})
    inj_away = inj.rename(columns={"team": "away_team"})[
        ["game_id", "away_team", "injury_impact", "qb_injury"]]
    inj_away = inj_away.rename(columns={"injury_impact": "away_injury_impact",
                                        "qb_injury": "away_qb_injury"})
    m = m.merge(inj_home.drop_duplicates(["game_id", "home_team"]),
                on=["game_id", "home_team"], how="left")
    m = m.merge(inj_away.drop_duplicates(["game_id", "away_team"]),
                on=["game_id", "away_team"], how="left")
    for c in ["home_injury_impact", "away_injury_impact", "home_qb_injury", "away_qb_injury"]:
        m[c] = m[c].fillna(0.0)
    m["injury_data"] = m["injury_data"].fillna(False)

    # latest event date any feature depended on (for leakage audit)
    m["prior_max_date"] = m[["home_prior_max_date", "away_prior_max_date"]].max(axis=1)
    m["max_feature_date"] = m["prior_max_date"]  # market/injury are same-week, pre-kickoff

    out = get_path("features") / "game_features.parquet"
    m.to_parquet(out, index=False)
    LOG.info("features built: %d games x %d cols -> %s", len(m), m.shape[1], out.name)
    return m
