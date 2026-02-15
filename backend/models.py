from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class StudyMaterial(BaseModel):
    id: str
    filename: str
    content_type: str
    summary: Optional[str] = None
    upload_date: date


class Flashcard(BaseModel):
    question: str
    answer: str

class ChallengeType(BaseModel):
    type: str  # "QUIZ", "MATCH", "TRUE_FALSE"
    question: str
    correct_answer: str
    distractors: List[str] = []  # Wrong answers for Quiz
    pair: Optional[str] = None   # For matching, the corresponding pair

class Topic(BaseModel):
    id: str
    title: str
    description: str
    estimated_hours: float
    material_id: str  # Link back to source material
    flashcards: List[Flashcard] = []
    games: List[ChallengeType] = [] # New field for gamified content
    status: str = "OPEN"  # OPEN, MASTERED, STRUGGLING

class DaySchedule(BaseModel):
    date: date
    topics: List[Topic]
    total_hours: float

class StudyPlan(BaseModel):
    id: str
    user_id: str = "Dummy" # Default for migration
    title: str = "My Learning Journey" # Default title
    exam_date: date
    parallel_courses: int
    daily_goal_hours: float = 2.0
    study_days: List[int] = [0,1,2,3,4,5,6] # Default all days (0=Mon, 6=Sun)
    schedule: List[DaySchedule]
    # Metadata for the plan logic
    created_at: date

class PodcastLine(BaseModel):
    speaker: str  # "Host" (Expert) or "Student" (Curious)
    text: str

class PodcastResponse(BaseModel):
    title: str
    script: List[PodcastLine]

class User(BaseModel):
    id: str  # UUID
    email: str
    full_name: Optional[str] = None
    role: str = "user" # "user" or "admin"
    disabled: Optional[bool] = None
    tier: str = "standard" # "standard" or "pro"

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    disabled: Optional[bool] = None
    role: Optional[str] = None
    tier: Optional[str] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
