from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(String(30), unique=True, nullable=False)
    title = Column(String(200), nullable=False)
    location = Column(String(200), nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    record_date = Column(DateTime, default=func.now())
    condition_type = Column(String(100))
    severity = Column(String(20))
    status = Column(String(50), default="Under Review")
    department = Column(String(100))
    detected_anomaly = Column(Text)
    spectral_indicators = Column(Text)
    recommendations = Column(Text)
    notes = Column(Text)
    ndwi_value = Column(Float)
    ndvi_value = Column(Float)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=True)
    # Attachment fields
    attachment_name = Column(String(255))
    attachment_type = Column(String(20))  # "image", "document", "url"
    attachment_url = Column(Text)
    attachment_original_filename = Column(String(255))
    attachment_size_bytes = Column(Integer)
    attachment_mime_type = Column(String(100))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
