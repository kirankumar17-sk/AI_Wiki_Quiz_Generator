from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class QuizRequest(BaseModel):
    url: str

class Question(BaseModel):
    question: str
    options: List[str]
    answer: str
    difficulty: str
    explanation: str

class QuizResponse(BaseModel):
    id: int
    url: str
    title: str
    summary: str
    quiz_data: Dict[str, Any] # Holds key_entities, sections, related_topics, questions
    created_at: datetime

    class Config:
        from_attributes = True