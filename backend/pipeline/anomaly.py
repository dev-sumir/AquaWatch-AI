import pandas as pd
import numpy as np

def compute_anomaly(df: pd.DataFrame, metric: str = 'ndwi', baseline_days: int = 180, current_days: int = 30):
    """
    Computes the anomaly score using z-score for a given metric.
    Assumes df is sorted by date and contains the metric column.
    """
    if df.empty or len(df) < 5:
        return {
            'score': None,
            'severity': 'N/A',
            'baseline_mean': None,
            'baseline_std': None,
            'current_value': None,
            'metric_used': metric,
            'verdict_text': 'Insufficient data to compute anomaly score.'
        }
    
    # We define "current" as the last `current_days` in the dataset
    # and "baseline" as the `baseline_days` prior to the current period.
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
            'metric_used': metric,
            'verdict_text': 'Insufficient baseline data to compute anomaly score.'
        }
        
    baseline_mean = baseline_period[metric].mean()
    baseline_std = baseline_period[metric].std()
    current_mean = current_period[metric].mean()
    
    if baseline_std == 0 or pd.isna(baseline_std):
        # Prevent division by zero
        baseline_std = 0.01
        
    z_score = (current_mean - baseline_mean) / baseline_std
    
    # risk_score = min(100, abs(z) × 25)
    score = min(100.0, abs(z_score) * 25.0)
    
    if score < 30:
        severity = "Low"
    elif score < 60:
        severity = "Moderate"
    else:
        severity = "High"
        
    # Generate verdict text
    delta_pct = ((current_mean - baseline_mean) / abs(baseline_mean)) * 100 if baseline_mean != 0 else 0
    direction = "dropped" if current_mean < baseline_mean else "increased"
    
    metric_name = "Water clarity/levels (NDWI)" if metric == 'ndwi' else "Vegetation health (NDVI)"
    
    if severity == "Low":
        verdict = f"No significant change detected. {metric_name} remains within normal historical baseline."
    elif severity == "Moderate":
        verdict = f"Moderate anomaly detected. {metric_name} {direction} by {abs(delta_pct):.1f}%, which is outside typical variance."
    else:
        verdict = f"High risk anomaly flagged. {metric_name} significantly {direction} by {abs(delta_pct):.1f}% compared to baseline. Consistent with a potential environmental event or contamination."
        
    return {
        'score': round(score, 2),
        'severity': severity,
        'baseline_mean': baseline_mean,
        'baseline_std': baseline_std,
        'current_value': current_mean,
        'metric_used': metric,
        'verdict_text': verdict
    }

if __name__ == "__main__":
    # Test block
    # Mock a dataframe with a sharp drop to test it
    dates = pd.date_range(start="2023-01-01", end="2023-07-01", freq="W")
    # Baseline ~ 0.5
    values = np.random.normal(loc=0.5, scale=0.05, size=len(dates))
    df = pd.DataFrame({'date': dates, 'ndwi': values})
    
    # Introduce a sharp drop in the last 3 weeks to simulate contamination
    df.loc[df.index[-3:], 'ndwi'] = [0.1, 0.05, 0.02]
    
    result = compute_anomaly(df, metric='ndwi')
    print("Test Result (Sharp Drop):")
    for k, v in result.items():
        print(f"  {k}: {v}")
