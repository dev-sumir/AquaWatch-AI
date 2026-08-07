from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    site_type = Column(String(50))
    description = Column(Text)
    image_before_url = Column(Text)
    image_after_url = Column(Text)
    created_at = Column(DateTime, default=func.now())
