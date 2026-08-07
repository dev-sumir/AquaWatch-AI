import ee
import os

def initialize_ee():
    """Initializes the Earth Engine API using a service account key."""
    key_path = os.getenv("GEE_SERVICE_ACCOUNT_JSON_PATH")
    if not key_path:
        raise ValueError("GEE_SERVICE_ACCOUNT_JSON_PATH environment variable is not set")

    if not os.path.exists(key_path):
        raise FileNotFoundError(f"Service account key file not found at {key_path}")

    print("Initializing Google Earth Engine API...")
    # NOTE: The first argument to ServiceAccountCredentials should be the service account email, 
    # but the earthengine-api can often infer it from the JSON key file alone if you pass an empty string
    # or you can parse it from the json file.
    import json
    with open(key_path, 'r') as f:
        key_data = json.load(f)
        sa_email = key_data.get('client_email', '')

    credentials = ee.ServiceAccountCredentials(sa_email, key_file=key_path)
    ee.Initialize(credentials)
    print("Earth Engine initialized successfully.")

def test_query():
    """Runs a simple query to ensure Earth Engine is accessible."""
    # Create a simple geometry
    point = ee.Geometry.Point(-122.082, 37.42)
    # Get a Sentinel-2 image
    image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
        .filterBounds(point) \
        .filterDate('2023-01-01', '2023-01-31') \
        .first()
    
    if image:
        info = image.getInfo()
        print(f"Successfully retrieved an image: {info.get('id')}")
        return True
    else:
        print("No image found in the test query, but API call succeeded.")
        return False
