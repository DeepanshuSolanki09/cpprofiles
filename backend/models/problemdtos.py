from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class ProblemBase(BaseModel):
    title: str
    url: str
    platform: str
    rating: Optional[int] = None
    difficulty: Optional[str] = None
    topics: Optional[List[str]] = None
    embedding_score: Optional[float] = None

class ProblemCreate(ProblemBase):
    pass

class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    platform: Optional[str] = None
    rating: Optional[int] = None
    difficulty: Optional[str] = None
    topics: Optional[List[str]] = None
    embedding_score: Optional[float] = None

class ProblemResponse(ProblemBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
