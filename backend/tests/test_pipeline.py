from fastapi.testclient import TestClient
from main import app
from schemas import AlertLevel

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_bounding_box_validation():
    response = client.post("/api/ingest", json={"latitude": 10.0, "longitude": 70.0})
    assert response.status_code == 400

def test_risk_assessment_math():
    payload = {
        "latitude": 30.4045,
        "longitude": 79.3240,
        "precipitation_rate_mm_hr": 40.0,
        "soil_moisture_index": 0.80,
        "temperature_celsius": 12.5,
        "timestamp_iso": "2026-10-31T00:00:00Z"
    }
    response = client.post("/api/risk/assess", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] == 92
    assert data["alert_level"] == "CRITICAL"

def test_approval_gate():
    approve_req = {"advisory_id": "test-uuid-123", "status": "APPROVED"}
    res1 = client.post("/api/agent/approve", json=approve_req)
    assert res1.status_code == 200
    
    res2 = client.post("/api/agent/approve", json=approve_req)
    assert res2.status_code == 409

def test_copilot_empty_query():
    res = client.post("/api/copilot/query", json={"query": "   "})
    assert res.status_code == 422
