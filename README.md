# 🎓 AI Powered Chatbot for University Student Support (UniAssist AI)

> A modern, resilient, full-stack AI conversational assistant designed specifically for university students, featuring an automatic, zero-downtime offline knowledge base fallback mechanism.

[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python)](https://www.python.org/)
[![Status](https://img.shields.io/badge/Resilience-Dual--Engine%20Fallback-10B981)](#-dataset-fallback-mechanism)

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Project Architecture](#-project-architecture)
5. [Folder Structure](#-folder-structure)
6. [Installation & Setup](#-installation--setup)
   - [Backend Setup](#1-backend-setup)
   - [Frontend Setup](#2-frontend-setup)
7. [Environment Variables](#-environment-variables)
8. [How to Run the Application](#-how-to-run-the-application)
9. [API Endpoints Reference](#-api-endpoints-reference)
10. [Dataset Fallback Mechanism & Viva Demo](#-dataset-fallback-mechanism--viva-demo)
11. [Knowledge Base Categories](#-knowledge-base-categories)
12. [Security & Error Handling](#-security--error-handling)
13. [Future Improvements](#-future-improvements)

---

## 🌟 Project Overview

**UniAssist AI** is designed specifically to help university and college students navigate academic life, campus administrative procedures, course registrations, fee deadlines, examination protocols, campus living, and student services.

While state-of-the-art Large Language Models (LLMs) provide rich and conversational answers, external AI APIs frequently suffer from rate limits, token quotas, unexpected network interruptions, or high latency. 

**UniAssist AI solves this problem with a dual-engine architecture:**
When the external AI API is available, students receive dynamic, context-aware AI answers. If the AI API reaches its quota/token limit, experiences a timeout, or fails for any reason, the backend **automatically and seamlessly cascades to an indexed local knowledge base** (`data/student_faq.json`) containing 50+ verified university Q&As. Students are never shown raw technical stack traces or service disruptions.

---

## ✨ Key Features

- **✦ Dual-Engine Intelligence**: Primary AI API processing with transparent, zero-downtime local dataset fallback.
- **◈ Predefined Institutional Knowledge Base**: 52 realistic, verified questions and answers spanning 20 campus life categories.
- **⚡ Smart Matching Engine**: Multi-factor matching system combining tokenization, Jaccard similarity, keyword weighting, and category boosting.
- **🎨 Modern Glassmorphism UI**: Deep navy / indigo aesthetic, soft glows, responsive drawer sidebar, fluid animations, and mobile-first layout.
- **🏷️ Transparent Source Badges**: Subtle visual attribution indicators (`✦ AI Generated` vs `◈ University Knowledge Base`) so students understand the information source.
- **🎙️ Viva Presentation Mode Switcher**: Built-in toggle to simulate AI token exhaustion/failure on demand to demonstrate the fallback mechanism to professors and evaluators without burning actual API credits.
- **🔄 Session Persistence**: Chat history and active messages persist across page reloads via `localStorage`.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18
- **Bundler**: Vite 5
- **Icons**: Lucide React
- **Styling**: Modern CSS3 (Custom Design System with Glassmorphism, CSS Variables, and Flex/Grid layouts)
- **API Communication**: Native Fetch API with Vite reverse proxying

### Backend
- **Framework**: FastAPI (Asynchronous Python Web Framework)
- **ASGI Server**: Uvicorn
- **Validation**: Pydantic v2
- **HTTP Client**: HTTPX (Asynchronous external AI API requests)
- **Environment Management**: Python-Dotenv

---

## 📐 Project Architecture

```text
User Question
      ↓
FastAPI Router (/api/chat)
      ↓
Chat Service (Orchestrator)
      ↓
Try AI API (ai_service.py)
   ↙                          ↘
Success                       Failure (Rate limit / Token limit / Timeout / Offline)
  ↓                                      ↓
AI Answer                    Dataset Search (dataset_service.py)
(source: "ai")                           ↓
                             Normalized Text & Keyword Matching
                                  ↙                  ↘
                             Match Found        No Match Found
                                  ↓                   ↓
                             Knowledge Base     Friendly Administrative
                             Answer ("dataset")  Notice ("dataset")
```

---

## 📂 Folder Structure

```text
AiPoweredChatbot/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Responsive header, brand logo & demo switcher
│   │   │   ├── ChatWindow.jsx          # Message stream, thinking state, & empty hero
│   │   │   ├── ChatMessage.jsx         # User & bot bubbles with source badges & copy
│   │   │   ├── SearchBar.jsx           # Auto-resizing input, shortcuts & send button
│   │   │   ├── SuggestedQuestions.jsx  # Interactive inquiry chips by category
│   │   │   └── Sidebar.jsx             # Chat history, new chat, & presentation controls
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx                # Landing page, architecture pipeline & FAQ explorer
│   │   │   └── Chat.jsx                # Dedicated interactive chatbot interface
│   │   │
│   │   ├── services/
│   │   │   └── api.js                  # Frontend API client and error handling
│   │   │
│   │   ├── App.jsx                     # Route management & demo mode toast provider
│   │   ├── main.jsx                    # React DOM entry point
│   │   └── index.css                   # Global theme, variables, and glassmorphism styles
│   │
│   ├── package.json
│   ├── vite.config.js                  # Vite configuration with proxy to port 8000
│   └── index.html
│
├── backend/
│   ├── main.py                         # FastAPI app entry point with CORS & Lifespan
│   │
│   ├── routes/
│   │   ├── chat.py                     # POST /api/chat, demo mode toggles
│   │   └── faq.py                      # GET /api/faqs, GET /api/categories
│   │
│   ├── services/
│   │   ├── ai_service.py               # Modular external AI API client & mock generator
│   │   ├── dataset_service.py          # FAQ loader, text tokenization & matching algorithm
│   │   └── chat_service.py             # Dual-engine orchestration & fallback logic
│   │
│   ├── models/
│   │   └── schemas.py                  # Pydantic validation schemas
│   │
│   ├── data/
│   │   └── student_faq.json            # 52 verified student FAQs across 20 categories
│   │
│   ├── requirements.txt                # Python backend dependencies
│   ├── .env.example                    # Environment template
│   └── .env                            # Backend configuration
│
├── README.md                           # Documentation
└── .gitignore
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: v18 or higher with `npm`

---

### 1. Backend Setup

Open a terminal and navigate to the `backend` folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:
- **Windows (Command Prompt / PowerShell)**:
  ```bash
  venv\Scripts\activate
  ```
- **macOS / Linux**:
  ```bash
  source venv/bin/activate
  ```

Install dependencies:

```bash
pip install -r requirements.txt
```

Set up environment variables:

```bash
copy .env.example .env
```
*(On macOS/Linux: `cp .env.example .env`)*

---

### 2. Frontend Setup

In a new terminal window, navigate to the `frontend` folder:

```bash
cd frontend
```

Install NPM packages:

```bash
npm install
```

---

## 🔐 Environment Variables

Located in `backend/.env`:

```env
# Optional: External OpenAI-compatible Chat Completion API
AI_API_KEY=your_api_key_here
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini

# Demonstration settings
# When USE_MOCK_AI=true, generates intelligent simulated AI responses without requiring a paid key
USE_MOCK_AI=true

# When SIMULATE_AI_FAILURE=true, simulates an AI rate limit or outage to trigger the fallback
SIMULATE_AI_FAILURE=false

# Server Port
PORT=8000
```

> **Security Note**: Never commit your real `.env` file containing sensitive API keys to Git. The project includes a `.gitignore` configured to keep `.env` out of version control.

---

## 🚀 How to Run the Application

### 1. Start the Backend Server
From inside the `backend` directory (with your virtual environment active):

```bash
uvicorn main:app --reload
```
The FastAPI server will start on: **`http://localhost:8000`**
- Interactive Swagger API Documentation: `http://localhost:8000/docs`
- Redoc API Documentation: `http://localhost:8000/redoc`

### 2. Start the Frontend Client
From inside the `frontend` directory:

```bash
npm run dev
```
The Vite development server will start on: **`http://localhost:5173`**

Open `http://localhost:5173` in your browser to explore the landing page and chat application!

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Receives student question; returns answer with source attribution (`ai` or `dataset`). |
| `GET` | `/api/health` | Returns backend health, loaded FAQ count, and active engine status. |
| `GET` | `/api/faqs` | Returns list of all FAQ records (optional `?category=` filter). |
| `GET` | `/api/categories` | Returns all 20 unique campus knowledge base categories. |
| `GET` | `/api/demo/mode` | Returns current demo mode (`AI Mode` vs `Simulated Fallback Mode`). |
| `POST` | `/api/demo/toggle` | Toggles AI failure simulation on/off for viva demonstrations. |

### Sample Chat Request & Responses

#### Chat Request:
```json
POST /api/chat
{
  "question": "What is the minimum attendance requirement?"
}
```

#### AI Response (When AI API is operational):
```json
{
  "success": true,
  "answer": "Under university regulations, students must maintain a mandatory minimum attendance of 75% in every subject...",
  "source": "ai",
  "category": "Attendance",
  "confidence": 1.0,
  "suggested_questions": [
    "What is the process to apply for medical leave or attendance exemption?",
    "What happens if my attendance falls below the detention limit?"
  ]
}
```

#### Dataset Fallback Response (When AI API is offline or rate-limited):
```json
{
  "success": true,
  "answer": "Students must maintain a minimum of 75% aggregate attendance in each registered theory and practical course to be eligible to sit for the semester end examinations...",
  "source": "dataset",
  "category": "Attendance",
  "confidence": 1.0,
  "suggested_questions": [
    "What is the process to apply for medical leave or attendance exemption?"
  ]
}
```

---

## 🎯 Dataset Fallback Mechanism & Viva Demo

The project is built specifically to make college and project presentation demonstrations effortless.

### How to Demonstrate During a Viva Presentation:
1. **Show AI Mode**:
   - In the top navbar or sidebar, confirm that **Demo: AI Active** is selected.
   - Ask a question such as: *"When are semester end exams?"*
   - Point out the `✦ AI Generated` badge and the conversational response.
2. **Show Fallback Mode (Simulating Rate Limit / API Outage)**:
   - Click the **Demo Switcher** button in the navbar or sidebar.
   - Notice the system badge switches to **◈ Fallback Active**.
   - Ask: *"What happens if my attendance is below the required percentage?"*
   - Highlight the backend console log:
     ```text
     [AI Service] Simulated AI Failure is ACTIVE (Demo / Token Limit simulation).
     [ChatService] AI API unavailable or failed. Automatically activating Predefined Dataset Fallback System.
     [ChatService] Found knowledge base match (ID 15, Score 1.0) for category: Attendance
     ```
   - Point out that the frontend displays `◈ University Knowledge Base` with the **Attendance** tag and zero technical error dialogs.

---

## 📚 Knowledge Base Categories

The local dataset (`backend/data/student_faq.json`) contains 52 comprehensive entries covering:

1. **Admission** (Required documents, lateral entry eligibility, application fees)
2. **Registration** (Course registration portal, add/drop deadlines)
3. **Fees** (Payment modes, installment plans, late penalties)
4. **Examination** (Exam dates, hall ticket downloads, malpractice regulations)
5. **Results** (SGPA/CGPA formulas, revaluation procedures, backlog exams)
6. **Attendance** (75% requirement, medical leave exemption, detention limits)
7. **Timetable** (Schedule portals, lab batch & section changes)
8. **Courses** (Core vs elective vs audit course credits, syllabus downloads)
9. **Assignments** (LMS portal submissions, Turnitin plagiarism policy)
10. **Library** (Borrowing limits, operating hours, digital library/EZproxy access)
11. **Hostel** (Room allocation, curfew hours, out-pass procedures, amenities)
12. **Scholarships** (Merit waivers, application windows, financial aid)
13. **Placements** (Eligibility criteria, resume reviews, placement training)
14. **Internships** (Mandatory academic credits, NOC application process)
15. **Student ID** (Replacement procedures, RFID smart card integration)
16. **Campus Facilities** (24/7 health center, campus Wi-Fi setup, sports complex)
17. **Clubs** (40+ technical/cultural societies, founding new clubs)
18. **Events** (Annual hackathons, cultural festivals, techfests)
19. **Academic Calendar** (Semester timelines, vacation periods, holidays)
20. **General University Information** (Dean/Registrar contacts, lost and found, shuttle transit)

---

## 🔒 Security & Error Handling

- **Zero Client-Side Secrets**: All API keys reside strictly on the server in environment variables.
- **Strict Input Validation**: Pydantic schemas validate all incoming payloads and query parameters.
- **Graceful Failures**: Network failures, timeouts, or invalid keys are trapped and logged server-side, returning friendly responses to students without revealing internal stack traces.
- **CORS Configured**: Cross-Origin Resource Sharing is enabled for standard development and production hosts.

---

## 🔮 Future Improvements

1. **Vector Embeddings (ChromaDB / FAISS)**: Enhance the local dataset matcher with local vector embeddings (e.g. `all-MiniLM-L6-v2`) for semantic search.
2. **Multi-Language Support**: Provide instant multilingual translation for international exchange students.
3. **Voice Input / Speech-to-Text**: Integrate browser Web Speech API for audible student inquiries.
4. **Student Portal ERP Single Sign-On (SSO)**: Allow students to log in and query their personal attendance percentages and timetable directly.

---

## 📄 License
This project is developed for educational and academic demonstration purposes. Free to adapt and expand for university capstone presentations.
