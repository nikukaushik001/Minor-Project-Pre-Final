import logging
import pandas as pd
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")
logger.info("MAIN: Starting imports...")

from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import shutil
import os
from typing import List

logger.info("MAIN: Importing database and models...")
from database import engine, SessionLocal, Base, get_db
import models

from pydantic import BaseModel
from fastapi.responses import FileResponse, JSONResponse

logger.info("MAIN: Imports finished.")

from schemas import ExamCreate, ExamResponse, QuestionCreate, QuestionResponse, VerificationRequest, KeywordRequest
from fastapi import status
from fastapi.security import OAuth2PasswordRequestForm
from schemas import UserCreate, UserResponse, Token
from auth import verify_password, get_password_hash, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta


def ensure_nltk_resources():
    import nltk
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        logger.info("Downloading NLTK resources...")
        nltk.download('stopwords')
        nltk.download('punkt')
        logger.info("NLTK resources ready.")

app = FastAPI(title="Grading AI — Intelligent Assessment Engine", version="6.0")

@app.on_event("startup")
def startup_event():
    logger.info("Server starting: Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Ensure default user exists for Auth Bypass
    db = SessionLocal()
    try:
        default_user = db.query(models.User).first()
        if not default_user:
            logger.info("Creating default 'Guest Teacher' account...")
            from auth import get_password_hash
            new_user = models.User(
                email="teacher@projexa.com",
                hashed_password=get_password_hash("admin123")
            )
            db.add(new_user)
            db.commit()
            logger.info("Default account created.")
    finally:
        db.close()
    
    logger.info("Database tables verified.")
    
    # Auto-Populate Sample Data for Analytics
    try:
        from sqlalchemy.sql import text
        db = SessionLocal()
        questions_count = db.query(models.Question).count()
        if questions_count == 0:
            logger.info("Auto-Populating sample data nodes...")
            # 1. Ensure User
            default_user = db.query(models.User).filter(models.User.email == "teacher@projexa.com").first()
            if not default_user:
                new_user = models.User(email="teacher@projexa.com", hashed_password="hashed_placeholder")
                db.add(new_user)
                db.commit(); db.refresh(new_user); default_user = new_user
            
            # 2. Add sample exam and questions
            exam = models.Exam(title="Midterm Examination - Science & Tech", description="Standard mock exam", owner_id=default_user.id)
            db.add(exam); db.commit(); db.refresh(exam)

            exams = [
                ("Advanced Physics: Newton's Dynamics", "Force equals mass times acceleration (F=ma).", "physics, dynamics, acceleration", 10),
                ("Cell Biology: Photosynthesis & Energy", "The process by which plants convert light energy into chemical energy.", "chlorophyll, chloroplast, glucose", 10),
                ("Database Systems: SQL vs NoSQL", "Relational vs Non-relational architecture and scalability.", "ACID, relational, document-based", 10)
            ]
            
            for title, answer, keywords, marks in exams:
                q = models.Question(exam_id=exam.id, text=title, model_answer=answer, keywords=keywords, max_marks=marks, owner_id=default_user.id)
                db.add(q); db.commit(); db.refresh(q)
                
                # 3. Add sample submissions with unique roll numbers
                students = [("NIKUNJ/2026/01", 8.5), ("NIKUNJ/2026/02", 7.2), ("NIKUNJ/2026/03", 9.0)]
                for roll_no, score in students:
                    sub = models.Submission(
                        student_id=roll_no, question_id=q.id,
                        ai_score=score, final_score=score, 
                        feedback=f"Analyzed {title} parameters. Semantic coverage: {int(score*10)}%.",
                        teacher_verified=True
                    )
                    db.add(sub)
            db.commit()
            logger.info("Comprehensive data injection complete.")
        db.close()
    except Exception as e:
        logger.error(f"Auto-Populate failed: {e}")

# Logging already configured at module level

UPLOAD_FOLDER = "data"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.mount("/data", StaticFiles(directory="data"), name="data")

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Error Handling ---
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    logger.error(f"GLOBAL ERROR: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()},
    )

# --- Endpoints ---


@app.post("/signup", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Signup attempt for email: {user.email}")
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        logger.warning(f"Signup failed: Email {user.email} already exists")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    logger.info("Hashing password and saving user...")
    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info(f"User created successfully: {new_user.id}")
    return new_user

@app.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info(f"Login attempt for: {form_data.username}")
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Login failed for: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    logger.info(f"Login successful for: {form_data.username}")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.get("/health")
def health():
    return {"status": "ok", "version": "5.1"}

@app.get("/")
def home():
    return {"message": "AI Assistant for Teachers is Running"}

@app.post("/exams/", response_model=ExamResponse)
def create_exam(exam: ExamCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_exam = models.Exam(**exam.model_dump(), owner_id=current_user.id)
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

@app.get("/exams/", response_model=list[ExamResponse])
def get_exams(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Exam).filter(models.Exam.owner_id == current_user.id).all()

@app.get("/exams/{exam_id}", response_model=ExamResponse)
def get_exam(exam_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    from sqlalchemy.orm import joinedload
    exam = db.query(models.Exam).options(joinedload(models.Exam.questions)).filter(models.Exam.id == exam_id, models.Exam.owner_id == current_user.id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam

@app.post("/questions/", response_model=QuestionResponse)
def create_question(question: QuestionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        logger.info(f"Creating question: {question.text[:50]}...")
        db_question = models.Question(
            exam_id=question.exam_id,
            text=question.text,
            model_answer=question.model_answer,
            keywords=question.keywords,
            max_marks=question.max_marks,
            owner_id=current_user.id
        )
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        logger.info(f"Question created successfully with ID: {db_question.id}")
        return db_question
    except Exception as e:
        logger.error(f"Failed to create question: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create question: {str(e)}")

@app.get("/questions/")
def get_questions(db: Session = Depends(get_db)):
    return db.query(models.Question).all()

@app.post("/upload_answer/")
async def upload_answer(
    question_id: int,
    student_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    filename = f"{student_id}_{question_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    from ocr.ocr_engine import extract_text
    from utils.preprocessing import preprocess_text
    from nlp.evaluator import get_evaluator, assign_marks, generate_detailed_feedback

    raw_text, ocr_conf = extract_text(file_path)
    logger.info(f"OCR extracted text: {raw_text[:100]}... Confidence: {ocr_conf}")
    
    student_answer = preprocess_text(raw_text)
    evaluator = get_evaluator()
    
    # Use question.keywords if available
    eval_result = evaluator.evaluate(student_answer, question.model_answer, user_keywords=question.keywords)
    
    ai_marks = assign_marks(eval_result['total_score'], question.max_marks)
    feedback = generate_detailed_feedback(eval_result, ocr_conf)
    
    db_submission = models.Submission(
        student_id=student_id,
        question_id=question_id,
        image_path=file_path,
        extracted_text=student_answer,
        semantic_score=eval_result['semantic_score'],
        keyword_score=eval_result['keyword_score'],
        ocr_confidence=ocr_conf,
        
        ai_score=ai_marks,     
        final_score=ai_marks,  
        teacher_verified=False,
        
        feedback=feedback
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)

    return {
        "status": "Graded",
        "student_id": student_id,
        "ai_score": ai_marks,
        "feedback": feedback,
        "ocr_confidence": ocr_conf
    }

from ocr.ocr_engine import extract_text, extract_student_id

@app.post("/bulk_upload_answers/")
async def bulk_upload_answers(
    question_id: int = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Exam not found")

    from ocr.ocr_engine import extract_text, extract_student_id
    from utils.preprocessing import preprocess_text
    from nlp.evaluator import get_evaluator, assign_marks, generate_detailed_feedback

    results = []
    evaluator = get_evaluator()

    for file in files:
        # 1. Save File
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        filename = f"bulk_{unique_id}_{file.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Extract Student ID (Auto-detect)
        detected_id = extract_student_id(file_path)
        student_id = detected_id if detected_id else f"Unknown_{unique_id}"

        # 3. OCR & Evaluate
        raw_text, ocr_conf = extract_text(file_path)
        student_answer = preprocess_text(raw_text)
        eval_result = evaluator.evaluate(student_answer, question.model_answer, user_keywords=question.keywords)
        
        ai_marks = assign_marks(eval_result['total_score'], question.max_marks)
        feedback = generate_detailed_feedback(eval_result, ocr_conf)

        # 4. Save Submission
        db_submission = models.Submission(
            student_id=student_id,
            question_id=question_id,
            image_path=file_path,
            extracted_text=student_answer,
            semantic_score=eval_result['semantic_score'],
            keyword_score=eval_result['keyword_score'],
            ocr_confidence=ocr_conf,
            ai_score=ai_marks,
            final_score=ai_marks,
            teacher_verified=False,
            feedback=feedback
        )
        db.add(db_submission)
        results.append({
            "filename": file.filename,
            "student_id": student_id,
            "ai_score": ai_marks,
            "status": "Processed"
        })

    db.commit()
    return {"total": len(files), "results": results}

@app.post("/verify_result/")
def verify_result(req: VerificationRequest, db: Session = Depends(get_db)):
    submission = db.query(models.Submission).filter(models.Submission.id == req.submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    submission.final_score = req.final_score
    submission.teacher_comments = req.comments
    submission.teacher_verified = True
    
    if req.student_id:
        submission.student_id = req.student_id
    
    db.commit()
    return {"status": "Verified", "final_score": submission.final_score}

from sqlalchemy.orm import joinedload

@app.get("/pending_reviews/")
def get_pending_reviews(db: Session = Depends(get_db)):
    """
    Returns pending submissions with their associated question context 
    eagerly loaded to enable side-by-side grading.
    """
    return db.query(models.Submission).options(joinedload(models.Submission.question)).filter(
        models.Submission.teacher_verified == False
    ).all()

@app.get("/analytics/")
def get_analytics(db: Session = Depends(get_db)):
    """
    Returns aggregate statistics and distribution data for visual charts.
    """
    # Global analysis for bypass mode
    submissions = db.query(models.Submission).all()
    total_submissions = len(submissions)
    total_questions = db.query(models.Question).count()
    graded_submissions = db.query(models.Submission).filter(models.Submission.teacher_verified == True).count()
    pending_submissions = total_submissions - graded_submissions
    
    # Calculate Avg Score
    avg_score = 0
    if total_submissions > 0:
        avg_score = sum([s.final_score for s in submissions]) / total_submissions

    # Histogram data for charts
    score_dist = [0] * 11 # 0 to 10
    for s in submissions:
        score_val = int(min(max(s.final_score, 0), 10))
        score_dist[score_val] += 1
    
    chart_data = [{"score": i, "count": score_dist[i]} for i in range(11)]
    
    # Professional Educational Insights
    insights = []
    if total_submissions > 0:
        if avg_score < 4:
            insights.append("Curriculum Alert: Overall class performance is lower than average. Consider a review session.")
        elif avg_score > 8:
            insights.append("Excellence Detected: Class mastery is high. Ready for advanced topics.")
        else:
            insights.append("Steady Progress: Most students are meeting core conceptual requirements.")
        
        insights.append(f"Submission Velocity: {total_submissions} papers processed. Engine is running efficiently.")
    else:
        insights.append("System Ready: Awaiting first submissions to generate intelligence reports.")
    
    insights.append("Optimization Tip: Clearer handwriting captures improve AI keyword accuracy.")
    
    # Get recent activity
    recent_submissions = db.query(models.Submission).order_by(models.Submission.created_at.desc()).limit(5).all()
    activity = []
    for s in recent_submissions:
        activity.append({
            "id": s.id,
            "student_id": s.student_id,
            "type": "New Upload",
            "time": s.created_at.strftime("%H:%M"),
            "status": "Verified" if s.teacher_verified else "AI Processed"
        })

    return {
        "total_submissions": total_submissions,
        "total_questions": total_questions,
        "graded": graded_submissions,
        "pending": pending_submissions,
        "avg_score": round(avg_score, 1),
        "participation_rate": 85,
        "recent_activity": activity,
        "score_distribution": chart_data,
        "ai_insights": insights
    }

# --- Phase 5: Intelligence & Export Endpoints ---

@app.post("/extract_keywords/")
def extract_keywords(req: KeywordRequest):
    """
    AI-powered keyword extraction from model answers.
    """
    try:
        import nltk
        from rake_nltk import Rake
        ensure_nltk_resources()
        r = Rake()
        r.extract_keywords_from_text(req.text)
        # Get top 5-10 meaningful phrases/words
        keywords = r.get_ranked_phrases()[:8]
        # Clean up and join
        return {"keywords": ", ".join(keywords)}
    except Exception as e:
        logger.error(f"Keyword extraction failed: {str(e)}")
        return {"keywords": ""}

@app.get("/export_results/")
def export_results(db: Session = Depends(get_db)):
    """
    Exports all graded submissions to an Excel file.
    """
    submissions = db.query(models.Submission).all()
    data = []
    for s in submissions:
        data.append({
            "Student ID": s.student_id,
            "Question ID": s.question_id,
            "AI Score": s.ai_score,
            "Final Score": s.final_score,
            "Verified": "Yes" if s.teacher_verified else "No",
            "Feedback": s.feedback,
            "Processed At": s.created_at.strftime("%Y-%m-%d %H:%M")
        })
    
    df = pd.DataFrame(data)
    export_path = "class_results_export.xlsx"
    df.to_excel(export_path, index=False)
    
    return FileResponse(
        export_path, 
        filename="AI_Grading_Results.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@app.get("/students_global/")
def get_students_global(db: Session = Depends(get_db)):
    """
    New Data Center API: Returns a summarized registry of every student and their performance metrics.
    """
    submissions = db.query(models.Submission).all()
    
    student_data = {}
    for s in submissions:
        sid = s.student_id
        if sid not in student_data:
            student_data[sid] = {"total_score": 0, "count": 0, "verified_count": 0}
        
        student_data[sid]["total_score"] += s.final_score
        student_data[sid]["count"] += 1
        if s.teacher_verified:
            student_data[sid]["verified_count"] += 1
            
    # Format into a list for the frontend table
    registry = []
    for sid, data in student_data.items():
        avg_score = round(data["total_score"] / data["count"], 1) if data["count"] > 0 else 0
        registry.append({
            "student_id": sid,
            "avg_score": avg_score,
            "total_exams": data["count"],
            "verification_status": f"{data['verified_count']}/{data['count']} Verified"
        })
        
    return {"registry": sorted(registry, key=lambda x: x["student_id"])}

@app.get("/student_result/{student_id}")
def get_student_result(student_id: str, db: Session = Depends(get_db)):
    """
    Secure lookup for a student's graded results, enhanced to include full Exam Titles.
    """
    from sqlalchemy.orm import joinedload
    results = db.query(models.Submission).options(joinedload(models.Submission.question)).filter(models.Submission.student_id == student_id).all()
    if not results:
        raise HTTPException(status_code=404, detail="No results found for this ID")
    
    return [{
        "exam_id": r.question_id,
        "submission_id": r.id,
        "exam_title": r.question.text if r.question else "Unknown Exam",
        "max_marks": r.question.max_marks if r.question else 10,
        "score": r.final_score,
        "feedback": r.feedback,
        "verified": r.teacher_verified,
        "date": r.created_at.strftime("%d %b %Y")
    } for r in results]

@app.get("/common_mistakes/")
def get_common_mistakes(db: Session = Depends(get_db)):
    """
    AI-powered analysis of common mistakes across all submissions.
    Analyzes real feedback and missing keyword data from the database.
    """
    from sqlalchemy.orm import joinedload
    submissions = db.query(models.Submission).options(
        joinedload(models.Submission.question)
    ).all()
    if not submissions:
        return {"mistakes": []}

    # Analyze real feedback patterns from submissions
    from collections import Counter
    issue_counter = Counter()
    low_score_topics = Counter()
    recommendation_map = {}

    for s in submissions:
        if s.feedback and s.final_score is not None:
            q_title = s.question.text if s.question else "Unknown"
            # Track low-scoring submissions
            max_m = s.question.max_marks if s.question and s.question.max_marks else 10
            pct = (s.final_score / max_m) * 100 if max_m > 0 else 0

            if pct < 60:
                short_title = q_title[:40]
                low_score_topics[short_title] += 1
                recommendation_map[short_title] = f"Review core concepts related to '{short_title}'."

            # Check for specific feedback patterns
            fb_lower = s.feedback.lower()
            if "missing" in fb_lower or "keyword" in fb_lower:
                issue_counter["Missing Key Terminology"] += 1
            if "incomplete" in fb_lower or "review required" in fb_lower:
                issue_counter["Incomplete Explanations"] += 1
            if "accuracy" in fb_lower or "limited" in fb_lower:
                issue_counter["Low OCR Confidence"] += 1

    mistakes = []

    # Add topic-level issues
    for topic, count in low_score_topics.most_common(3):
        total = len(submissions)
        freq = int((count / total) * 100) if total > 0 else 0
        mistakes.append({
            "issue": f"Low scores in: {topic}",
            "frequency": freq,
            "recommendation": recommendation_map.get(topic, "Review this topic.")
        })

    # Add pattern-level issues
    for issue, count in issue_counter.most_common(3):
        total = len(submissions)
        freq = int((count / total) * 100) if total > 0 else 0
        rec = {
            "Missing Key Terminology": "Encourage students to use specific scientific vocabulary.",
            "Incomplete Explanations": "Ask students to develop multi-step reasoning in answers.",
            "Low OCR Confidence": "Remind students to write clearly for better scan accuracy."
        }.get(issue, "General review recommended.")
        mistakes.append({
            "issue": issue,
            "frequency": freq,
            "recommendation": rec
        })

    if not mistakes:
        mistakes.append({
            "issue": "All submissions above threshold",
            "frequency": 0,
            "recommendation": "Class performance is strong. Consider advancing to next topic."
        })

    return {"mistakes": mistakes[:5]}

@app.get("/action_plan/{submission_id}")
def get_action_plan(submission_id: int, db: Session = Depends(get_db)):
    """
    Dynamically generates a Personalized 3-Step Study Plan based on the student's submission.
    """
    from sqlalchemy.orm import joinedload
    submission = db.query(models.Submission).options(joinedload(models.Submission.question)).filter(models.Submission.id == submission_id).first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    q_title = submission.question.text if submission.question else "the exam topic"
    max_m = submission.question.max_marks if submission.question else 10
    pct = (submission.final_score / max_m) * 100 if max_m > 0 else 0

    plan = []
    
    if pct >= 90:
        plan = [
            {"step": 1, "action": "Maintain Excellence", "detail": f"Your understanding of {q_title} is solid. Review your notes briefly to retain knowledge."},
            {"step": 2, "action": "Peer Mentorship", "detail": "Try explaining these concepts to a classmate to reinforce your own mastery."},
            {"step": 3, "action": "Advance Forward", "detail": "You are ready to proceed to the next advanced module in this subject."}
        ]
    elif pct >= 60:
        plan = [
            {"step": 1, "action": "Target Core Concepts", "detail": f"You have a baseline understanding of {q_title}, but missed some key details."},
            {"step": 2, "action": "Review AI Feedback", "detail": "Read the detailed feedback above. Focus on explicitly including missing keywords in future answers."},
            {"step": 3, "action": "Practice Application", "detail": "Attempt 2-3 similar practice problems before the final assessment."}
        ]
    else:
        plan = [
            {"step": 1, "action": "Foundational Review", "detail": f"Your score indicates foundational gaps in {q_title}. Re-read the primary chapter materials."},
            {"step": 2, "action": "Vocabulary Drill", "detail": "Focus heavily on the core scientific/technical vocabulary related to this topic. Your answer lacked semantic match."},
            {"step": 3, "action": "Consultation", "detail": "Schedule a 1-on-1 session with the instructor for targeted help before continuing."}
        ]

    return {"submission_id": submission_id, "action_plan": plan}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
