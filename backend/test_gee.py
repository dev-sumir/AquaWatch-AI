import sys
import os

# Add current dir to path to import pipeline and config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load config to get env vars
import config
from pipeline.gee_client import initialize_ee, test_query

if __name__ == "__main__":
    try:
        initialize_ee()
        test_query()
    except Exception as e:
        print(f"Error during GEE testing: {e}")
