import ee
import requests
import os

def download_image(url, filename):
    """Downloads an image from a URL to the local filesystem."""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(filename, 'wb') as f:
                f.write(response.content)
            return True
    except Exception as e:
        print(f"Failed to download image {filename}: {e}")
    return False

def export_site_images(site_id, lat, lon, baseline_start, baseline_end, current_start, current_end, output_dir):
    """
    Fetches before and after images for a site and saves them locally.
    Returns the relative URLs (paths) to the images.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    def get_url(start_date, end_date):
        point = ee.Geometry.Point([lon, lat])
        image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
            .filterBounds(point) \
            .filterDate(start_date, end_date) \
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
            .median()
            
        vis_params = {
            'bands': ['B4', 'B3', 'B2'],
            'min': 0,
            'max': 3000,
            'dimensions': 800,
            'region': point.buffer(2000).bounds()
        }
        try:
            return image.getThumbURL(vis_params)
        except Exception:
            return None

    # Before image
    print(f"Exporting baseline image for Site {site_id}...")
    before_url = get_url(baseline_start, baseline_end)
    before_filename = f"site_{site_id}_before.jpg"
    before_path = os.path.join(output_dir, before_filename)
    if before_url and download_image(before_url, before_path):
        before_rel_url = f"/static/images/{before_filename}"
    else:
        before_rel_url = None

    # After image
    print(f"Exporting current image for Site {site_id}...")
    after_url = get_url(current_start, current_end)
    after_filename = f"site_{site_id}_after.jpg"
    after_path = os.path.join(output_dir, after_filename)
    if after_url and download_image(after_url, after_path):
        after_rel_url = f"/static/images/{after_filename}"
    else:
        after_rel_url = None

    return before_rel_url, after_rel_url
