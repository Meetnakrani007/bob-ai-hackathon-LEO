"""
SupplyGuard AI — Disruption Verification & Evidence Aggregation
Aggregates multi-source feeds (AIS telemetry, Port Authority circulars, Reuters bulletins)
to determine disruption veracity and calculate confidence score.
"""

from typing import Dict, Any, List


SOURCE_WEIGHTS = {
    "port_authority": 0.99,
    "ais_feed": 0.98,
    "reuters": 0.95,
    "maritime_bulletin": 0.90,
    "local_news": 0.75,
    "social": 0.50,
}


def verify_disruption_evidence(
    disruption_id: str,
    evidence_events: List[Dict[str, Any]],
    verification_threshold: float = 0.80,
) -> Dict[str, Any]:
    """
    Computes an aggregated credibility score across all corroborating signals.
    """
    if not evidence_events:
        return {
            "disruption_id": disruption_id,
            "verification_status": "unverified",
            "confidence_score": 0.0,
            "evidence_count": 0,
            "distinct_sources_count": 0,
            "primary_cause": "Unknown",
            "summary": "No corroborating intelligence events discovered.",
        }

    sources_seen = set()
    total_weighted_credibility = 0.0
    weight_sum = 0.0

    causes = {}

    for ev in evidence_events:
        src = ev.get("source", "social")
        sources_seen.add(src)

        src_weight = SOURCE_WEIGHTS.get(src, 0.60)
        item_credibility = float(ev.get("credibility_score", 0.80))

        total_weighted_credibility += item_credibility * src_weight
        weight_sum += src_weight

        norm = ev.get("normalized_event", {})
        cause = norm.get("disruption_type") or "strike"
        causes[cause] = causes.get(cause, 0) + 1

    base_confidence = total_weighted_credibility / max(0.001, weight_sum)

    # Multi-source bonus: each independent high-tier source adds corroboration confidence
    source_diversity_bonus = min(0.15, len(sources_seen) * 0.04)
    final_confidence = round(min(0.99, base_confidence + source_diversity_bonus), 2)

    status = "verified" if final_confidence >= verification_threshold else "investigating"
    primary_cause = max(causes, key=causes.get) if causes else "operational_cessation"

    return {
        "disruption_id": disruption_id,
        "verification_status": status,
        "confidence_score": final_confidence,
        "evidence_count": len(evidence_events),
        "distinct_sources_count": len(sources_seen),
        "distinct_sources": list(sources_seen),
        "primary_cause": primary_cause,
        "cross_corroborated": len(sources_seen) >= 2,
        "summary": (
            f"Disruption {status.upper()} with {final_confidence * 100:.0f}% confidence across "
            f"{len(evidence_events)} intelligence items from {len(sources_seen)} distinct sources."
        ),
    }
