from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    exams = relationship("Exam", back_populates="owner")
    questions = relationship("Question", back_populates="owner")

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    total_marks = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="exams")

    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    model_answer = Column(Text, nullable=False)
    keywords = Column(Text) 
    max_marks = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    exam_id = Column(Integer, ForeignKey("exams.id"))
    exam = relationship("Exam", back_populates="questions")

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="questions")

    submissions = relationship("Submission", back_populates="question")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True) 
    question_id = Column(Integer, ForeignKey("questions.id"))
    
    image_path = Column(String)
    extracted_text = Column(Text)
    
    # AI Analysis
    semantic_score = Column(Float)
    keyword_score = Column(Float)
    ocr_confidence = Column(Float)
    
    # Grading State
    ai_score = Column(Float)         # Score given by AI (0-10)
    final_score = Column(Float)      # Final score approved by Teacher
    teacher_verified = Column(Boolean, default=False)
    teacher_comments = Column(Text)  # Optional manual feedback
    
    feedback = Column(Text)          # AI Feedback
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("Question", back_populates="submissions")
