"""
SupplyGuard AI — Python Analytics Microservice
FastAPI-based service providing risk scoring, route optimization,
fleet matching, cold-chain analysis, simulation, and evidence aggregation.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import logging
import os

from app.risk.scorer import calculate_composite_risk
from app.coldchain.analyzer import analyze_cold_chain_telemetry
from app.optimization.optimizer import (
    evaluate_alternative_ports,
    match_fleet_assets,
    haversine_distance,
)
from app.evidence.verifier import verify_disruption_evidence
from app.simulation.simulator import simulate_network_disruption
from app.optimization.scenarios import (
    compare_reroute_scenarios,
    generate_executable_action_plan,
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO").upper()),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("supplyguard-python")

app = FastAPI(
    title="SupplyGuard AI Analytics Service",
    description="Risk scoring, route optimization, fleet matching, cold-chain analysis, simulation, and evidence aggregation",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Pydantic Request Models
# ==========================================

class DisruptionVerifyRequest(BaseModel):
    disruption_id: str
    evidence: Optional[List[Dict[str, Any]]] = None
    verification_threshold: float = Field(default=0.80, ge=0.0, le=1.0)


class AffectedShipmentsRequest(BaseModel):
    disruption_id: str
    radius_km: float = Field(default=60.0, ge=1.0)


class AlternativePortsRequest(BaseModel):
    origin_port_id: str
    cargo_type: str = "general"
    requires_refrigeration: bool = False


class FleetMatchRequest(BaseModel):
    lat: float
    lng: float
    requires_refrigeration: bool = False
    max_radius_km: float = Field(default=250.0, ge=1.0)


class SimulationRequest(BaseModel):
    disruption_id: str
    horizon_hours: int = Field(default=24, ge=12, le=168)


class CompareScenariosRequest(BaseModel):
    disruption_id: str
    shipment_id: str = "SHP-PHARMA-1001"
    cargo_type: str = "pharmaceuticals"
    value_usd: float = 1250000.0
    requires_refrigeration: bool = True


class ActionPlanRequest(BaseModel):
    disruption_id: str
    chosen_scenario_id: str = "PLAN-A"
    shipment_id: str = "SHP-PHARMA-1001"


# Default synthetic knowledge catalogs for standalone analytics execution
PORT_CATALOG = [
    {
        "port_id": "INBOM",
        "name": "Mumbai Port Trust",
        "country": "India",
        "location": {"lat": 18.9438, "lng": 72.855},
        "capacity_teu": 1800000,
        "current_congestion_pct": 94.0,
        "status": "disrupted",
        "berths_total": 12,
        "berths_occupied": 11,
        "cold_storage_available": True,
    },
    {
        "port_id": "INNSA",
        "name": "Nhava Sheva (JNPT)",
        "country": "India",
        "location": {"lat": 18.95, "lng": 72.95},
        "capacity_teu": 5100000,
        "current_congestion_pct": 62.0,
        "status": "congested",
        "berths_total": 16,
        "berths_occupied": 11,
        "cold_storage_available": True,
    },
    {
        "port_id": "INMUN",
        "name": "Mundra Port",
        "country": "India",
        "location": {"lat": 22.7441, "lng": 69.7061},
        "capacity_teu": 6600000,
        "current_congestion_pct": 28.0,
        "status": "normal",
        "berths_total": 24,
        "berths_occupied": 8,
        "cold_storage_available": True,
    },
    {
        "port_id": "INMAA",
        "name": "Chennai Port",
        "country": "India",
        "location": {"lat": 13.0827, "lng": 80.2707},
        "capacity_teu": 2000000,
        "current_congestion_pct": 35.0,
        "status": "normal",
        "berths_total": 14,
        "berths_occupied": 5,
        "cold_storage_available": True,
    },
    {
        "port_id": "LKCMB",
        "name": "Port of Colombo",
        "country": "Sri Lanka",
        "location": {"lat": 6.9497, "lng": 79.8428},
        "capacity_teu": 7200000,
        "current_congestion_pct": 42.0,
        "status": "normal",
        "berths_total": 20,
        "berths_occupied": 9,
        "cold_storage_available": True,
    },
    {
        "port_id": "SGSIN",
        "name": "Port of Singapore",
        "country": "Singapore",
        "location": {"lat": 1.2644, "lng": 103.84},
        "capacity_teu": 37000000,
        "current_congestion_pct": 55.0,
        "status": "normal",
        "berths_total": 67,
        "berths_occupied": 38,
        "cold_storage_available": True,
    },
]

FLEET_CATALOG = [
    {
        "vehicle_id": "TRK-REEFER-01",
        "name": "ThermoKing Arctic Express #01",
        "asset_type": "refrigerated_truck",
        "carrier_name": "Blue Dart Cold Chain Express",
        "location": {"lat": 18.96, "lng": 72.965},
        "capacity_teu": 2,
        "availability": True,
        "status": "idle",
        "refrigeration_capable": True,
        "current_temp": 4.0,
        "speed_kmh": 65.0,
        "hourly_cost_usd": 85.0,
    },
    {
        "vehicle_id": "TRK-REEFER-02",
        "name": "ThermoKing Arctic Express #02",
        "asset_type": "refrigerated_truck",
        "carrier_name": "Blue Dart Cold Chain Express",
        "location": {"lat": 18.948, "lng": 72.938},
        "capacity_teu": 2,
        "availability": True,
        "status": "idle",
        "refrigeration_capable": True,
        "current_temp": 3.8,
        "speed_kmh": 65.0,
        "hourly_cost_usd": 85.0,
    },
    {
        "vehicle_id": "TRK-REEFER-03",
        "name": "Carrier Transicold Hauler #03",
        "asset_type": "refrigerated_truck",
        "carrier_name": "VRL Logistics Express Fleet",
        "location": {"lat": 18.6298, "lng": 73.7997},
        "capacity_teu": 2,
        "availability": True,
        "status": "idle",
        "refrigeration_capable": True,
        "current_temp": 4.2,
        "speed_kmh": 70.0,
        "hourly_cost_usd": 78.0,
    },
    {
        "vehicle_id": "TRK-HEAVY-01",
        "name": "Tata Prima Heavy Hauler #01",
        "asset_type": "container_truck",
        "carrier_name": "Container Corporation of India (CONCOR)",
        "location": {"lat": 18.95, "lng": 72.95},
        "capacity_teu": 2,
        "availability": True,
        "status": "idle",
        "refrigeration_capable": False,
        "speed_kmh": 60.0,
        "hourly_cost_usd": 55.0,
    },
]


# ==========================================
# Endpoints
# ==========================================

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "supplyguard-python-analytics",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/analytics/verify-disruption")
async def verify_disruption(payload: DisruptionVerifyRequest):
    evidence = payload.evidence or [
        {
            "source": "port_authority",
            "credibility_score": 0.99,
            "normalized_event": {"disruption_type": "strike"},
        },
        {
            "source": "reuters",
            "credibility_score": 0.95,
            "normalized_event": {"disruption_type": "strike"},
        },
        {
            "source": "ais_feed",
            "credibility_score": 0.98,
            "normalized_event": {"disruption_type": "congestion"},
        },
    ]

    result = verify_disruption_evidence(
        disruption_id=payload.disruption_id,
        evidence_events=evidence,
        verification_threshold=payload.verification_threshold,
    )
    return {"data": result}


@app.post("/analytics/affected-shipments")
async def find_affected_shipments(payload: AffectedShipmentsRequest):
    # Simulated affected shipments dataset mapped to Mumbai Port strike zone
    affected = [
        {
            "shipment_id": "SHP-PHARMA-1001",
            "tracking_number": "TRK-SG-2026-IN-8890",
            "title": "Critical Insulin & Temperature-Sensitive Vaccines Batch A-7",
            "cargo_type": "pharmaceuticals",
            "value_usd": 1250000.0,
            "requires_refrigeration": True,
            "priority": "critical",
            "risk_score": 94.0,
            "current_location": {"lat": 18.88, "lng": 72.78},
            "distance_to_disruption_km": 14.5,
            "impact_status": "CRITICAL_THREAT",
            "recommended_action": "Immediate reroute to Nhava Sheva (JNPT)",
        },
        {
            "shipment_id": "SHP-ELEC-2002",
            "tracking_number": "TRK-SG-2026-IN-4412",
            "title": "Semiconductor Microcontrollers & ASICs",
            "cargo_type": "electronics",
            "value_usd": 890000.0,
            "requires_refrigeration": False,
            "priority": "high",
            "risk_score": 82.0,
            "current_location": {"lat": 18.82, "lng": 72.75},
            "distance_to_disruption_km": 19.8,
            "impact_status": "SCHEDULE_VIOLATION",
            "recommended_action": "Divert to Mundra or JNPT container yard",
        },
        {
            "shipment_id": "SHP-AGRI-3003",
            "tracking_number": "TRK-SG-2026-IN-1199",
            "title": "Fresh Alphonso Mangoes Export Batch 04",
            "cargo_type": "perishables",
            "value_usd": 185000.0,
            "requires_refrigeration": True,
            "priority": "high",
            "risk_score": 89.0,
            "current_location": {"lat": 18.945, "lng": 72.856},
            "distance_to_disruption_km": 0.8,
            "impact_status": "SPOILAGE_RISK",
            "recommended_action": "Transfer to cold-storage warehouse",
        },
    ]

    return {
        "data": {
            "disruption_id": payload.disruption_id,
            "search_radius_km": payload.radius_km,
            "total_affected_count": len(affected),
            "critical_count": sum(1 for s in affected if s["priority"] == "critical"),
            "reefer_cargo_count": sum(1 for s in affected if s["requires_refrigeration"]),
            "aggregate_value_at_risk_usd": sum(s["value_usd"] for s in affected),
            "shipments": affected,
        }
    }


@app.get("/analytics/risk/{shipment_id}")
async def get_shipment_risk_calculation(shipment_id: str):
    # If the hero pharma shipment:
    if "PHARMA" in shipment_id.upper() or shipment_id == "SHP-PHARMA-1001":
        res = calculate_composite_risk(
            shipment_id=shipment_id,
            cargo_type="pharmaceuticals",
            value_usd=1250000.0,
            deadline=datetime.fromtimestamp(datetime.now().timestamp() + 36 * 3600, tz=timezone.utc),
            eta=datetime.fromtimestamp(datetime.now().timestamp() + 48 * 3600, tz=timezone.utc),
            requires_refrigeration=True,
            port_congestion_pct=94.0,
            port_status="disrupted",
            current_temp=7.84,
            min_temp=2.0,
            max_temp=8.0,
            is_destination_disrupted=True,
        )
    else:
        res = calculate_composite_risk(
            shipment_id=shipment_id,
            cargo_type="general",
            value_usd=150000.0,
            deadline=datetime.fromtimestamp(datetime.now().timestamp() + 72 * 3600, tz=timezone.utc),
            eta=datetime.fromtimestamp(datetime.now().timestamp() + 36 * 3600, tz=timezone.utc),
            requires_refrigeration=False,
            port_congestion_pct=35.0,
            port_status="normal",
            is_destination_disrupted=False,
        )
    return {"data": res}


@app.post("/analytics/alternative-ports")
async def get_alternative_ports(payload: AlternativePortsRequest):
    candidates = evaluate_alternative_ports(
        disrupted_port_id=payload.origin_port_id,
        ports_catalog=PORT_CATALOG,
        cargo_type=payload.cargo_type,
        requires_refrigeration=payload.requires_refrigeration,
    )
    return {
        "data": {
            "disrupted_port_id": payload.origin_port_id,
            "cargo_type": payload.cargo_type,
            "candidate_ports": candidates,
            "recommended_port_id": candidates[0]["port_id"] if candidates else None,
        }
    }


@app.get("/analytics/route/{route_id}")
async def evaluate_route(route_id: str):
    routes_db = {
        "RTE-SIN-BOM-SEA": {
            "route_id": "RTE-SIN-BOM-SEA",
            "name": "Singapore to Mumbai Sea Lane",
            "distance_km": 3920,
            "estimated_time_hours": 120,
            "risk_score": 92.0,
            "status": "blocked",
            "hazard_factor": "Destination port labor strike; anchorage closed",
        },
        "RTE-SIN-NSA-SEA": {
            "route_id": "RTE-SIN-NSA-SEA",
            "name": "Singapore to Nhava Sheva (JNPT) Diversion Lane",
            "distance_km": 3915,
            "estimated_time_hours": 122,
            "risk_score": 32.0,
            "status": "active",
            "hazard_factor": "Moderate gate queuing at JNPT",
        },
        "RTE-SIN-MUN-SEA": {
            "route_id": "RTE-SIN-MUN-SEA",
            "name": "Singapore to Mundra Deepwater Lane",
            "distance_km": 4350,
            "estimated_time_hours": 138,
            "risk_score": 18.0,
            "status": "active",
            "hazard_factor": "Clear sailing with zero congestion",
        },
    }

    info = routes_db.get(route_id, {
        "route_id": route_id,
        "name": f"Route {route_id}",
        "distance_km": 1500,
        "estimated_time_hours": 48,
        "risk_score": 25.0,
        "status": "active",
        "hazard_factor": "Normal maritime route conditions",
    })

    return {"data": info}


@app.post("/analytics/fleet/available")
async def get_available_fleet_proximity(payload: FleetMatchRequest):
    matched = match_fleet_assets(
        target_lat=payload.lat,
        target_lng=payload.lng,
        fleet_catalog=FLEET_CATALOG,
        requires_refrigeration=payload.requires_refrigeration,
        max_radius_km=payload.max_radius_km,
    )
    return {
        "data": {
            "target_location": {"lat": payload.lat, "lng": payload.lng},
            "requires_refrigeration": payload.requires_refrigeration,
            "matched_assets_count": len(matched),
            "closest_asset_id": matched[0]["vehicle_id"] if matched else None,
            "assets": matched,
        }
    }


@app.get("/analytics/coldchain/{container_id}")
async def get_cold_chain_analysis(container_id: str):
    # Simulated 12-hour telemetry history showing creeping temperature
    now = datetime.now(timezone.utc).timestamp()
    logs = [
        {
            "timestamp": datetime.fromtimestamp(now - h * 3600, tz=timezone.utc).isoformat(),
            "temperature_celsius": round(4.0 + (12 - h) * 0.32, 2),
            "battery_level_pct": max(25, 95 - (12 - h) * 5),
        }
        for h in range(12, -1, -1)
    ]

    analysis = analyze_cold_chain_telemetry(
        container_id=container_id,
        telemetry_logs=logs,
        min_temp=2.0,
        max_temp=8.0,
    )
    return {"data": analysis}


@app.post("/analytics/simulate")
async def simulate_impact(payload: SimulationRequest):
    affected = [
        {"value_usd": 1250000.0, "cargo_type": "pharmaceuticals", "requires_refrigeration": True},
        {"value_usd": 890000.0, "cargo_type": "electronics", "requires_refrigeration": False},
        {"value_usd": 185000.0, "cargo_type": "perishables", "requires_refrigeration": True},
        {"value_usd": 420000.0, "cargo_type": "automotive", "requires_refrigeration": False},
    ]

    sim = simulate_network_disruption(
        disruption_id=payload.disruption_id,
        horizon_hours=payload.horizon_hours,
        affected_shipments=affected,
    )
    return {"data": sim}


@app.post("/analytics/compare")
async def compare_scenarios(payload: CompareScenariosRequest):
    comparison = compare_reroute_scenarios(
        disruption_id=payload.disruption_id,
        shipment_id=payload.shipment_id,
        cargo_type=payload.cargo_type,
        value_usd=payload.value_usd,
        requires_refrigeration=payload.requires_refrigeration,
    )
    return {"data": comparison}


@app.post("/analytics/action-plan")
async def create_action_plan(payload: ActionPlanRequest):
    plan = generate_executable_action_plan(
        disruption_id=payload.disruption_id,
        chosen_scenario_id=payload.chosen_scenario_id,
        shipment_id=payload.shipment_id,
    )
    return {"data": plan}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
