import ee
import pandas as pd
from datetime import datetime

def mask_s2_clouds(image):
    """Cloud masking for Sentinel-2 using QA60 band."""
    qa = image.select('QA60')
    # Bits 10 and 11 are clouds and cirrus, respectively.
    cloud_bit_mask = 1 << 10
    cirrus_bit_mask = 1 << 11
    # Both flags should be set to zero, indicating clear conditions.
    mask = qa.bitwiseAnd(cloud_bit_mask).eq(0) \
             .And(qa.bitwiseAnd(cirrus_bit_mask).eq(0))
    return image.updateMask(mask).divide(10000)

def compute_indices_for_site(lat, lon, start_date, end_date):
    """Fetches Sentinel-2 data and computes NDWI/NDVI time series for a point."""
    point = ee.Geometry.Point([lon, lat])
    aoi = point.buffer(50) # 50 meter buffer for stability
    
    dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
        .filterBounds(aoi) \
        .filterDate(start_date, end_date) \
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 40))
        
    def add_indices(image):
        # Apply cloud mask
        img = mask_s2_clouds(image)
        # NDWI = (Green - NIR) / (Green + NIR) -> (B3 - B8) / (B3 + B8)
        ndwi = img.normalizedDifference(['B3', 'B8']).rename('NDWI')
        # NDVI = (NIR - Red) / (NIR + Red) -> (B8 - B4) / (B8 + B4)
        ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI')
        
        # Add bands and properties
        return img.addBands([ndwi, ndvi]) \
                  .set('system:time_start', image.get('system:time_start')) \
                  .set('cloud_cover', image.get('CLOUDY_PIXEL_PERCENTAGE'))

    processed = dataset.map(add_indices)
    
    # Extract time series
    def extract_data(image):
        mean_dict = image.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=aoi,
            scale=10,
            maxPixels=1e9
        )
        return ee.Feature(None, {
            'date': ee.Date(image.get('system:time_start')).format('YYYY-MM-dd'),
            'ndwi': mean_dict.get('NDWI'),
            'ndvi': mean_dict.get('NDVI'),
            'cloud_cover_pct': image.get('cloud_cover')
        })

    timeseries_features = processed.map(extract_data).getInfo()
    
    # Convert to standard Python dicts/list
    records = []
    for feature in timeseries_features.get('features', []):
        props = feature.get('properties', {})
        # Only keep if NDWI/NDVI are valid numbers (not None from cloud masking)
        if props.get('ndwi') is not None and props.get('ndvi') is not None:
            records.append({
                'date': props.get('date'),
                'ndwi': props.get('ndwi'),
                'ndvi': props.get('ndvi'),
                'cloud_cover_pct': props.get('cloud_cover_pct')
            })
            
    df = pd.DataFrame(records)
    if not df.empty:
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        df['date'] = df['date'].dt.strftime('%Y-%m-%d')
    return df

if __name__ == "__main__":
    # Simple test block
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    import config
    from pipeline.gee_client import initialize_ee
    
    initialize_ee()
    
    # Buddha Nullah coordinate from docs/sites.md
    print("Fetching indices for Buddha Nullah (2023)...")
    df = compute_indices_for_site(30.937250, 75.693023, '2023-01-01', '2023-12-31')
    print(f"Fetched {len(df)} valid records.")
    if not df.empty:
        print(df.head())
