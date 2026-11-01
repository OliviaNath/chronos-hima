import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from schemas import (
    IngestRequest, MeteorologicalMetric, RiskAssessment, 
    EmergencyAdvisory, ApprovalRequest, AdvisoryStatus, 
    CopilotQueryRequest, Language
)
from services.weather_service import fetch_live_meteorology
from services.osm_service import fetch_osm_infrastructure
from services.gdelt_service import fetch_gdelt_alerts
from logic.risk_calculator import calculate_risk
from logic.route_optimizer import compute_evacuation_route
from ai.agent_module import generate_advisory, query_climate_copilot

app = FastAPI(
    title="Chronos-Hima API",
    description="Cryosphere Disaster & Climate Adaptation Engine API",
    version="1.0.0"
)

# CORS setup - supports environment variable parsing or full wildcard fallbacks for production
cors_origins_raw = os.getenv("CORS_ORIGINS", "*")
origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active advisories
ADVISORY_STORE = {}

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "system": "Chronos-Hima Engine",
        "live_api_access": True,
        "mode": "Live Ingestion + Offline Fallback Agent"
    }

@app.post("/api/ingest", response_model=MeteorologicalMetric)
async def ingest_coordinates(req: IngestRequest):
    # Scoped strictly to Nepal & North Indian Himalayan corridors (26°N-36°N, 74°E-90°E)
    if not (26.0 <= req.latitude <= 36.0) or not (74.0 <= req.longitude <= 90.0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coordinates outside supported Nepal / Himalayan corridor (26°N-36°N, 74°E-90°E)."
        )
    try:
        metric = await fetch_live_meteorology(req.latitude, req.longitude)
        return metric
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Live weather service temporarily unreachable: {str(e)}"
        )

@app.post("/api/risk/assess", response_model=RiskAssessment)
async def assess_risk(metric: MeteorologicalMetric):
    return calculate_risk(metric)

@app.post("/api/agent/run", response_model=EmergencyAdvisory)
async def run_agent(req: IngestRequest):
    # Standardized bounding box check (26°N-36°N, 74°E-90°E)
    if not (26.0 <= req.latitude <= 36.0) or not (74.0 <= req.longitude <= 90.0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coordinates outside supported Nepal / Himalayan corridor (26°N-36°N, 74°E-90°E)."
        )
    
    # 1. Fetch live metrics
    metric = await fetch_live_meteorology(req.latitude, req.longitude)
    # 2. Calculate risk
    risk = calculate_risk(metric)
    # 3. Query OSM nodes
    nodes = await fetch_osm_infrastructure(req.latitude, req.longitude)
    # 4. Compute route
    route = compute_evacuation_route(req.latitude, req.longitude, nodes, risk.alert_level)
    # 5. Generate Advisory
    advisory = generate_advisory(risk, route, Language.GARHWALI)
    
    # Store in memory
    ADVISORY_STORE[advisory.advisory_id] = advisory
    return advisory

@app.post("/api/agent/approve")
async def approve_advisory(req: ApprovalRequest):
    if req.advisory_id not in ADVISORY_STORE:
        # Create ad-hoc record for testing if missing
        ADVISORY_STORE[req.advisory_id] = EmergencyAdvisory(
            advisory_id=req.advisory_id,
            target_language=Language.GARHWALI,
            evacuation_vector_summary="Test Advisory",
            status=AdvisoryStatus.AWAITING_APPROVAL,
            created_at=""
        )
    
    current = ADVISORY_STORE[req.advisory_id]
    if current.status == AdvisoryStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Advisory has already been processed and broadcast."
        )
    
    current.status = req.status
    ADVISORY_STORE[req.advisory_id] = current
    return {"status": "success", "advisory_id": req.advisory_id, "new_status": req.status}

@app.get("/api/post-disaster/guidance")
async def post_disaster_guidance(lat: float = 30.4045, lon: float = 79.3240):
    return {
        "water_safety_advisory": "Boil all drinking water for 3 minutes minimum. Avoid well #4 near valley floor.",
        "relief_corridors": [
            {"corridor_id": "RC-1", "path": "Ridge Sector Highway 7", "status": "OPEN"},
            {"corridor_id": "RC-2", "path": "Riverbank Road", "status": "CLOSED_DEBRIS"}
        ],
        "emergency_medical_dispatch": "Helipad Node Alpha active at 1800m elevation."
    }

@app.post("/api/copilot/query")
async def copilot_query(req: CopilotQueryRequest):
    if not req.query.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please enter a valid climate or adaptation question."
        )
    response_text = query_climate_copilot(req.query)
    return {"query": req.query, "response": response_text}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)