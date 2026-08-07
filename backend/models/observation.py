from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Index
from database import Base

class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"))
    date = Column(Date, nullable=False)
    ndwi = Column(Float)
    ndvi = Column(Float)
    cloud_cover_pct = Column(Float)
    source = Column(String(50), default="Sentinel-2")

Index('idx_obs_site_date', Observation.site_id, Observation.date)
