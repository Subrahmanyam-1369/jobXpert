from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, Text, ForeignKey
from ..db import Base

class JobStatus(Enum):
    applied = "Applied"
    interviewing = "Interviewing"
    offer = "Offer"
    rejected = "Rejected"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    company = Column(String(120), nullable=False)
    role = Column(String(120), nullable=False)
    link = Column(String(255))
    status = Column(SQLEnum(JobStatus), default=JobStatus.applied, nullable=False)
    applied_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)
