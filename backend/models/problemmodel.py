from sqlalchemy import Column, Integer, String, Float, JSON
from utils.db import Base

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    url = Column(String, nullable=False)
    platform = Column(String, nullable=False, index=True)
    rating = Column(Integer, nullable=True)
    difficulty = Column(String, nullable=True)
    topics = Column(JSON, nullable=True)
    embedding_score = Column(Float, nullable=True)
