# Chronos-Hima: Cryosphere Disaster & Climate Adaptation Engine

Chronos-Hima is a full-stack, real-time crisis mitigation and climate adaptation platform for vulnerable Himalayan river basins in North India. It connects live geospatial/meteorological APIs with an agentic execution state machine to deliver real-time flood vectoring during crises and 365-day lifestyle adaptation guidance during non-emergency periods.

## System Architecture
- **Frontend:** Next.js (App Router), Tailwind CSS, Leaflet.js
- **Backend:** FastAPI (Python), Pydantic, HTTPX
- **Data Layers (Zero Dummy Data):** Open-Meteo REST API, Overpass OpenStreetMap API, GDELT Project API

## System Architecture Flowchart

```text
[User Browser / Vercel Frontend (Next.js)]
              │
              │  HTTPS / REST Calls (NEXT_PUBLIC_API_URL)
              ▼
[Render Backend (FastAPI Python Engine)]
              │
              ├─► Ingests Telemetry ──► [Open-Meteo API (Live Weather)]
              ├─► Fetches Topography ──► [Overpass OSM API (Nodes/Bridges)]
              └─► Evaluates Risk    ──► [Agentic State Machine & Advisories]

Quick Start (Local Setup)

Backend Setup

cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000

Frontend Setup

cd frontend
npm install
cp .env.example .env.local
npm run dev
Open http://localhost:3000 in your browser.

Running Tests

cd backend
pytest