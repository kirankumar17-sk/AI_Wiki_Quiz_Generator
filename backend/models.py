from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from database import Base

class QuizResult(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, index=True)
    title = Column(String)
    summary = Column(Text)
    # Storing the complex nested structure (questions, options, entities) as JSON
    quiz_data = Column(JSON) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())