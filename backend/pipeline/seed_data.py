import sys
import os
from datetime import datetime, timedelta
import pandas as pd
import math

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config
from database import SessionLocal
from models.site import Site
from models.observation import Observation
from models.anomaly_score import AnomalyScore
from pipeline.gee_client import initialize_ee
from pipeline.compute_indices import compute_indices_for_site
from pipeline.anomaly import compute_anomaly
from pipeline.image_export import export_site_images

# Configuration for new data
# Sentinel-2 has a latency of a few days. We use up to 7 days ago.
END_DATE = datetime.now() - timedelta(days=7)
START_DATE = END_DATE - timedelta(days=365) # 1 year of data

start_date_str = START_DATE.strftime('%Y-%m-%d')
end_date_str = END_DATE.strftime('%Y-%m-%d')

baseline_img_start = START_DATE.strftime('%Y-%m-%d')
baseline_img_end = (START_DATE + timedelta(days=90)).strftime('%Y-%m-%d') # 3 month window for median

current_img_start = (END_DATE - timedelta(days=90)).strftime('%Y-%m-%d')
current_img_end = END_DATE.strftime('%Y-%m-%d')

SITES = [
    {
        "name": "Buddha Nullah Confluence (Sutlej River)",
        "lat": 30.937250,
        "lon": 75.693023,
        "site_type": "River Confluence",
        "description": "This exact coordinate pinpoints the highly polluted waters of the Buddha Nullah merging into the Sutlej River. The stream carries immense loads of industrial effluent and untreated sewage from Ludhiana. We use this site to demonstrate significant water quality anomalies (drastic drops in NDWI) caused by this toxic discharge."
    },
    {
        "name": "Sutlej River at Phillaur",
        "lat": 30.986415,
        "lon": 75.775061,
        "site_type": "River",
        "description": "Positioned exactly at the main river crossing just south of Phillaur, this section captures agricultural runoff and downstream flow. While historically a steady channel, the river here is vulnerable to episodic contamination events, making it an excellent candidate for anomaly tracking."
    },
    {
        "name": "Ropar Wetland / Ropar Lake (Control Site)",
        "lat": 31.017402,
        "lon": 76.537030,
        "site_type": "Wetland",
        "description": "Located at the Ropar barrage, this Ramsar-recognized wetland sits upstream of major industrial zones like Ludhiana. The water quality and ecology here are actively conserved and relatively stable. This serves as our definitive control site to prove our statistical model doesn't generate false positives on healthy water bodies."
    }
]

def seed_database():
    print("Connecting to database...")
    db = SessionLocal()
    
    try:
        # 1. Clear existing data (for idempotency)
        print("Clearing existing records...")
        db.query(Observation).delete()
        db.query(AnomalyScore).delete()
        db.query(Site).delete()
        db.commit()
        
        # Initialize Earth Engine
        initialize_ee()
        
        # Absolute path for images directory
        images_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "images")
        
        for site_info in SITES:
            print(f"\n=========================================")
            print(f"Seeding Site: {site_info['name']}")
            print(f"=========================================")
            
            # Create Site
            site = Site(
                name=site_info['name'],
                latitude=site_info['lat'],
                longitude=site_info['lon'],
                site_type=site_info['site_type'],
                description=site_info['description']
            )
            db.add(site)
            db.flush() # flush to get site.id
            
            # Fetch Images
            print(f"Fetching Before/After images for {site.name}...")
            before_url, after_url = export_site_images(
                site_id=site.id,
                lat=site.latitude,
                lon=site.longitude,
                baseline_start=baseline_img_start,
                baseline_end=baseline_img_end,
                current_start=current_img_start,
                current_end=current_img_end,
                output_dir=images_dir
            )
            
            site.image_before_url = before_url
            site.image_after_url = after_url
            
            # Fetch Time Series Indices
            print(f"Computing indices from {start_date_str} to {end_date_str}...")
            df = compute_indices_for_site(site.latitude, site.longitude, start_date_str, end_date_str)
            
            if df.empty:
                print(f"WARNING: No satellite data found for {site.name}.")
                continue
                
            # Save Observations
            print(f"Saving {len(df)} observations to database...")
            for _, row in df.iterrows():
                obs = Observation(
                    site_id=site.id,
                    date=pd.to_datetime(row['date']).date(),
                    ndwi=float(row['ndwi']) if pd.notna(row['ndwi']) else None,
                    ndvi=float(row['ndvi']) if pd.notna(row['ndvi']) else None,
                    cloud_cover_pct=float(row['cloud_cover_pct']) if pd.notna(row['cloud_cover_pct']) else None
                )
                db.add(obs)
                
            # Compute Anomaly Score
            print(f"Calculating Anomaly Score...")
            anomaly_res = compute_anomaly(df, metric='ndwi')
            
            score_val = float(anomaly_res.get('score')) if anomaly_res.get('score') is not None else None
            baseline_mean_val = float(anomaly_res.get('baseline_mean')) if anomaly_res.get('baseline_mean') is not None else None
            baseline_std_val = float(anomaly_res.get('baseline_std')) if anomaly_res.get('baseline_std') is not None else None
            current_value_val = float(anomaly_res.get('current_value')) if anomaly_res.get('current_value') is not None else None

            # Save Anomaly Score
            score = AnomalyScore(
                site_id=site.id,
                score=score_val,
                severity=anomaly_res.get('severity'),
                baseline_mean=baseline_mean_val,
                baseline_std=baseline_std_val,
                current_value=current_value_val,
                metric_used=anomaly_res.get('metric_used'),
                verdict_text=anomaly_res.get('verdict_text')
            )
            
            # Fix any NaN values in SQLAlchemy (Postgres will reject float NaN)
            if score.baseline_mean is not None and math.isnan(score.baseline_mean): score.baseline_mean = None
            if score.baseline_std is not None and math.isnan(score.baseline_std): score.baseline_std = None
            if score.current_value is not None and math.isnan(score.current_value): score.current_value = None
            
            db.add(score)
            db.commit()
            print(f"Successfully committed data for {site.name}. Verdict: {score.severity}")
            
    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
        raise e
    finally:
        db.close()
        
    print("\n✅ Database seeding complete!")

if __name__ == "__main__":
    seed_database()
