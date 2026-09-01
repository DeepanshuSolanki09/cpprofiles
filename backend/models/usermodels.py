from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import relationship
from utils.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    profile_picture = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    skills = Column(String, nullable=True)

    profile = relationship("Profile", back_populates="user", uselist=False)

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    cf_username = Column(String, nullable=True)
    cc_username = Column(String, nullable=True)
    atcoder_username = Column(String, nullable=True)
    leetcode_username = Column(String, nullable=True)
    github_username = Column(String, nullable=True)

    user = relationship("User", back_populates="profile")
    