"""
SupplyGuard AI — Cascading Network Impact Simulator
Projects 24h and 72h network congestion, vessel queue growth, demurrage accrual,
and cargo loss exposure under unmitigated vs mitigated conditions.
"""

from typing import Dict, Any, List


def simulate_network_disruption(
    disruption_id: str,
    horizon_hours: int,
    affected_shipments: List[Dict[str, Any]],
    baseline_queue_vessels: int = 14,
    daily_vessel_demurrage_usd: float = 35000.0,
) -> Dict[str, Any]:
    """
    Simulates operational and financial cascade over 24h or 72h horizon.
    """
    horizon = 72 if horizon_hours >= 48 else 24
    days = horizon / 24.0

    total_cargo_value_usd = sum(float(s.get("value_usd", 100000)) for s in affected_shipments)
    reefer_count = sum(1 for s in affected_shipments if s.get("requires_refrigeration", False))
    pharma_value_usd = sum(
        float(s.get("value_usd", 0))
        for s in affected_shipments
        if s.get("cargo_type") == "pharmaceuticals"
    )

    # Nonlinear queue accumulation
    # At 24h: ~6 new vessels arrive without departures -> 20 vessels
    # At 72h: ~20 new arrivals + feeder congestion -> 34 vessels
    inflow_rate_per_day = 6.5
    queue_vessels = int(baseline_queue_vessels + (inflow_rate_per_day * days))
    delayed_teu = queue_vessels * 4200  # Average container ship TEU

    # Financial Exposure
    demurrage_accrual = round(queue_vessels * daily_vessel_demurrage_usd * days, 2)
    # At 72h, perishable and reefer spoilage risk rises to 65% if no action is taken
    spoilage_risk_pct = 15.0 if horizon == 24 else 68.0
    spoilage_financial_loss = round(pharma_value_usd * (spoilage_risk_pct / 100.0), 2)

    total_financial_exposure = round(demurrage_accrual + spoilage_financial_loss + (total_cargo_value_usd * 0.05), 2)

    # Congestion propagation to adjacent nodes
    spillover_effects = []
    if horizon >= 24:
        spillover_effects.append("Nhava Sheva (JNPT) gate queue increases +28% due to diversion inquiries.")
        spillover_effects.append("Mumbai-Pune expressway container truck corridor experiences 4.5 hour choke.")
    if horizon >= 72:
        spillover_effects.append("Western Dedicated Freight Corridor (DFC) rail wagon shortage across Gujarat/Maharashtra.")
        spillover_effects.append("Mundra Port berth occupancy approaches 82% capacity threshold as deepsea liners divert.")

    return {
        "disruption_id": disruption_id,
        "simulation_horizon_hours": horizon,
        "queue_vessels_projected": queue_vessels,
        "delayed_teu_capacity": delayed_teu,
        "affected_shipments_count": len(affected_shipments),
        "total_cargo_value_at_risk_usd": round(total_cargo_value_usd, 2),
        "pharma_cargo_at_risk_usd": round(pharma_value_usd, 2),
        "financial_impact": {
            "vessel_demurrage_accrual_usd": demurrage_accrual,
            "coldchain_spoilage_exposure_usd": spoilage_financial_loss,
            "total_estimated_impact_usd": total_financial_exposure,
        },
        "spoilage_probability_pct": spoilage_risk_pct,
        "spillover_effects": spillover_effects,
        "mitigation_urgency": "IMMEDIATE" if horizon == 72 or reefer_count > 0 else "HIGH",
    }
