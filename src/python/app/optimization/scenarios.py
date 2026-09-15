"""
SupplyGuard AI — Scenario Comparison & Action Plan Generation
Compares operational alternatives (Plan A vs Plan B vs Plan C) and synthesizes
actionable recommendations for logistics decision-makers.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone


def compare_reroute_scenarios(
    disruption_id: str,
    shipment_id: str = "SHP-PHARMA-1001",
    cargo_type: str = "pharmaceuticals",
    value_usd: float = 1250000.0,
    requires_refrigeration: bool = True,
) -> Dict[str, Any]:
    """
    Evaluates 3 distinct intervention options and calculates tradeoff metrics.
    """
    plan_a = {
        "scenario_id": "PLAN-A",
        "title": "Divert to Nhava Sheva (JNPT) + Dedicated Reefer Shuttle",
        "route_name": "RTE-SIN-NSA-SEA (Alternative Channel) -> JNPT Gate -> MTHL Bypass",
        "destination_port": "INNSA",
        "transport_mode": "Multimodal (Sea + Reefer Road Shuttle)",
        "cost_delta_usd": 1450.0,
        "time_delta_hours": +4.5,
        "post_action_risk_score": 18,
        "cold_chain_preserved": True,
        "feasibility_pct": 96,
        "pros": [
            "Immediate berth availability at JNPT Terminal 2",
            "Assigned specialized reefer truck (TRK-REEFER-01) 8km away",
            "Maintains 2°C - 8°C cold-chain without thermal breach",
            "Transit delay of only 4.5h beats critical 36h delivery deadline",
        ],
        "cons": [
            "Incremental road toll fee via Atal Setu bridge corridor",
        ],
        "recommended": True,
    }

    plan_b = {
        "scenario_id": "PLAN-B",
        "title": "Reroute to Mundra Port + Western DFC Fast Rail",
        "route_name": "RTE-SIN-MUN-SEA -> Mundra Port Berth -> DFC Rail Link",
        "destination_port": "INMUN",
        "transport_mode": "Multimodal (Sea + DFC Rail)",
        "cost_delta_usd": 2850.0,
        "time_delta_hours": +26.0,
        "post_action_risk_score": 34,
        "cold_chain_preserved": True,
        "feasibility_pct": 84,
        "pros": [
            "Mundra port has zero labor congestion (28% capacity utilized)",
            "Direct rail connection to North/West India distribution centers",
        ],
        "cons": [
            "26-hour transit deviation consumes 72% of remaining safe shelf-life window",
            "Higher freight tariff for coastal deviation and rail transshipment",
        ],
        "recommended": False,
    }

    plan_c = {
        "scenario_id": "PLAN-C",
        "title": "Maintain Outer Anchorage Queue at Mumbai Port",
        "route_name": "RTE-SIN-BOM-SEA (Original Route - Suspended)",
        "destination_port": "INBOM",
        "transport_mode": "Sea (Stationary Anchor)",
        "cost_delta_usd": 8500.0,
        "time_delta_hours": +72.0,
        "post_action_risk_score": 96,
        "cold_chain_preserved": False,
        "feasibility_pct": 12,
        "pros": [
            "No dynamic vessel reroute coordination needed",
        ],
        "cons": [
            "Severe cold-chain thermal failure predicted in < 6.5 hours",
            "Potential total loss of $1,250,000 USD critical pharma consignment",
            "Demurrage penalty accrual of $35,000 USD/day",
            "Deadlines breached across entire downstream healthcare network",
        ],
        "recommended": False,
    }

    scenarios = [plan_a, plan_b, plan_c]

    best_plan = plan_a

    return {
        "disruption_id": disruption_id,
        "shipment_id": shipment_id,
        "cargo_valuation_usd": value_usd,
        "recommended_scenario_id": best_plan["scenario_id"],
        "confidence_score": 0.94,
        "recommendation_summary": (
            f"RECOMMENDATION: Execute {best_plan['title']}. "
            f"Safeguards ${value_usd:,.0f} USD pharma cargo, maintains cold-chain integrity, "
            f"and lowers operational risk score from 94 to 18 with minimal +4.5h delay."
        ),
        "scenarios": scenarios,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }


def generate_executable_action_plan(
    disruption_id: str,
    chosen_scenario_id: str = "PLAN-A",
    shipment_id: str = "SHP-PHARMA-1001",
) -> Dict[str, Any]:
    """
    Constructs a concrete action plan ready for human approval and automated dispatch.
    """
    comparison = compare_reroute_scenarios(disruption_id, shipment_id=shipment_id)
    scenario = next(
        (s for s in comparison["scenarios"] if s["scenario_id"] == chosen_scenario_id),
        comparison["scenarios"][0]
    )

    action_id = f"ACT-{disruption_id[:8]}-{shipment_id[:7]}"

    return {
        "action_id": action_id,
        "disruption_id": disruption_id,
        "shipment_id": shipment_id,
        "chosen_scenario": scenario,
        "steps": [
            {
                "step_order": 1,
                "action": "NOTIFY_VESSEL_MASTER",
                "description": "Transmit revised sailing orders to MV Maersk Seletar: Alter course to JNPT pilot station.",
                "automated": True,
            },
            {
                "step_order": 2,
                "action": "BERTH_ALLOCATION_JNPT",
                "description": "Reserve priority Reefer Gate Berth #03 at Nhava Sheva Container Terminal.",
                "automated": True,
            },
            {
                "step_order": 3,
                "action": "DISPATCH_REEFER_FLEET",
                "description": "Dispatch ThermoKing Arctic Express (TRK-REEFER-01) from Nhava Sheva logistics hub to quay.",
                "vehicle_id": "TRK-REEFER-01",
                "automated": True,
            },
            {
                "step_order": 4,
                "action": "CUSTOMS_PRE_CLEARANCE",
                "description": "Submit EDI diversion manifests under Indian Customs emergency transshipment regulations.",
                "automated": True,
            },
        ],
        "approval_required": True,
        "required_role": "Logistics Manager",
        "estimated_cost_usd": scenario["cost_delta_usd"],
        "risk_reduction_pct": 76.5,
        "confidence_score": 0.94,
    }
