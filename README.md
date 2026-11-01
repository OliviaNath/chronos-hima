# Chronos-Hima: Cryosphere Disaster & Climate Adaptation Engine

Chronos-Hima is a full-stack, real-time crisis mitigation and climate adaptation platform for vulnerable Himalayan river basins in North India. It connects live geospatial/meteorological APIs with an agentic execution state machine to deliver real-time flood vectoring during crises and 365-day lifestyle adaptation guidance during non-emergency periods.

## System Architecture
- **Frontend:** Next.js (App Router), Tailwind CSS, Leaflet.js
- **Backend:** FastAPI (Python), Pydantic, HTTPX
- **Data Layers (Zero Dummy Data):** Open-Meteo REST API, Overpass OpenStreetMap API, GDELT Project API

## Quick Start (Local Setup)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running Tests
```bash
cd backend
pytest
```
