"""Model-improvement analysis: feature importance, permutation importance,
ablation, correlation and multicollinearity (VIF), and optional SHAP.

These run on a single time-honest split — train on everything up to a holdout
season, evaluate on the holdout — so importances reflect genuine out-of-sample
behaviour rather than in-sample overfit. SHAP and statsmodels are optional; the
report degrades gracefully if they are not installed.
"""
from __future__ import annotations

import warnings

import numpy as np
import pandas as pd
from sklearn.inspection import permutation_importance
from sklearn.metrics import log_loss

from src.models.enhanced import EnhancedModel, available_features
from src.utils import LOG, get_path, load_config

warnings.filterwarnings("ignore")


def _split(features: pd.DataFrame):
    """Train on all but the last evaluation season; test on the last one."""
    cfg = load_config()
    holdout = max(cfg["seasons"]["evaluate"])
    played = features[features["played"]].copy()
    train = played[played["season"] < holdout]
    test = played[played["season"] == holdout]
    return train, test, holdout


def run_importance_analysis(features: pd.DataFrame) -> dict:
    rpt = get_path("reports")
    train, test, holdout = _split(features)
    feats = available_features(features)
    train = train.dropna(subset=["home_win"])
    train = train[train["home_win"].isin([0.0, 1.0])]
    test = test.dropna(subset=["home_win"])
    test = test[test["home_win"].isin([0.0, 1.0])]
    if len(train) < 100 or len(test) < 20:
        LOG.warning("not enough data for importance analysis")
        return {}

    model = EnhancedModel()
    model.feature_cols = feats
    model.fit(train)
    if model._clf is None:
        return {}

    Xte = test[feats].astype(float)
    yte = test["home_win"].astype(int)

    # 10 — model-native feature importance
    imp = _native_importance(model._clf, feats)
    imp.to_csv(rpt / "10_feature_importance.csv", index=False)

    # permutation importance (out-of-sample)
    try:
        perm = permutation_importance(model._clf, Xte, yte, n_repeats=10,
                                      random_state=load_config().get("random_seed", 42),
                                      scoring="neg_log_loss")
        pi = pd.DataFrame({"feature": feats,
                           "perm_importance": perm.importances_mean,
                           "perm_std": perm.importances_std}) \
            .sort_values("perm_importance", ascending=False)
        pi.to_csv(rpt / "10b_permutation_importance.csv", index=False)
    except Exception as exc:  # noqa: BLE001
        LOG.warning("permutation importance failed: %s", exc)

    # ablation: drop each feature, measure holdout log-loss change
    base_ll = log_loss(yte, model._clf.predict_proba(Xte)[:, 1], labels=[0, 1])
    abl = []
    for f in feats:
        sub = [c for c in feats if c != f]
        m2 = EnhancedModel(); m2.feature_cols = sub; m2.fit(train)
        if m2._clf is None:
            continue
        ll = log_loss(yte, m2._clf.predict_proba(test[sub].astype(float))[:, 1], labels=[0, 1])
        abl.append({"removed_feature": f, "holdout_log_loss": ll,
                    "delta_vs_full": ll - base_ll})
    abl_df = pd.DataFrame(abl).sort_values("delta_vs_full", ascending=False)
    abl_df.to_csv(rpt / "10c_ablation.csv", index=False)

    # correlation + multicollinearity (VIF)
    corr = train[feats].corr()
    corr.to_csv(rpt / "10d_correlation.csv")
    _vif(train[feats]).to_csv(rpt / "10e_multicollinearity_vif.csv", index=False)

    # optional SHAP
    _try_shap(model._clf, Xte, feats, rpt)

    LOG.info("importance analysis complete (holdout=%s, base log loss=%.4f)",
             holdout, base_ll)
    return {"holdout": holdout, "base_log_loss": base_ll,
            "top_features": imp.head(8)["feature"].tolist()}


def _native_importance(clf, feats) -> pd.DataFrame:
    if hasattr(clf, "feature_importances_"):
        vals = clf.feature_importances_
    elif hasattr(clf, "coef_"):
        vals = np.abs(clf.coef_).ravel()
    else:
        vals = np.zeros(len(feats))
    return pd.DataFrame({"feature": feats, "importance": vals}) \
        .sort_values("importance", ascending=False)


def _vif(X: pd.DataFrame) -> pd.DataFrame:
    Xc = X.fillna(X.mean()).replace([np.inf, -np.inf], 0.0)
    try:
        from statsmodels.stats.outliers_influence import variance_inflation_factor
        from statsmodels.tools.tools import add_constant
        Xa = add_constant(Xc)
        rows = [{"feature": c,
                 "vif": float(variance_inflation_factor(Xa.values, i))}
                for i, c in enumerate(Xa.columns) if c != "const"]
        return pd.DataFrame(rows).sort_values("vif", ascending=False)
    except Exception:
        # fallback: VIF_i = 1/(1-R^2_i) via correlation matrix inverse
        corr = Xc.corr().values
        try:
            inv = np.linalg.pinv(corr)
            return pd.DataFrame({"feature": X.columns, "vif": np.diag(inv)}) \
                .sort_values("vif", ascending=False)
        except Exception:
            return pd.DataFrame({"feature": X.columns, "vif": np.nan})


def _try_shap(clf, X, feats, rpt) -> None:
    try:
        import shap
        expl = shap.Explainer(clf, X)
        sv = expl(X)
        mean_abs = np.abs(sv.values).mean(axis=0)
        pd.DataFrame({"feature": feats, "mean_abs_shap": mean_abs}) \
            .sort_values("mean_abs_shap", ascending=False) \
            .to_csv(rpt / "10f_shap_importance.csv", index=False)
        LOG.info("SHAP importance written")
    except Exception as exc:  # noqa: BLE001
        LOG.info("SHAP skipped (%s)", exc)
