from sqlalchemy.orm import Session
from sqlalchemy import desc
import models, schemas

def get_quiz_by_url(db: Session, url: str):
    """
    Check if a quiz for this URL already exists in the database.
    Useful for caching to avoid re-scraping/re-generating.
    """
    return db.query(models.QuizResult).filter(models.QuizResult.url == url).first()

def get_quiz_by_id(db: Session, quiz_id: int):
    """
    Retrieve a specific quiz by its ID.
    Used for the 'Details' modal.
    """
    return db.query(models.QuizResult).filter(models.QuizResult.id == quiz_id).first()

def get_quizzes(db: Session, skip: int = 0, limit: int = 100):
    """
    Retrieve all past quizzes, ordered by newest first.
    Used for the 'History' tab (Tab 2).
    """
    return db.query(models.QuizResult).order_by(desc(models.QuizResult.created_at)).offset(skip).limit(limit).all()

def create_quiz(db: Session, url: str, title: str, summary: str, quiz_data: dict):
    """
    Save a newly generated quiz to the database.
    """
    db_quiz = models.QuizResult(
        url=url,
        title=title,
        summary=summary,
        quiz_data=quiz_data
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz                        