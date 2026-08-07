import ee

def get_dynamic_image_urls(lat, lon, baseline_start, baseline_end, current_start, current_end):
    """
    Returns the live Earth Engine thumbnail URLs directly.
    """
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

    before_url = get_url(baseline_start, baseline_end)
    after_url = get_url(current_start, current_end)

    return before_url, after_url
