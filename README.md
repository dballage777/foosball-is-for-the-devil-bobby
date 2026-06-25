# NFL Prediction Engine (2021 → most recent completed season)

A fully reproducible, **leakage-audited**, walk-forward NFL prediction and
betting-backtest system. It answers one question honestly:

> **Does a transparent, public-data model actually have predictive edge against
> the closing line — or does it just re-learn what the market already knows?**

The design goal is **realism over performance**. The system is built to *detect
and prevent* lookahead bias, not to maximize a backtest. If a result looked
unusually strong, that would be treated as a leakage bug to investigate — not a
win.

---

## Headline result (out-of-sample, 2021 W1 → 2025 playoffs)

| Model | Games | SU acc. | Market SU | Brier | ATS bets | ATS win% | ATS ROI |
|-------|------:|--------:|----------:|------:|---------:|---------:|--------:|
| Composite (baseline, 100-pt spec) | 1420 | 63.9% | 66.5% | 0.224 | 367 | 47.7% | −8.1% |
| Enhanced GBM (V2) | 1420 | 62.0% | 66.5% | 0.249 | 810 | 50.1% | −3.2% |

**Interpretation.** Straight-up accuracy sits *below* the closing-line baseline
(66.5%), ATS win rates are below the −110 break-even (52.4%), and ROI is
negative. **This is the expected, honest outcome.** The closing line is an
extremely efficient aggregator; a public-data model that merely matches it has
no demonstrated edge. The most predictive single feature, by permutation
importance, is the market line itself (≈0.16 vs <0.01 for everything else) —
exactly what an unbiased, leak-free pipeline should reveal.

> Numbers are regenerated from scratch by `run_pipeline.py`; see
> `reports/performance_summary.md` and the per-report CSVs.

---

## What guarantees no lookahead bias

Three independent layers, any one of which would catch a leak:

1. **Point-in-time features.** Every rolling/season-to-date statistic is built
   with a `groupby(...).shift(1)`, so a game can never see its own result. ELO
   exposes only **pre-game** ratings (a game's pre-rating equals the prior
   game's post-rating — unit-tested).
2. **Feature-level leakage audit.** `src/validation/leakage.py` writes
   `reports/leakage_audit_report.csv` with `feature, source, max_date_used,
   prediction_date, validation_status` for all 32 inputs, and **hard-fails the
   run** if any feature's latest input date is ≥ kickoff.
3. **Walk-forward boundary.** The backtester trains only on games whose
   **kickoff timestamp is strictly before** the week being predicted — refit
   every week, no shuffling, no k-fold. Even a mislabeled feature can't pull the
   target from the future.

**DVOA note.** True historical *weekly* DVOA is not freely/reliably available,
and season-final DVOA is forbidden (leakage). The system therefore uses a
clearly **flagged proxy** (`*_dvoa_proxy`, `proxy=True` in the audit) built only
from opponent-adjusted EPA + success rate, z-scored within each week. Methodology
is documented in `src/features/build_features.py::_dvoa_proxy`.

---

## Architecture (100-point composite model)

Weights mirror the specification exactly and sum to 100 (`config/config.yaml`):

| Tier | Weight | Features |
|------|-------:|----------|
| 1 — Core efficiency | 60 | Off/Def EPA·play (12/12), Off/Def Success (8/8), Off/Def DVOA-proxy (10/10) |
| 2 — Team strength | 20 | ELO (8), SoS (4), HFA (4), Rest/Travel (4) |
| 3 — Situational | 15 | Red-zone TD (4), 3rd-down (4), Pressure (3), Sack-rate diff (2), Turnover diff (2) |
| 4 — Market | 5 | Closing-line value (2), Injury impact (3) |

Each team is scored 0–100 as a weighted blend of **within-week percentile
ranks**; the home-minus-away composite is calibrated to a win probability and
margin by a logistic/linear fit trained only on past games. Confidence tiers:
**90+ Elite · 80–89 Strong · 70–79 Moderate · <70 Pass**.

The **Enhanced (V2)** model feeds a richer feature set (explosive rates, weather,
market, injury severity, the composite edge, …) to LightGBM/XGBoost
(scikit-learn `HistGradientBoosting` fallback).

---

## Repository layout

```
config/      config.yaml — single source of truth (weights, seasons, betting)
src/
  data/      ingest.py         nflverse download + processed games table
  features/  team_game.py      pbp -> per-team-game stats
             build_features.py  point-in-time matrix (form, opp-adj, proxy, market)
             elo.py            walk-forward ELO
  models/    composite.py      100-pt weighted model + calibration
             enhanced.py       gradient-boosted V2 model
  validation/leakage.py        automated lookahead audit (hard-fails)
  backtest/  engine.py         walk-forward loop + betting sim + metrics
  reports/   reports.py        the 10 required reports + markdown summary
  analysis/  importance.py     importance / permutation / ablation / VIF / SHAP
tests/       pytest leakage + sanity tests
run_pipeline.py                end-to-end orchestrator
data/ features/ reports/       artifacts (large files git-ignored, regenerable)
```

---

## Reproduce it

```bash
pip install -r requirements.txt
python run_pipeline.py            # full: ingest -> features -> audit -> backtest -> reports
python run_pipeline.py --skip-ingest --no-analysis   # fast re-run from cache
pytest -q                         # leakage + unit tests
```

Outputs land in `reports/`:

| # | Report | File |
|---|--------|------|
| 1 | Overall performance | `01_overall_<model>.csv` |
| 2 | Season performance | `02_season_<model>.csv` |
| 3 | Weekly performance | `03_weekly_<model>.csv` |
| 4 | Confidence-tier performance | `04_confidence_tier_<model>.csv`, `04b_tier_su_<model>.csv` |
| 5 | Home vs Away | `05_home_away_<model>.csv` |
| 6 | Favorite vs Underdog | `06_favorite_underdog_<model>.csv` |
| 7 | Safe-bet performance | `07_safe_bets_<model>.csv` |
| 8 | Market comparison | `08_market_comparison_<model>.csv` |
| 9 | Leakage audit | `leakage_audit_report.csv` |
| 10 | Feature importance / ablation / VIF | `10*_*.csv` |

Tracked metrics: SU win%, ATS%, ML%, ROI, expected ROI, profit factor, max
drawdown, Sharpe, Brier, log loss, calibration (ECE).

---

## Data sources (auto-documented in `reports/data_sources.json`)

- **Play-by-play** — [nflverse-data](https://github.com/nflverse/nflverse-data)
  release assets (EPA, success, situational). Built on nflfastR.
- **Schedules, scores, closing Vegas lines, rest/weather** — nflverse
  [`nfldata/games.csv`](https://github.com/nflverse/nfldata).
- **Weekly injury reports** — nflverse-data injury release assets (pre-game).

All free, public, reproducible. The ingestion layer downloads, caches, and
records provenance for every file.

---

## Honesty caveats

- **Closing lines, not opening/movement.** nflverse provides the closing line;
  true closing-line-value and line-movement signals require a timestamped odds
  feed. Those features are implemented as documented proxies and flagged.
- **Injury feed is coarse.** Weekly report status (Out/Doubtful/Questionable),
  QB-weighted — not snap-counted player value.
- **No survivorship/synthetic data.** Real outcomes only; missing data is
  flagged, never imputed from the future.

The point of this project is not to sell a winning system — it's to demonstrate
a rigorous, auditable methodology that tells you the truth about edge.
