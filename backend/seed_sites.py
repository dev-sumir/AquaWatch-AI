import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.site import Site
from models.observation import Observation

from datetime import datetime

def seed_sites():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Site).count() > 0:
            print("Sites already seeded.")
            return

        print("Seeding demo site (Buddha Nullah)...")
        buddha_nullah = Site(
            name="Buddha Nullah, Ludhiana",
            latitude=30.937250,
            longitude=75.693023,
            site_type="River",
            description="Highly polluted stream running through Ludhiana.",
            image_before_url="/static/buddha_nullah_before.jpg",
            image_after_url="/static/buddha_nullah_after.jpg"
        )
        db.add(buddha_nullah)
        db.commit()
        print("Successfully seeded demo site.")
    except Exception as e:
        print(f"Error seeding sites: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_sites()
