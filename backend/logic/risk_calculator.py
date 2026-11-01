from datetime import datetime, timezone
from schemas import MeteorologicalMetric, RiskAssessment, AlertLevel

def calculate_risk(metric: MeteorologicalMetric) -> RiskAssessment:
    raw_score = (metric.precipitation_rate_mm_hr * 1.5) + (metric.soil_moisture_index * 40.0)
    score = min(100, round(raw_score))
    
    if score < 35:
        level = AlertLevel.SAFE
        factor = "Normal seasonal hydrological parameters."
    elif score < 70:
        level = AlertLevel.WARNING
        factor = "Elevated rainfall rate and rising soil moisture saturation."
    else:
        level = AlertLevel.CRITICAL
        factor = "High precipitation anomaly paired with heavy soil moisture saturation (GLOF/Flash Flood Risk)."

    return RiskAssessment(
        risk_score=score,
        alert_level=level,
        primary_factor=factor,
        timestamp_iso=datetime.now(timezone.utc).isoformat()
    )
