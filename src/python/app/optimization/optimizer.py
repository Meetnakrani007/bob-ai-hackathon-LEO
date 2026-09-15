"""
SupplyGuard AI — Port & Fleet Optimization Engine
Evaluates alternative ports, calculates Haversine proximity, and matches fleet assets.
"""

import math
from typing import Dict, Any, List, Optional


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculates great-circle distance between two GPS points in kilometers."""
    r = 6371.0  # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)

    a = (
        math.sin(delta_phi / 2.0) ** 2 +
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 1)


def evaluate_alternative_ports(
    disrupted_port_id: str,
    ports_catalog: List[Dict[str, Any]],
    cargo_type: str = "general",
    requires_refrigeration: bool = False,
) -> List[Dict[str, Any]]:
    """
    Ranks alternative destination ports by capacity, congestion delta, and infrastructure fit.
    """
    disrupted_port = next((p for p in ports_catalog if p.get("port_id") == disrupted_port_id), None)
    if not disrupted_port:
        d_lat, d_lng = 18.9438, 72.855  # Default to Mumbai coords
    else:
        loc = disrupted_port.get("location", {})
        d_lat, d_lng = loc.get("lat", 18.9438), loc.get("lng", 72.855)

    candidates: List[Dict[str, Any]] = []

    for port in ports_catalog:
        p_id = port.get("port_id")
        if p_id == disrupted_port_id or port.get("status") == "disrupted":
            continue

        loc = port.get("location", {})
        p_lat = loc.get("lat", 0.0)
        p_lng = loc.get("lng", 0.0)
        dist = haversine_distance(d_lat, d_lng, p_lat, p_lng)

        congestion = float(port.get("current_congestion_pct", 50.0))
        has_cold = bool(port.get("cold_storage_available", False))

        # Viability scoring
        # Proximity score (closer is better, normalized up to 1500km)
        prox_score = max(0.0, 100.0 - (dist / 15.0))
        # Congestion score (lower congestion is better)
        cong_score = max(0.0, 100.0 - congestion)
        # Facilities score
        fac_score = 100.0 if (not requires_refrigeration or has_cold) else 20.0

        composite_suitability = round(
            0.40 * prox_score + 0.35 * cong_score + 0.25 * fac_score,
            1
        )

        candidates.append({
            "port_id": p_id,
            "name": port.get("name"),
            "country": port.get("country"),
            "distance_km_from_disrupted": dist,
            "current_congestion_pct": congestion,
            "status": port.get("status", "normal"),
            "berths_available": port.get("berths_total", 10) - port.get("berths_occupied", 5),
            "cold_storage_available": has_cold,
            "suitability_score": composite_suitability,
            "recommendation_rank": 0,
            "transit_mode_to_primary": "road" if dist < 300 else "rail_intermodal" if dist < 1200 else "coastal_feeder",
        })

    # Sort descending by suitability
    candidates.sort(key=lambda c: c["suitability_score"], reverse=True)
    for idx, c in enumerate(candidates):
        c["recommendation_rank"] = idx + 1

    return candidates


def match_fleet_assets(
    target_lat: float,
    target_lng: float,
    fleet_catalog: List[Dict[str, Any]],
    requires_refrigeration: bool = False,
    max_radius_km: float = 300.0,
) -> List[Dict[str, Any]]:
    """
    Finds nearest suitable idle fleet vehicles using Haversine calculation.
    """
    matched: List[Dict[str, Any]] = []

    for asset in fleet_catalog:
        if not asset.get("availability", True) or asset.get("status") != "idle":
            continue

        if requires_refrigeration and not asset.get("refrigeration_capable", False):
            continue

        loc = asset.get("location", {})
        a_lat = loc.get("lat", 0.0)
        a_lng = loc.get("lng", 0.0)

        dist = haversine_distance(target_lat, target_lng, a_lat, a_lng)
        if dist > max_radius_km:
            continue

        speed = float(asset.get("speed_kmh", 60.0))
        eta_hours = round(dist / max(10.0, speed), 1)

        matched.append({
            "vehicle_id": asset.get("vehicle_id"),
            "name": asset.get("name"),
            "asset_type": asset.get("asset_type"),
            "carrier_name": asset.get("carrier_name"),
            "distance_km": dist,
            "estimated_arrival_hours": eta_hours,
            "capacity_teu": asset.get("capacity_teu", 2),
            "refrigeration_capable": asset.get("refrigeration_capable", False),
            "current_temp": asset.get("current_temp"),
            "hourly_cost_usd": asset.get("hourly_cost_usd", 75),
        })

    matched.sort(key=lambda a: a["distance_km"])
    return matched
