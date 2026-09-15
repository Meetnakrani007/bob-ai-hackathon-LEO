"""
Comprehensive test suite for the SupplyGuard AI Python Analytics Microservice.
Verifies math algorithms, heuristics, simulation, and all FastAPI endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone, timedelta

from app.main import app
from app.risk.scorer import calculate_composite_risk
from app.coldchain.analyzer import analyze_cold_chain_telemetry
from app.optimization.optimizer import (
    haversine_distance,
    evaluate_alternative_ports,
    match_fleet_assets,
)
from app.evidence.verifier import verify_disruption_evidence
from app.simulation.simulator import simulate_network_disruption
from app.optimization.scenarios import (
    compare_reroute_scenarios,
    generate_executable_action_plan,
)

client = TestClient(app)


# =======================================================
# 1. Health Endpoint
# =======================================================

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "supplyguard-python-analytics"


# =======================================================
# 2. Risk Scorer Unit & API Tests
# =======================================================

def test_risk_scorer_normal_shipment():
    now = datetime.now(timezone.utc)
    risk = calculate_composite_risk(
        shipment_id="SHP-TEST-01",
        cargo_type="general",
        value_usd=50000.0,
        deadline=now + timedelta(days=4),
        eta=now + timedelta(days=2),
        requires_refrigeration=False,
        port_congestion_pct=15.0,
        port_status="normal",
        is_destination_disrupted=False,
    )
    assert risk["risk_score"] < 40.0
    assert risk["risk_level"] in ("low", "medium")
    assert len(risk["factors"]) >= 3


def test_risk_scorer_critical_disrupted_pharma():
    now = datetime.now(timezone.utc)
    risk = calculate_composite_risk(
        shipment_id="SHP-PHARMA-1001",
        cargo_type="pharmaceuticals",
        value_usd=1250000.0,
        deadline=now + timedelta(hours=36),
        eta=now + timedelta(hours=48),  # 12h past deadline
        requires_refrigeration=True,
        port_congestion_pct=94.0,
        port_status="disrupted",
        current_temp=7.8,
        min_temp=2.0,
        max_temp=8.0,
        is_destination_disrupted=True,
    )
    assert risk["risk_score"] >= 85.0
    assert risk["risk_level"] == "critical"
    assert len(risk["recommendations"]) >= 1


def test_get_risk_endpoint():
    response = client.get("/analytics/risk/SHP-PHARMA-1001")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["shipment_id"] == "SHP-PHARMA-1001"
    assert data["risk_score"] >= 80.0
    assert data["risk_level"] == "critical"


# =======================================================
# 3. Cold-Chain Analyzer Unit & API Tests
# =======================================================

def test_cold_chain_telemetry_slope_and_prediction():
    now = datetime.now(timezone.utc)
    logs = [
        {"timestamp": (now - timedelta(hours=2)).isoformat(), "temperature_celsius": 5.0},
        {"timestamp": (now - timedelta(hours=1)).isoformat(), "temperature_celsius": 6.0},
        {"timestamp": now.isoformat(), "temperature_celsius": 7.0},
    ]

    analysis = analyze_cold_chain_telemetry(
        container_id="CONT-REEFER-9042",
        telemetry_logs=logs,
        min_temp=2.0,
        max_temp=8.0,
    )

    assert analysis["temperature_velocity_per_hour"] == pytest.approx(1.0, 0.1)
    # Remaining buffer to 8.0 is 1.0 degree at 1.0 deg/hour -> ~1 hour
    assert analysis["estimated_hours_to_excursion"] == pytest.approx(1.0, 0.2)
    assert analysis["severity"] == "critical"


def test_cold_chain_active_excursion():
    logs = [{"timestamp": datetime.now(timezone.utc).isoformat(), "temperature_celsius": 9.2}]
    analysis = analyze_cold_chain_telemetry("CONT-REEFER-999", logs, min_temp=2.0, max_temp=8.0)
    assert analysis["excursion_detected"] is True
    assert analysis["severity"] == "critical"


def test_get_cold_chain_endpoint():
    response = client.get("/analytics/coldchain/CONT-REEFER-9042")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["container_id"] == "CONT-REEFER-9042"
    assert "current_temperature" in data
    assert "temperature_velocity_per_hour" in data


# =======================================================
# 4. Port & Fleet Optimization Tests
# =======================================================

def test_haversine_distance():
    # Mumbai (18.9438, 72.8550) to Nhava Sheva (18.9500, 72.9500) is approx 10 km straight-line
    dist = haversine_distance(18.9438, 72.8550, 18.9500, 72.9500)
    assert 8.0 <= dist <= 12.0


def test_evaluate_alternative_ports():
    ports = [
        {
            "port_id": "INBOM",
            "name": "Mumbai Port",
            "status": "disrupted",
            "current_congestion_pct": 94,
            "location": {"lat": 18.9438, "lng": 72.855},
        },
        {
            "port_id": "INNSA",
            "name": "Nhava Sheva",
            "status": "congested",
            "current_congestion_pct": 60,
            "location": {"lat": 18.95, "lng": 72.95},
            "cold_storage_available": True,
        },
        {
            "port_id": "INMUN",
            "name": "Mundra Port",
            "status": "normal",
            "current_congestion_pct": 28,
            "location": {"lat": 22.7441, "lng": 69.7061},
            "cold_storage_available": True,
        },
    ]

    ranked = evaluate_alternative_ports("INBOM", ports, requires_refrigeration=True)
    assert len(ranked) == 2
    # Both INNSA and INMUN are valid alternatives
    assert ranked[0]["port_id"] in ("INNSA", "INMUN")
    assert ranked[0]["suitability_score"] > 50.0


def test_match_fleet_assets():
    fleet = [
        {
            "vehicle_id": "TRK-01",
            "name": "Reefer Near",
            "availability": True,
            "status": "idle",
            "refrigeration_capable": True,
            "location": {"lat": 18.96, "lng": 72.96},
            "speed_kmh": 60.0,
        },
        {
            "vehicle_id": "TRK-02",
            "name": "Reefer Far",
            "availability": True,
            "status": "idle",
            "refrigeration_capable": True,
            "location": {"lat": 22.7, "lng": 69.7},
            "speed_kmh": 60.0,
        },
        {
            "vehicle_id": "TRK-03",
            "name": "Dry Van Near",
            "availability": True,
            "status": "idle",
            "refrigeration_capable": False,
            "location": {"lat": 18.95, "lng": 72.95},
            "speed_kmh": 60.0,
        },
    ]

    # Target near Mumbai
    matched = match_fleet_assets(18.95, 72.95, fleet, requires_refrigeration=True, max_radius_km=100.0)
    assert len(matched) == 1
    assert matched[0]["vehicle_id"] == "TRK-01"


def test_post_alternative_ports_endpoint():
    response = client.post(
        "/analytics/alternative-ports",
        json={"origin_port_id": "INBOM", "cargo_type": "pharmaceuticals", "requires_refrigeration": True},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["disrupted_port_id"] == "INBOM"
    assert len(data["candidate_ports"]) > 0
    assert data["recommended_port_id"] is not None


def test_post_fleet_available_endpoint():
    response = client.post(
        "/analytics/fleet/available",
        json={"lat": 18.95, "lng": 72.95, "requires_refrigeration": True, "max_radius_km": 150.0},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["matched_assets_count"] > 0
    assert data["closest_asset_id"] in ("TRK-REEFER-01", "TRK-REEFER-02")


# =======================================================
# 5. Evidence Verification Tests
# =======================================================

def test_verify_disruption_evidence_multi_source():
    evidence = [
        {"source": "port_authority", "credibility_score": 0.99, "normalized_event": {"disruption_type": "strike"}},
        {"source": "reuters", "credibility_score": 0.95, "normalized_event": {"disruption_type": "strike"}},
        {"source": "ais_feed", "credibility_score": 0.98, "normalized_event": {"disruption_type": "strike"}},
    ]

    res = verify_disruption_evidence("DIS-2026-BOM-001", evidence)
    assert res["verification_status"] == "verified"
    assert res["confidence_score"] >= 0.90
    assert res["cross_corroborated"] is True
    assert res["primary_cause"] == "strike"


def test_post_verify_disruption_endpoint():
    response = client.post(
        "/analytics/verify-disruption",
        json={"disruption_id": "DIS-2026-BOM-001"},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["verification_status"] == "verified"
    assert data["confidence_score"] >= 0.90


# =======================================================
# 6. Network Simulation Tests
# =======================================================

def test_simulation_horizon_escalation():
    affected = [
        {"value_usd": 1250000.0, "cargo_type": "pharmaceuticals", "requires_refrigeration": True},
        {"value_usd": 500000.0, "cargo_type": "electronics", "requires_refrigeration": False},
    ]

    sim_24h = simulate_network_disruption("DIS-2026-BOM-001", 24, affected)
    sim_72h = simulate_network_disruption("DIS-2026-BOM-001", 72, affected)

    # 72h queue and demurrage should be strictly greater than 24h
    assert sim_72h["queue_vessels_projected"] > sim_24h["queue_vessels_projected"]
    assert sim_72h["financial_impact"]["vessel_demurrage_accrual_usd"] > sim_24h["financial_impact"]["vessel_demurrage_accrual_usd"]
    assert sim_72h["spoilage_probability_pct"] > sim_24h["spoilage_probability_pct"]


def test_post_simulate_endpoint():
    response = client.post("/analytics/simulate", json={"disruption_id": "DIS-2026-BOM-001", "horizon_hours": 72})
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["simulation_horizon_hours"] == 72
    assert "financial_impact" in data


# =======================================================
# 7. Scenario Comparison & Action Plan Tests
# =======================================================

def test_compare_scenarios_recommends_plan_a_for_pharma():
    comparison = compare_reroute_scenarios(
        disruption_id="DIS-2026-BOM-001",
        shipment_id="SHP-PHARMA-1001",
        cargo_type="pharmaceuticals",
        value_usd=1250000.0,
        requires_refrigeration=True,
    )
    assert comparison["recommended_scenario_id"] == "PLAN-A"
    assert len(comparison["scenarios"]) == 3
    plan_a = next(s for s in comparison["scenarios"] if s["scenario_id"] == "PLAN-A")
    assert plan_a["cold_chain_preserved"] is True
    assert plan_a["post_action_risk_score"] < 25


def test_action_plan_steps_and_role():
    plan = generate_executable_action_plan("DIS-2026-BOM-001", "PLAN-A", "SHP-PHARMA-1001")
    assert plan["approval_required"] is True
    assert plan["required_role"] == "Logistics Manager"
    assert len(plan["steps"]) >= 3
    assert plan["chosen_scenario"]["scenario_id"] == "PLAN-A"


def test_post_compare_endpoint():
    response = client.post(
        "/analytics/compare",
        json={"disruption_id": "DIS-2026-BOM-001", "shipment_id": "SHP-PHARMA-1001"},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["recommended_scenario_id"] == "PLAN-A"
    assert len(data["scenarios"]) == 3


def test_post_action_plan_endpoint():
    response = client.post(
        "/analytics/action-plan",
        json={"disruption_id": "DIS-2026-BOM-001", "chosen_scenario_id": "PLAN-A"},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["approval_required"] is True
    assert len(data["steps"]) >= 3


# =======================================================
# 8. Remaining Routes & Affected Shipments API Tests
# =======================================================

def test_post_affected_shipments_endpoint():
    response = client.post(
        "/analytics/affected-shipments",
        json={"disruption_id": "DIS-2026-BOM-001", "radius_km": 60.0},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["total_affected_count"] > 0
    assert data["critical_count"] > 0


def test_get_route_endpoint():
    response = client.get("/analytics/route/RTE-SIN-BOM-SEA")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["route_id"] == "RTE-SIN-BOM-SEA"
    assert data["status"] == "blocked"
