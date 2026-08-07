import os
import sys
import requests
import pandas as pd
import ee

# Setup path to import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import config
from pipeline.gee_client import initialize_ee
from pipeline.compute_indices import compute_indices_for_site
from pipeline.anomaly import compute_anomaly

def download_image(url, filename):
    print(f"Downloading image to {filename}...")
    response = requests.get(url)
    if response.status_code == 200:
        with open(filename, 'wb') as f:
            f.write(response.content)
        print("Success.")
    else:
        print(f"Failed to download image. Status code: {response.status_code}")

def get_true_color_thumbnail(lat, lon, start_date, end_date):
    point = ee.Geometry.Point([lon, lat])
    # Fetch a cloud-free median image over the period
    image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
        .filterBounds(point) \
        .filterDate(start_date, end_date) \
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
        .median()
        
    # Standard visualization parameters for Sentinel-2 true color
    vis_params = {
        'bands': ['B4', 'B3', 'B2'],
        'min': 0,
        'max': 3000,
        'dimensions': 800,
        'region': point.buffer(2000).bounds() # 2km buffer to see context
    }
    
    try:
        url = image.getThumbURL(vis_params)
        return url
    except Exception as e:
        print(f"Error getting thumbnail URL: {e}")
        return None

if __name__ == "__main__":
    initialize_ee()
    
    # 1. Buddha Nullah
    lat, lon = 30.937250, 75.693023
    
    print("Fetching indices for Buddha Nullah (2023)...")
    df = compute_indices_for_site(lat, lon, '2023-01-01', '2023-12-31')
    
    # Save to CSV
    csv_path = 'demo_buddha_nullah_data.csv'
    df.to_csv(csv_path, index=False)
    print(f"Saved {len(df)} records to {csv_path}")
    
    # Compute Anomaly to show verdict
    anomaly_res = compute_anomaly(df)
    
    print("\n--- Anomaly Scoring ---")
    print(f"Score: {anomaly_res.get('score')} | Severity: {anomaly_res.get('severity')}")
    print(f"Verdict: {anomaly_res.get('verdict_text')}\n")
    
    # Fetch Images
    # Baseline period (e.g. Early 2023)
    print("Generating baseline image (Jan-Mar 2023)...")
    url_before = get_true_color_thumbnail(lat, lon, '2023-01-01', '2023-03-31')
    if url_before:
        download_image(url_before, 'buddha_nullah_before.jpg')
        
    # Current period (e.g. Late 2023)
    print("Generating current image (Oct-Dec 2023)...")
    url_after = get_true_color_thumbnail(lat, lon, '2023-10-01', '2023-12-31')
    if url_after:
        download_image(url_after, 'buddha_nullah_after.jpg')
        
    # Save the results summary to a txt file
    txt_path = 'demo_summary.txt'
    with open(txt_path, 'w') as f:
        f.write("AQUA WATCH AI - EXTRACTION DEMO\n")
        f.write("===============================\n")
        f.write(f"Site: Buddha Nullah ({lat}, {lon})\n")
        f.write(f"Data Points Extracted: {len(df)}\n")
        f.write(f"Anomaly Score: {anomaly_res.get('score')} ({anomaly_res.get('severity')})\n")
        f.write(f"Verdict: {anomaly_res.get('verdict_text')}\n")
        f.write(f"Before Image URL: {url_before}\n")
        f.write(f"After Image URL: {url_after}\n")
    print(f"\nSaved summary to {txt_path}")
