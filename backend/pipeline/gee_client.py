import ee
import os

import json
import base64

def initialize_ee():
    """Initializes the Earth Engine API using either a base64 env var or a local json key."""
    
    encoded_creds = os.getenv("GEE_SERVICE_ACCOUNT_BASE64")
    if encoded_creds:
        print("Initializing Google Earth Engine API via ENV...")
        encoded_creds = encoded_creds.strip()
        
        # Check if the user pasted raw JSON instead of base64
        if encoded_creds.startswith('{') and encoded_creds.endswith('}'):
            creds_json_str = encoded_creds
            print("Detected raw JSON string in environment variable.")
        else:
            # Clean string and add missing padding to prevent 'Incorrect padding' error on Render
            # Remove any internal newlines or spaces that could mess up the length calculation
            encoded_creds = "".join(encoded_creds.split())
            encoded_creds += "=" * ((4 - len(encoded_creds) % 4) % 4)
            
            try:
                # Decode and write to a temporary file for ee to consume
                creds_json_str = base64.b64decode(encoded_creds).decode('utf-8')
            except UnicodeDecodeError:
                raise ValueError("Failed to decode base64 credentials. Make sure you encoded the JSON file correctly using UTF-8.")
                
        tmp_key_path = "/tmp/gee_key.json"
        if os.name == 'nt':
            tmp_key_path = os.path.join(os.environ.get('TEMP', 'C:\\temp'), 'gee_key.json')
            
        with open(tmp_key_path, 'w', encoding='utf-8') as f:
            f.write(creds_json_str)
            
        key_data = json.loads(creds_json_str)
        sa_email = key_data.get('client_email', '')
        credentials = ee.ServiceAccountCredentials(sa_email, key_file=tmp_key_path)
        ee.Initialize(credentials)
        print("Earth Engine initialized successfully (Prod).")
        return

    # Fallback to local JSON key path (for Local Development)
    key_path = os.getenv("GEE_SERVICE_ACCOUNT_JSON_PATH")
    if not key_path:
        raise ValueError("Neither GEE_SERVICE_ACCOUNT_BASE64 nor GEE_SERVICE_ACCOUNT_JSON_PATH is set.")

    if not os.path.exists(key_path):
        raise FileNotFoundError(f"Service account key file not found at {key_path}")

    print("Initializing Google Earth Engine API via local JSON...")
    with open(key_path, 'r') as f:
        key_data = json.load(f)
        sa_email = key_data.get('client_email', '')

    credentials = ee.ServiceAccountCredentials(sa_email, key_file=key_path)
    ee.Initialize(credentials)
    print("Earth Engine initialized successfully (Local).")

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
