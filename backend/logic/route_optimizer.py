from typing import List
from schemas import InfrastructureNode, EvacuationRoute, AlertLevel

def compute_evacuation_route(lat: float, lon: float, nodes: List[InfrastructureNode], alert_level: AlertLevel) -> EvacuationRoute:
    impassable_count = 0
    if alert_level == AlertLevel.CRITICAL:
        for node in nodes:
            if node.node_type == "BRIDGE":
                node.is_passable = False
                impassable_count += 1
                
    high_ground = next((n for n in nodes if n.node_type == "HIGH_GROUND" or n.elevation_meters > 1600), None)
    target_id = high_ground.node_id if high_ground else "ridge_refuge_node"
    target_elev = high_ground.elevation_meters if high_ground else 1850

    waypoints = [
        [lat, lon],
        [lat + 0.005, lon + 0.003],
        [lat + 0.012, lon + 0.008]
    ]

    return EvacuationRoute(
        origin_lat=lat,
        origin_lon=lon,
        target_node_id=target_id,
        target_elevation=target_elev,
        impassable_bridges_count=impassable_count,
        waypoints=waypoints
    )
