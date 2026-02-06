# AI Career Accelerator Platform

Full-stack web application that helps users identify in-demand skills, assess interview readiness with quizzes, and generate ATS-friendly resumes powered by AI.

## Tech Stack

- **Frontend**: React, Vite, React Router, Tailwind CSS, Recharts
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **AI Integration**: OpenAI API (with safe mock fallback if key is missing)

## Features

- **Authentication**
  - Sign up and login with email/password
  - Password hashing (bcrypt)
  - JWT-based auth, protected API routes
- **Dashboard**
  - Trending & demanding skills by role
  - Salary ranges per skill (entry/mid/senior)
  - Demand ranges (beginner/intermediate/advanced)
  - Recent quiz attempts and readiness snapshot
  - Interactive charts with Recharts
- **Interview Quiz Module**
  - Multiple-choice questions categorized by role, skill, difficulty
  - Timer-based quiz and auto score calculation
  - Result view with score, accuracy, strengths/weak areas, and level (Beginner/Intermediate/Advanced)
  - Quiz history stored per user
- **AI Resume Generator**
  - Form for personal details, skills, projects, experience, education
  - AI-generated, ATS-friendly resume text
  - Editable preview and **Download as PDF** via jsPDF
  - Multiple template styles passed to the AI prompt

## Project Structure

```text
Prep_X/
  package.json           # Root scripts (dev, install:all)
  backend/
    package.json
    .env.example
    src/
      server.js
      config/db.js
      models/
        User.js
        Skill.js
        Question.js
        QuizAttempt.js
      middleware/
        auth.js
      controllers/
        authController.js
        dashboardController.js
        quizController.js
        resumeController.js
      routes/
        authRoutes.js
        dashboardRoutes.js
        quizRoutes.js
        resumeRoutes.js
      seed.js
  frontend/
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js
    .env.example
    index.html
    src/
      main.jsx
      App.jsx
      index.css
      lib/api.js
      state/AuthContext.jsx
      components/
        Layout.jsx
        ProtectedRoute.jsx
      pages/
        LoginPage.jsx
        SignupPage.jsx
        DashboardPage.jsx
        QuizPage.jsx
        QuizHistoryPage.jsx
        ResumePage.jsx
        NotFoundPage.jsx
```

## Environment Variables

### Backend (`backend/.env`)

Copy `.env.example` to `.env` inside `backend` and fill values:

```bash
MONGODB_URI=mongodb://localhost:27017/ai_career_accelerator
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_api_key_here   # optional; if omitted, backend uses a mock resume generator
PORT=5000
```

> **Note**: Never commit real secrets (API keys, JWT secrets) to git. Use local `.env` files or a secret manager in production.

### Frontend (`frontend/.env`)

Copy `.env.example` to `.env` inside `frontend`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

Adjust if your backend runs on a different host/port.

## Installation

From the project root (`Prep_X`):

```bash
# Install root helper deps
npm install

# Install backend and frontend dependencies
npm run install:all
```

Alternatively, install separately:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Database Seeding

Make sure MongoDB is running locally, then from `backend`:

```bash
cd backend
cp .env.example .env   # then edit values if needed
npm run seed
```

This seeds:

- Example skills and salary/demand ranges
- Sample interview questions for React, Node.js, Data Science, and Cybersecurity

## Running the App in Development

From the project root:

```bash
# Start backend and frontend together
npm run dev
```

This will:

- Start the backend API on `http://localhost:5000`
- Start the React dev server on `http://localhost:5173`

You can also run them separately:

```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

## API Overview

Base URL: `http://localhost:5000/api`

- **Auth**
  - `POST /auth/signup` – create user, returns `{ token, user }`
  - `POST /auth/login` – login, returns `{ token, user }`
- **Dashboard** (requires `Authorization: Bearer <token>`)
  - `GET /dashboard/overview?role=frontend|backend|data|cybersecurity|all`
- **Quiz** (requires auth)
  - `GET /quiz/questions?role=&difficulty=&skill=&limit=10`
  - `POST /quiz/submit` – body: `{ skill, role, difficulty, answers: [{ questionId, selectedIndex }] }`
  - `GET /quiz/history`
- **Resume** (requires auth)
  - `POST /resume/generate` – body: `{ personal, skills, projects, experience, education, template }`

## Frontend Notes

- **Routing**: Implemented with React Router (`App.jsx`), including:
  - Public routes: `/login`, `/signup`
  - Protected routes under `Layout`:
    - `/dashboard`
    - `/quiz`
    - `/quiz/history`
    - `/resume`
- **Auth State**:
  - `AuthContext` stores `{ user, token }` in localStorage and attaches JWT to API calls.
  - `ProtectedRoute` guards private routes and redirects unauthenticated users to `/login`.
- **UI/UX**:
  - Modern dark theme with Tailwind, responsive layout, side navigation on desktop, top bar on mobile.
  - Clear loading and error states for dashboard, quiz, history, and resume actions.

## Production Considerations

- Use HTTPS and secure cookies/JWT handling in production.
- Configure proper CORS origins instead of `origin: true`.
- Store secrets in environment variables or a secret manager (not in the codebase).
- Add logging, monitoring, and rate limiting (e.g., for auth and AI endpoints).
- Configure a production-ready build pipeline (e.g., build frontend and serve static assets via a CDN or reverse proxy in front of Node). 

