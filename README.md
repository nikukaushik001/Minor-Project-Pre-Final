# 🎓 Grading AI — Intelligent Assessment Engine

> **Minor Project | KRMU 2026**
> An intelligent, end-to-end automated exam grading platform built for teachers. Upload handwritten answer sheets, get AI-generated scores and feedback instantly.

---

## 🚀 Quick Start (One Click)

Double-click **`run_projexa.bat`** in the project root.

This will:
1. Start the FastAPI backend on `http://localhost:8000`
2. Start the React frontend on `http://localhost:5173`

**Default login:** `teacher@projexa.com` / `admin123`

---

## 🧠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + Vite + TailwindCSS + Framer Motion |
| **Backend** | FastAPI (Python) |
| **Database** | SQLite (via SQLAlchemy) |
| **OCR Engine** | EasyOCR + OpenCV (preprocessing pipeline) |
| **NLP Scoring** | SentenceTransformers (all-MiniLM-L6-v2) + KeyBERT |
| **Auth** | JWT Bearer Tokens (python-jose + bcrypt) |

---

## 📖 How It Works

```
Teacher creates Exam Paper
    → adds questions with model answers & keywords

Teacher scans & uploads physical answer sheets (Bulk)
    → EasyOCR extracts text per student
    → Semantic similarity + keyword coverage → AI Score

Teacher reviews & approves grades in Cockpit
    → AI feedback & remediation generated per student

Students visit Result Lookup portal
    → enter Roll Number to view verified scores & feedback
```

---

## 🗂️ Project Structure

```
Projexa Project/
├── backend/
│   ├── main.py              # FastAPI app + all routes
│   ├── models.py            # SQLAlchemy DB models (Users, Exams, Questions, Submissions)
│   ├── schemas.py           # Pydantic request/response models
│   ├── auth.py              # JWT authentication
│   ├── ocr/
│   │   └── ocr_engine.py    # EasyOCR + OpenCV image preprocessing
│   ├── nlp/
│   │   └── evaluator.py     # HybridEvaluator (semantic + keyword scoring)
│   └── utils/
│       └── preprocessing.py # OCR text cleaning pipeline
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── LandingPage.jsx
│       │   ├── Dashboard.jsx       # Exam Papers list
│       │   ├── ExamWorkspace.jsx   # Questions inside an exam
│       │   ├── CreateExam.jsx      # New exam paper form
│       │   ├── CreateQuestion.jsx  # Add question to exam
│       │   ├── GradingCockpit.jsx  # Teacher review panel
│       │   ├── ResultLookup.jsx    # Student result lookup
│       │   └── StudentRegistry.jsx # Student data center
│       └── App.jsx                 # Routes
└── run_projexa.bat          # One-click launcher
```

---

## 🎬 Demo Video Script (for explanation video)

**Scene 1 — Landing Page (0:00–0:20)**
> "Welcome to Grading AI, an AI-powered exam grading system built for teachers. With Grading AI, you can create digital exam papers, upload handwritten answer sheets from students, and get instant AI-generated scores — all in one platform."

**Scene 2 — Dashboard (0:20–0:45)**
> "The dashboard shows all exam papers. Click 'New Exam' to create one. Give it a title — for example, 'Midterm Biology'. Then we're taken directly into the workspace."

**Scene 3 — ExamWorkspace (0:45–1:15)**
> "This is the Question Paper Workspace. Click 'Add Question' to configure a question. We enter the question text, the ideal model answer, and optionally let the AI suggest keywords for us. Hit Save Question — and it appears in the workspace."

**Scene 4 — Student Upload (1:15–1:45)**
> "Students visit the upload portal, select their question, enter their roll number, and upload a photo of their handwritten answer. The system runs OCR to extract the text, then the AI evaluates it against the model answer."

**Scene 5 — Grading Cockpit (1:45–2:15)**
> "The teacher then opens the Grading Cockpit. Every unreviewed submission appears here. We can see the extracted text with keywords highlighted, the AI's score and reasoning, and adjust with the precision slider. One click to approve."

**Scene 6 — Analytics & Export (2:15–2:30)**
> "The analytics dashboard shows score distribution, common student mistakes, and AI insights. Export all results to Excel for institutional records. That's Grading AI."

---

## ✅ Features Checklist

- [x] JWT Authentication (teacher login)
- [x] Teacher Scans & Ingests student papers directly (Integrity Priority)
- [x] Bulk student answer uploads via Teacher Workspace
- [x] EasyOCR with advanced image preprocessing
- [x] Hybrid AI scoring (semantic + keyword)
- [x] Teacher verification & score override
- [x] Student roll number auto-detection
- [x] Student Registry & Result Lookup
- [x] Analytics dashboard with score distribution
- [x] Common mistakes AI analysis
- [x] Personalized 3-step AI action plan per student
- [x] Export to Excel (.xlsx)
- [x] One-click launch script
- [x] Cheating Prevention: Restricted Student Access

---

*Grading AI — Built for KRMU Minor Project 2026*
