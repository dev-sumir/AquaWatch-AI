import pandas as pd
import numpy as np

def compute_anomaly(df: pd.DataFrame, baseline_days: int = 180, current_days: int = 30):
    """
    Computes the anomaly score using z-score for both NDWI and NDVI.
    Assumes df is sorted by date and contains 'ndwi' and 'ndvi' columns.
    Returns the anomaly details for the metric that deviated the most.
    """
    if df.empty or len(df) < 5:
        return {
            'score': None,
            'severity': 'N/A',
            'baseline_mean': None,
            'baseline_std': None,
            'current_value': None,
            'metric_used': 'ndwi',
            'verdict_text': 'Insufficient data to compute anomaly score.'
        }
    
    df['date'] = pd.to_datetime(df['date'])
    latest_date = df['date'].max()
    
    current_cutoff = latest_date - pd.Timedelta(days=current_days)
    baseline_cutoff = current_cutoff - pd.Timedelta(days=baseline_days)
    
    current_period = df[df['date'] > current_cutoff]
    baseline_period = df[(df['date'] > baseline_cutoff) & (df['date'] <= current_cutoff)]
    
    if baseline_period.empty or current_period.empty or len(baseline_period) < 3:
        return {
            'score': None,
            'severity': 'N/A',
            'baseline_mean': None,
            'baseline_std': None,
            'current_value': None,
            'metric_used': 'ndwi',
            'verdict_text': 'Insufficient baseline data to compute anomaly score.'
        }
        
    def get_z_score(metric):
        b_mean = baseline_period[metric].mean()
        b_std = baseline_period[metric].std()
        c_mean = current_period[metric].mean()
        if b_std == 0 or pd.isna(b_std):
            b_std = 0.01
        return (c_mean - b_mean) / b_std, b_mean, b_std, c_mean
        
    z_ndwi, b_mean_ndwi, b_std_ndwi, c_mean_ndwi = get_z_score('ndwi')
    z_ndvi, b_mean_ndvi, b_std_ndvi, c_mean_ndvi = get_z_score('ndvi')
    
    # Pick the metric with the most significant deviation
    if abs(z_ndvi) > abs(z_ndwi):
        primary_metric = 'ndvi'
        z_score = z_ndvi
        b_mean, b_std, c_mean = b_mean_ndvi, b_std_ndvi, c_mean_ndvi
    else:
        primary_metric = 'ndwi'
        z_score = z_ndwi
        b_mean, b_std, c_mean = b_mean_ndwi, b_std_ndwi, c_mean_ndwi
    
    score = min(100.0, abs(z_score) * 25.0)
    
    if score < 30:
        severity = "Low"
    elif score < 60:
        severity = "Moderate"
    else:
        severity = "High"
        
    delta_pct = ((c_mean - b_mean) / abs(b_mean)) * 100 if b_mean != 0 else 0
    direction = "dropped" if c_mean < b_mean else "increased"
    
    metric_name = "Water clarity/levels (NDWI)" if primary_metric == 'ndwi' else "Vegetation health (NDVI)"
    
    if severity == "Low":
        verdict = f"No significant change detected. {metric_name} remains within normal historical baseline."
    elif severity == "Moderate":
        verdict = f"Moderate anomaly detected. {metric_name} {direction} by {abs(delta_pct):.1f}%, which is outside typical variance."
    else:
        verdict = f"High risk anomaly flagged. {metric_name} significantly {direction} by {abs(delta_pct):.1f}% compared to baseline. Consistent with a potential environmental event or contamination."
        
    return {
        'score': round(score, 2),
        'severity': severity,
        'baseline_mean': b_mean,
        'baseline_std': b_std,
        'current_value': c_mean,
        'metric_used': primary_metric,
        'verdict_text': verdict
    }
