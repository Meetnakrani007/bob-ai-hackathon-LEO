"""
SupplyGuard AI — Risk Scoring Engine
Implements multi-factor weighted risk modeling for supply-chain shipments.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


def calculate_composite_risk(
    shipment_id: str,
    cargo_type: str,
    value_usd: float,
    deadline: Optional[datetime],
    eta: Optional[datetime],
    requires_refrigeration: bool,
    port_congestion_pct: float = 20.0,
    port_status: str = "normal",
    current_temp: Optional[float] = None,
    min_temp: Optional[float] = 2.0,
    max_temp: Optional[float] = 8.0,
    is_destination_disrupted: bool = False,
) -> Dict[str, Any]:
    """
    Computes a deterministic, explainable risk score (0-100) based on:
    1. Port Congestion & Disruption Status (35%)
    2. Temperature Deviation & Cold-Chain Stability (25%)
    3. Schedule Tightness / Deadline Delay (20%)
    4. Cargo Value & Criticality (20%)
    """
    # 1. Port Factor (0 - 100)
    if is_destination_disrupted or port_status in ("disrupted", "closed"):
        port_factor = 95.0
    elif port_status == "congested":
        port_factor = min(90.0, max(50.0, port_congestion_pct * 1.1))
    else:
        port_factor = max(10.0, port_congestion_pct * 0.5)

    # 2. Temperature Factor (0 - 100)
    if requires_refrigeration:
        if current_temp is not None and max_temp is not None and min_temp is not None:
            if current_temp > max_temp or current_temp < min_temp:
                temp_factor = 100.0  # Immediate excursion violation
            elif current_temp >= max_temp - 0.6:
                # Approaching upper limit
                temp_factor = 85.0
            elif current_temp >= max_temp - 1.2:
                temp_factor = 60.0
            else:
                temp_factor = 20.0
        else:
            temp_factor = 50.0
    else:
        temp_factor = 0.0

    # 3. Schedule Tightness Factor (0 - 100)
    schedule_factor = 15.0
    delay_hours = 0.0
    if deadline and eta:
        diff_seconds = (eta - deadline).total_seconds()
        delay_hours = diff_seconds / 3600.0
        if delay_hours > 24:
            schedule_factor = 95.0
        elif delay_hours > 0:
            schedule_factor = min(90.0, 50.0 + delay_hours * 1.5)
        elif delay_hours > -12:
            schedule_factor = 40.0
        else:
            schedule_factor = 10.0

    # 4. Cargo Value / Criticality Factor (0 - 100)
    if cargo_type == "pharmaceuticals":
        value_factor = 80.0 + min(20.0, (value_usd / 1000000.0) * 10)
    elif cargo_type == "electronics":
        value_factor = 60.0 + min(30.0, (value_usd / 1000000.0) * 10)
    elif cargo_type == "perishables":
        value_factor = 70.0
    else:
        value_factor = min(60.0, (value_usd / 500000.0) * 20)

    # Weighted Composite Formula
    if requires_refrigeration:
        raw_score = (
            0.35 * port_factor +
            0.25 * temp_factor +
            0.20 * schedule_factor +
            0.20 * value_factor
        )
    else:
        raw_score = (
            0.45 * port_factor +
            0.30 * schedule_factor +
            0.25 * value_factor
        )

    score = round(min(99.0, max(5.0, raw_score)), 1)

    if score >= 75:
        level = "critical"
    elif score >= 50:
        level = "high"
    elif score >= 25:
        level = "medium"
    else:
        level = "low"

    factors: List[Dict[str, Any]] = [
        {
            "factor": "PORT_OPERATIONAL_RISK",
            "weight": 0.35 if requires_refrigeration else 0.45,
            "raw_value": round(port_factor, 1),
            "description": f"Port status is {port_status} with {port_congestion_pct}% congestion",
        },
        {
            "factor": "SCHEDULE_TIGHTNESS",
            "weight": 0.20 if requires_refrigeration else 0.30,
            "raw_value": round(schedule_factor, 1),
            "description": f"ETA variance against deadline: {delay_hours:+.1f} hours",
        },
        {
            "factor": "CARGO_CRITICALITY_VALUE",
            "weight": 0.20 if requires_refrigeration else 0.25,
            "raw_value": round(value_factor, 1),
            "description": f"Cargo type {cargo_type} valued at ${value_usd:,.0f} USD",
        },
    ]

    if requires_refrigeration:
        factors.append({
            "factor": "COLD_CHAIN_TEMPERATURE",
            "weight": 0.25,
            "raw_value": round(temp_factor, 1),
            "description": f"Container temp {current_temp}°C (Safe window: {min_temp}°C - {max_temp}°C)",
        })

    recommendations: List[str] = []
    if is_destination_disrupted:
        recommendations.append("Immediate diversion to non-disrupted regional port recommended.")
    if requires_refrigeration and temp_factor >= 60:
        recommendations.append("Alert carrier: auxiliary refrigeration genset inspection and reefer truck dispatch required.")
    if delay_hours > 0:
        recommendations.append("Fast-track customs pre-clearance and expedited road feeder reservation.")

    return {
        "shipment_id": shipment_id,
        "risk_score": score,
        "risk_level": level,
        "factors": factors,
        "recommendations": recommendations,
        "calculated_at": datetime.now(timezone.utc).isoformat(),
    }
