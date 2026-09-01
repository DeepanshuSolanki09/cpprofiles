from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional

class ProfileBase(BaseModel):
    cf_username: Optional[str] = None
    cc_username: Optional[str] = None
    atcoder_username: Optional[str] = None
    leetcode_username: Optional[str] = None
    github_username: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    name: str
    email: EmailStr
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None

class UserCreate(UserBase):
    password: str
    profile: Optional[ProfileCreate] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    profile: Optional[ProfileUpdate] = None

class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    profile: Optional[ProfileResponse] = None
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"

    model_config = ConfigDict(from_attributes=True)

