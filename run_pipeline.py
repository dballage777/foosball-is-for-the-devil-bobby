#!/usr/bin/env python3
"""End-to-end orchestrator for the NFL prediction engine.

Stages (run in order, each reusing cached artifacts where possible):

    ingest    download + process nflverse data
    features  team-game stats -> point-in-time feature matrix -> composite
    audit     leakage detection (hard-fails on any future reference)
    backtest  walk-forward both models + betting simulation
    reports   the 10 required reports + markdown summary
    analysis  feature importance / permutation / ablation / VIF

Usage:
    python run_pipeline.py                 # full run
    python run_pipeline.py --skip-ingest   # reuse cached raw data
    python run_pipeline.py --no-analysis   # skip the slow importance stage
    python run_pipeline.py --force-download # re-pull all source data
"""
from __future__ import annotations

import argparse

import pandas as pd

from src.analysis.importance import run_importance_analysis
from src.backtest.engine import (run_walk_forward, simulate_betting)
from src.data.ingest import (build_processed_games, fetch_games, fetch_injuries,
                             fetch_pbp, run_ingestion)
from src.features.build_features import build_features
from src.features.team_game import build_team_game
from src.models.composite import CompositeModel, compute_composite
from src.models.enhanced import EnhancedModel
from src.reports.reports import write_markdown_summary, write_reports
from src.utils import LOG, get_path, load_config, set_global_seed
from src.validation.leakage import run_leakage_audit


def _load_cached():
    proc = get_path("processed")
    pbp = pd.read_parquet(proc / "pbp.parquet")
    games = pd.read_parquet(proc / "games.parquet")
    inj_path = proc / "injuries.parquet"
    injuries = pd.read_parquet(inj_path) if inj_path.exists() else pd.DataFrame()
    return pbp, games, injuries


def main() -> None:
    ap = argparse.ArgumentParser(description="NFL prediction engine pipeline")
    ap.add_argument("--skip-ingest", action="store_true",
                    help="reuse processed parquet caches")
    ap.add_argument("--force-download", action="store_true",
                    help="re-download all source data")
    ap.add_argument("--no-analysis", action="store_true",
                    help="skip the (slower) importance analysis")
    args = ap.parse_args()

    set_global_seed()
    cfg = load_config()

    # ---- ingest ----------------------------------------------------------
    if args.skip_ingest:
        LOG.info("=== STAGE: load cached data ===")
        pbp, games, injuries = _load_cached()
    else:
        LOG.info("=== STAGE: ingestion ===")
        data = run_ingestion(force=args.force_download)
        pbp, games, injuries = data["pbp"], data["games"], data["injuries"]

    # ---- features --------------------------------------------------------
    LOG.info("=== STAGE: feature engineering ===")
    tg = build_team_game(pbp, games)
    feats = build_features(tg, games, injuries)
    feats = compute_composite(feats)
    feats.to_parquet(get_path("features") / "game_features_composite.parquet", index=False)

    # ---- leakage audit (may hard-fail) ----------------------------------
    LOG.info("=== STAGE: leakage audit ===")
    run_leakage_audit(feats)

    # ---- backtest both models -------------------------------------------
    LOG.info("=== STAGE: walk-forward backtest ===")
    summaries = {}
    model_factories = {
        "composite_baseline": lambda: CompositeModel(),
        "enhanced_gbm": lambda: EnhancedModel(),
    }
    all_preds = {}
    for label, factory in model_factories.items():
        preds = run_walk_forward(feats, factory, label)
        if preds.empty:
            LOG.warning("[%s] no predictions produced", label)
            continue
        ledger = simulate_betting(preds)
        all_preds[label] = (preds, ledger)
        summaries[label] = write_reports(preds, ledger, label)

    write_markdown_summary(summaries)

    # ---- analysis --------------------------------------------------------
    if not args.no_analysis:
        LOG.info("=== STAGE: importance analysis ===")
        run_importance_analysis(feats)

    LOG.info("=== PIPELINE COMPLETE === reports in %s", get_path("reports"))


if __name__ == "__main__":
    main()
