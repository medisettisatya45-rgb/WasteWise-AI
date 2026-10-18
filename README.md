# WasteWise AI

> **"Identify. Recycle. Sustain."**

WasteWise AI is a full-stack, AI-powered waste management and recycling assistant. The application helps users identify waste from images, classify the waste type, determine whether it is recyclable, provide correct disposal instructions, find nearby recycling centers on an interactive OpenStreetMap, track waste-management activity, and provide personalized eco-friendly recommendations.

---

## 🌟 Key Features

1. **AI Waste Image Scanning**: Upload or capture waste items via camera; instantaneous visual feature extraction and neural classification.
2. **Waste Classification**: Categorizes across 8 material streams (*Plastic, Paper & Cardboard, Glass, Metal, Organic/Compost, E-Waste, Hazardous, Landfill/Residual*).
3. **Disposal Instructions**: Step-by-step preparation checklist (*rinse, remove labels, crush, target bin selection*).
4. **Interactive Recycling Centers Map**: Free Leaflet map powered by OpenStreetMap tiles with geolocation, material filtering, distance calculations (Haversine formula), and one-click navigation routes.
5. **Secure Authentication & Password Validation**: Enforces strict UTF-8 byte boundary limits (8 to 72 bytes) for bcrypt security, preventing silent truncation. Role-based authorization (`USER` vs `ADMIN`).
6. **Gamified Sustainability Score**: Tracks consecutive day streaks, diverted carbon emissions (kg CO2e), reclaimed packaging weight (kg), tier levels (*Seedling, Eco Explorer, Green Guardian, Earth Champion*), and unlockable badges.
7. **Personal Analytics Dashboard**: Interactive Recharts visualizations of waste stream composition (donut chart), 7-day diversion activity, and monthly carbon offset trends.
8. **Personalized Eco Recommendations**: Dynamic tips tailored to user's highest scanned waste categories.
9. **Scan History**: Full history of user scans with search, filtering, detail inspection, user feedback loop, and deletion.
10. **Admin Control Center**: System-wide statistics, user role promotion/demotion, account activation/deactivation, AI confidence threshold slider, model recalibration triggers, and depot management.
11. **Notifications**: In-app achievement badges, streak alerts, and system announcements.
12. **Automated Testing Suite**: Comprehensive test suite covering authentication, bcrypt byte boundary conditions, scanning, geo-distance, stats, and role guards.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Leaflet, React Leaflet, Lucide Icons.
- **Backend**: Python 3.11, FastAPI, SQLAlchemy ORM, Pydantic v2, PyJWT, Bcrypt, Pillow, NumPy, PyTorch-ready modular architecture.
- **Database**: SQLite (local development) / PostgreSQL compatible architecture.
- **Maps**: Leaflet + OpenStreetMap tiles (100% free, no paid APIs).

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd backend

# (Optional) Activate your Python virtual environment
# python -m venv .venv
# .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python run.py
```
Backend will start on `http://127.0.0.1:8000`.
- API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
- Healthcheck: `http://127.0.0.1:8000/health`

### 2. Frontend Setup
```bash
cd frontend

# Install npm dependencies
npm install

# Start the Vite development server
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 🔑 Default Credentials

The database is pre-seeded with two accounts:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@wastewise.ai` | `AdminPassword123!` |
| **Standard User** | `user@wastewise.ai` | `UserPassword123!` |

*(One-click fill buttons are also available on the Login screen).*

---

## 🧪 Running Automated Tests

### Backend Tests (pytest)
```bash
cd backend
python -m pytest -v
```
*(All 24 automated tests including valid password, invalid password, short password, maximum supported 72-byte password, oversized password, Unicode password, scan classification, and admin roles will run).*

### Frontend Typecheck & Build
```bash
cd frontend
npm run build
```

---

## 📂 Project Structure

```
wastewise-ai/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST route handlers (auth, scan, history, centers, stats, admin)
│   │   ├── core/            # Security (bcrypt <= 72 bytes, JWT), dependencies, DB seeding
│   │   ├── models/          # SQLAlchemy ORM models (User, WasteScan, RecyclingCenter, Notification)
│   │   ├── schemas/         # Pydantic v2 schemas and request validators
│   │   ├── services/        # AI classifier, sustainability calculator, Haversine geo distance
│   │   ├── config.py        # Centralized settings & environment variables
│   │   ├── database.py      # Engine and SessionLocal
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # pytest test suite
│   ├── training/            # PyTorch model architecture, augmentations, and training script
│   ├── uploads/             # Persistent storage for scanned waste images
│   ├── .env.example         # Environment template
│   ├── requirements.txt     # Python backend dependencies
│   └── run.py               # Uvicorn server launcher
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, WasteScanner, ScanResultCard, RecyclingMap, Charts
│   │   ├── context/         # AuthContext and NotificationContext
│   │   ├── pages/           # Home, Login, Register, ScanPage, Dashboard, History, Centers, Admin
│   │   ├── services/        # Axios API clients
│   │   └── types/           # TypeScript interfaces
│   ├── index.html           # Root HTML
│   ├── package.json         # Node dependencies & scripts
│   ├── tailwind.config.js   # Tailwind design tokens
│   └── vite.config.ts       # Vite proxy & build config
└── docs/
    ├── ARCHITECTURE.md      # System & security architecture
    ├── API_DOCUMENTATION.md # REST endpoints reference
    ├── AI_MODEL_GUIDE.md    # Modular AI & computer vision documentation
    └── USER_GUIDE.md        # User and admin walkthrough
```
