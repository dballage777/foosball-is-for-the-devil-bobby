# NFL Prediction Engine — Performance Summary

All metrics are out-of-sample, produced by strict weekly walk-forward validation (train on the past, predict the next week). 'Market' = the closing-line implied favorite baseline.

## composite_baseline

- Games scored: **1420**
- Straight-up accuracy: **63.9%** (market baseline 66.5%)
- Brier score: **0.2240** (market 0.2120) — lower is better
- Log loss: **0.6391**, Calibration ECE: **0.0250**
- ATS: 367 bets, win 47.7%, ROI **-8.1%**, profit -29.5725u, max DD -41.4679u
- Moneyline (value): 116 bets, win 62.1%, ROI **-7.0%**
- Totals: 278 bets, ROI **-0.4%**
- Safe-bet ATS: 331 bets, win 47.1%, ROI **-9.2%**

## enhanced_gbm

- Games scored: **1420**
- Straight-up accuracy: **62.0%** (market baseline 66.5%)
- Brier score: **0.2486** (market 0.2120) — lower is better
- Log loss: **0.7287**, Calibration ECE: **0.1237**
- ATS: 810 bets, win 50.1%, ROI **-3.2%**, profit -26.0947u, max DD -41.0778u
- Moneyline (value): 715 bets, win 64.9%, ROI **-3.5%**
- Totals: 626 bets, ROI **-7.6%**
- Safe-bet ATS: 464 bets, win 49.1%, ROI **-5.2%**

## How to read these numbers

- Beating ~52.4% ATS is the break-even line at -110. Results near or below that mean **no demonstrated edge** — which is the honest and expected outcome for a transparent public-data model.
- A straight-up accuracy close to the market baseline means the model has roughly learned what the closing line already knows. Substantially *beating* the market on out-of-sample data would be the signal to investigate for leakage, not to celebrate.