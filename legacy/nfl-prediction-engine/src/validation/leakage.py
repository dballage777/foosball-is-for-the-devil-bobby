"""Automated lookahead / leakage detection.

Two layers of defense:

1. ROW-LEVEL HARD CHECK. Every feature row carries `max_feature_date`, the
   latest event date any of its inputs depended on. For a clean build this must
   be strictly before kickoff for every game. If not, the run aborts (when
   `leakage.hard_fail` is true).

2. FEATURE-LEVEL AUDIT. We emit `leakage_audit_report.csv` cataloguing every
   model input with its data source, whether it is a documented proxy, the
   latest date it used, the earliest prediction date, and a PASS/FAIL status.

The walk-forward backtester adds a third layer: it only ever fits on games with
a kickoff earlier than the week being predicted, so even a mislabeled feature
cannot pull the target from the future.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from src.utils import LOG, get_path, load_config

# feature -> (human-readable source, is_proxy)
FEATURE_REGISTRY: dict[str, tuple[str, bool]] = {
    "home_off_epa_play_form": ("pbp:prior-team-games", False),
    "away_off_epa_play_form": ("pbp:prior-team-games", False),
    "home_def_epa_play_form": ("pbp:prior-team-games", False),
    "away_def_epa_play_form": ("pbp:prior-team-games", False),
    "home_off_success_form": ("pbp:prior-team-games", False),
    "away_off_success_form": ("pbp:prior-team-games", False),
    "home_def_success_form": ("pbp:prior-team-games", False),
    "away_def_success_form": ("pbp:prior-team-games", False),
    "home_off_dvoa_proxy": ("pbp:opp-adjusted-proxy", True),
    "away_off_dvoa_proxy": ("pbp:opp-adjusted-proxy", True),
    "home_def_dvoa_proxy": ("pbp:opp-adjusted-proxy", True),
    "away_def_dvoa_proxy": ("pbp:opp-adjusted-proxy", True),
    "home_elo_pre": ("elo:walk-forward", False),
    "away_elo_pre": ("elo:walk-forward", False),
    "home_sos": ("pbp:opponents-faced", False),
    "away_sos": ("pbp:opponents-faced", False),
    "hfa": ("schedule:location", False),
    "rest_diff": ("schedule:rest-days", False),
    "home_off_rz_td_rate_form": ("pbp:prior-team-games", False),
    "away_off_rz_td_rate_form": ("pbp:prior-team-games", False),
    "home_off_third_down_rate_form": ("pbp:prior-team-games", False),
    "away_off_third_down_rate_form": ("pbp:prior-team-games", False),
    "home_def_pressure_rate_form": ("pbp:prior-team-games", False),
    "away_def_pressure_rate_form": ("pbp:prior-team-games", False),
    "home_sack_rate_diff_form": ("pbp:prior-team-games", False),
    "away_sack_rate_diff_form": ("pbp:prior-team-games", False),
    "home_turnover_diff_form": ("pbp:prior-team-games", False),
    "away_turnover_diff_form": ("pbp:prior-team-games", False),
    "spread_line": ("market:closing-line(pre-kickoff)", False),
    "market_home_prob": ("market:closing-line(pre-kickoff)", False),
    "home_injury_impact": ("injuries:weekly-report(pre-kickoff)", False),
    "away_injury_impact": ("injuries:weekly-report(pre-kickoff)", False),
}


def run_leakage_audit(features: pd.DataFrame) -> pd.DataFrame:
    """Validate features and write the audit report. Returns the report frame.

    Raises RuntimeError when hard_fail is set and any row leaks the future.
    """
    cfg = load_config()["leakage"]
    f = features.copy()
    f["kickoff"] = pd.to_datetime(f["kickoff"])
    f["max_feature_date"] = pd.to_datetime(f["max_feature_date"])

    # ---- Layer 1: row-level hard check -------------------------------------
    # A feature may legitimately have NO prior history (e.g. a team's very first
    # game in the warmup season) -> max_feature_date is NaT, which is fine.
    has_hist = f["max_feature_date"].notna()
    leaked_rows = f[has_hist & (f["max_feature_date"] >= f["kickoff"])]
    n_leak = len(leaked_rows)
    if n_leak:
        LOG.error("LEAKAGE: %d games reference data at/after kickoff", n_leak)
        sample = leaked_rows[["game_id", "kickoff", "max_feature_date"]].head(10)
        LOG.error("\n%s", sample.to_string(index=False))

    # ---- Layer 2: per-feature audit ----------------------------------------
    rows = []
    for feat, (source, is_proxy) in FEATURE_REGISTRY.items():
        if feat not in f.columns:
            rows.append({"feature": feat, "source": source, "proxy": is_proxy,
                         "n_games": 0, "n_present": 0,
                         "max_date_used": pd.NaT, "prediction_date": pd.NaT,
                         "validation_status": "MISSING"})
            continue
        present = f[feat].notna()
        sub = f[present]
        max_used = sub["max_feature_date"].max()
        min_pred = sub["kickoff"].min()
        # this feature is safe if no row with this feature present also leaks
        feat_leak = sub[has_hist.loc[sub.index] &
                        (sub["max_feature_date"] >= sub["kickoff"])]
        status = "PASS" if len(feat_leak) == 0 else "FAIL"
        rows.append({
            "feature": feat,
            "source": source,
            "proxy": is_proxy,
            "n_games": int(len(f)),
            "n_present": int(present.sum()),
            "max_date_used": max_used,
            "prediction_date": min_pred,
            "validation_status": status,
        })
    report = pd.DataFrame(rows)

    out = get_path("reports") / cfg["audit_file"]
    report.to_csv(out, index=False)
    LOG.info("leakage audit written -> %s", out.name)

    n_proxy = int(report["proxy"].sum())
    n_fail = int((report["validation_status"] == "FAIL").sum())
    LOG.info("audit: %d features, %d proxy, %d FAIL, %d leaked rows",
             len(report), n_proxy, n_fail, n_leak)

    if (n_leak > 0 or n_fail > 0) and cfg.get("hard_fail", True):
        raise RuntimeError(
            f"Leakage audit FAILED: {n_leak} leaked rows, {n_fail} failed features. "
            f"See {out}.")
    return report
