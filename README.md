# CP Profiles - Competitive Programming Analytics & Hub

A comprehensive full-stack competitive programming aggregation and analytics platform. **CP Profiles** aggregates profiles, ratings, problem-solving history, heatmaps, AI-driven strength/weakness analysis, and AI problem recommendations across major competitive programming platforms like **LeetCode**, **Codeforces**, **CodeChef**, **AtCoder**, and **GitHub**.

---

## System Architecture & Workflow Diagram

```mermaid
graph TD
    %% User Layer
    subgraph Client ["Client Layer (Next.js Frontend)"]
        UI["ToonAuthApp (Main Dashboard / Navigation)"]
        
        subgraph Components ["UI Components"]
            AuthModals["Authentication & Profile Setup"]
            DashboardView["VipDashboard / User Analytics"]
            Leaderboard["Leaderboard & Global Ranks"]
            ProblemSearch["AI Problem Finder / Graph Search"]
            AudioSynth["Retro Sound Engine (audioSynth)"]
        end

        UI --> AuthModals
        UI --> DashboardView
        UI --> Leaderboard
        UI --> ProblemSearch
        UI --> AudioSynth
    end

    %% Network & API Gateway Layer
    Client -->|REST API Requests & JWT Auth| API_Gateway["FastAPI App Server (backend/main.py)"]

    %% Backend Services Layer
    subgraph Backend ["Backend Processing & Analytics Layer"]
        UserRouter["User Routes & Authentication (userroutes.py)"]
        
        subgraph Services ["Core Services"]
            AnalysisService["AI Analysis Service (analysisservice.py)"]
            LangChainService["LangChain & Knowledge Graph Service (langchainservice.py)"]
            ProblemService["Codeforces Scheduler & Sync (problemservice.py)"]
            LeetCodeService["LeetCode Scheduler & Sync (leetcodeservice.py)"]
        end

        subgraph SecurityCache ["Security & In-Memory Caching"]
            JWTAuth["Password Hashing & JWT Verification (security.py)"]
            TTLCache["Dashboard & Analysis TTL Caching (cache.py)"]
        end

        UserRouter --> JWTAuth
        UserRouter --> TTLCache
        UserRouter --> AnalysisService
        UserRouter --> LangChainService
    end

    API_Gateway --> UserRouter

    %% Data Storage Layer
    subgraph Storage ["Data Storage Layer"]
        PostgresDB[("PostgreSQL Database (localhost:5432/postgres)")]
        subgraph Tables ["Database Models"]
            UserModel["Users Table"]
            ProfileModel["Profiles Table (Handles: CF, LC, CC, AC, GH)"]
            ProblemModel["Problems Table (Codeforces & LeetCode)"]
        end
        PostgresDB --- UserModel
        PostgresDB --- ProfileModel
        PostgresDB --- ProblemModel
    end

    %% External APIs & Integrations Layer
    subgraph External ["External APIs & Data Sources"]
        CF_API["Codeforces Official API (codeforces.com/api)"]
        LC_API["LeetCode GraphQL / Public API"]
        CC_API["CodeChef Scraper / API"]
        AC_API["AtCoder API / Scraper"]
        GH_API["GitHub REST API"]
    end

    %% Service Connections
    AnalysisService -->|Fetches History| External
    ProblemService -->|Syncs Contests & Problems| CF_API
    LeetCodeService -->|Syncs Problems| LC_API
    
    UserRouter --> PostgresDB
    ProblemService --> PostgresDB
    LeetCodeService --> PostgresDB
    LangChainService --> PostgresDB
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js (App Router, React)
- **Styling**: Tailwind CSS / Vanilla CSS with custom animations & Cyberpunk/Neumorphic UI elements
- **Audio & Interactivity**: Custom Web Audio API Synthesizer (`audioSynth.js`)

### Backend
- **Framework**: Python FastAPI
- **Database & ORM**: PostgreSQL & SQLAlchemy
- **Schedulers & Async**: APScheduler & Python Asyncio
- **AI & Analytics**: LangChain, Custom Vector/Graph indexing algorithms for problem recommendations
- **Authentication**: OAuth2 / Passlib (Bcrypt) & PyJWT

---

## Getting Started

### Prerequisites
- Node.js (v18+) & `npm`
- Python (v3.10+)

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv env
# On Windows:
env\Scripts\activate
# On Linux/macOS:
source env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```

The backend server will start at `http://localhost:8000`.

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install npm packages
npm install

# Run the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

---

## Key Features

1. **Multi-Platform Profile Aggregation**: Connect and track performance across Codeforces, LeetCode, CodeChef, AtCoder, and GitHub.
2. **AI-Powered Analytics**: Receive personalized insights into strengths, weaknesses, and recommended problem tags.
3. **Problem Knowledge Graph**: Dynamic problem discovery and search built with LangChain and vector graph representations.
4. **Automated Background Schedulers**: Auto-synchronize problem sets and rating metrics periodically.
5. **Interactive UI & Gamified Soundscape**: Modern cyberpunk design paired with custom Web Audio feedback for an immersive user experience.

