from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models, schemas, scraper, llm_service

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wiki Quiz Generator API")

# CORS Setup (Allow Frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace * with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate", response_model=schemas.QuizResponse)
def generate_quiz(request: schemas.QuizRequest, db: Session = Depends(get_db)):
    # 1. Check if URL already exists in DB (Caching)
    existing_quiz = db.query(models.QuizResult).filter(models.QuizResult.url == request.url).first()
    if existing_quiz:
        return existing_quiz

    # 2. Scrape Wikipedia
    try:
        scraped_data = scraper.scrape_wikipedia(request.url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Scraping failed: {str(e)}")

    # 3. Generate Quiz via LLM
    llm_result = llm_service.generate_quiz_content(scraped_data['full_text'])
    
    if not llm_result:
        raise HTTPException(status_code=500, detail="Failed to generate quiz content")

    # 4. Construct Final Data Structure
    final_quiz_data = {
        "key_entities": llm_result.get("key_entities"),
        "sections": scraped_data.get("sections"),
        "quiz": llm_result.get("quiz"),
        "related_topics": llm_result.get("related_topics")
    }

    # 5. Save to Database
    new_quiz = models.QuizResult(
        url=request.url,
        title=scraped_data['title'],
        summary=scraped_data['summary'],
        quiz_data=final_quiz_data
    )
    
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)
    
    return new_quiz

@app.get("/quizzes", response_model=list[schemas.QuizResponse])
def get_history(db: Session = Depends(get_db)):
    return db.query(models.QuizResult).order_by(models.QuizResult.created_at.desc()).all()

@app.get("/quizzes/{quiz_id}", response_model=schemas.QuizResponse)
def get_quiz_detail(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(models.QuizResult).filter(models.QuizResult.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz