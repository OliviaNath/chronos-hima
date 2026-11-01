from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class AlertLevel(str, Enum):
    SAFE = "SAFE"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"

class AdvisoryStatus(str, Enum):
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class Language(str, Enum):
    GARHWALI = "GARHWALI"
    HINDI = "HINDI"
    NEPALI = "NEPALI"
    ENGLISH = "ENGLISH"

class IngestRequest(BaseModel):
    latitude: float = Field(..., ge=26.0, le=36.0, description="Himalayan regional latitude")
    longitude: float = Field(..., ge=74.0, le=90.0, description="Himalayan regional longitude")

class MeteorologicalMetric(BaseModel):
    latitude: float
    longitude: float
    precipitation_rate_mm_hr: float
    soil_moisture_index: float
    temperature_celsius: float
    timestamp_iso: str

class InfrastructureNode(BaseModel):
    node_id: str
    node_type: str
    name: Optional[str] = None
    elevation_meters: int
    is_passable: bool

class RiskAssessment(BaseModel):
    risk_score: int
    alert_level: AlertLevel
    primary_factor: str
    timestamp_iso: str

class EvacuationRoute(BaseModel):
    origin_lat: float
    origin_lon: float
    target_node_id: str
    target_elevation: int
    impassable_bridges_count: int
    waypoints: List[List[float]]

class EmergencyAdvisory(BaseModel):
    advisory_id: str
    target_language: Language
    evacuation_vector_summary: str
    status: AdvisoryStatus
    created_at: str

class ApprovalRequest(BaseModel):
    advisory_id: str
    status: AdvisoryStatus
    notes: Optional[str] = None

class CopilotQueryRequest(BaseModel):
    query: str
    latitude: Optional[float] = 30.4045
    longitude: Optional[float] = 79.3240
