from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Index
from sqlalchemy.sql import func
from database import Base

class AnomalyScore(Base):
    __tablename__ = "anomaly_scores"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"))
    computed_at = Column(DateTime, default=func.now())
    score = Column(Float)
    severity = Column(String(20))
    baseline_mean = Column(Float)
    baseline_std = Column(Float)
    current_value = Column(Float)
    metric_used = Column(String(20))
    verdict_text = Column(Text)

Index('idx_scores_site_time', AnomalyScore.site_id, AnomalyScore.computed_at)
