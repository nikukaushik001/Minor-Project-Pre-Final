from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class ExamCreate(BaseModel):
    title: str
    description: str | None = None
    total_marks: int = 0

class QuestionCreate(BaseModel):
    exam_id: int | None = None
    text: str
    model_answer: str
    keywords: str = None
    max_marks: int = 10

class QuestionResponse(BaseModel):
    id: int
    exam_id: int | None = None
    text: str
    model_answer: str
    keywords: str | None = None
    max_marks: int

    class Config:
        from_attributes = True

class ExamResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    total_marks: int
    questions: list[QuestionResponse] = []

    class Config:
        from_attributes = True

class VerificationRequest(BaseModel):
    submission_id: int
    final_score: float
    comments: str = None
    student_id: str = None

class KeywordRequest(BaseModel):
    text: str
