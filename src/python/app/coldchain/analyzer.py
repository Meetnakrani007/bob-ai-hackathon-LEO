"""
SupplyGuard AI — Cold-Chain Telemetry & Excursion Analytics
Analyzes temperature velocity, predicted excursion time, and spoilage risk.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


def analyze_cold_chain_telemetry(
    container_id: str,
    telemetry_logs: List[Dict[str, Any]],
    min_temp: float = 2.0,
    max_temp: float = 8.0,
    cargo_type: str = "pharmaceuticals",
) -> Dict[str, Any]:
    """
    Evaluates temperature trend, excursion velocity, and time to thermal failure.
    """
    if not telemetry_logs:
        return {
            "container_id": container_id,
            "status": "NO_DATA",
            "current_temp": None,
            "excursion_detected": False,
            "slope_celsius_per_hour": 0.0,
            "estimated_hours_to_excursion": None,
            "severity": "unknown",
            "recommendation": "No telemetry readings found for this container.",
        }

    # Sort chronological (oldest to newest)
    sorted_logs = sorted(
        telemetry_logs,
        key=lambda l: l.get("timestamp") or datetime.min
    )

    latest = sorted_logs[-1]
    current_temp = float(latest.get("temperature_celsius", 5.0))
    battery_pct = float(latest.get("battery_level_pct", 100.0))

    # Calculate rate of temperature rise (°C / hour)
    slope = 0.0
    if len(sorted_logs) >= 2:
        oldest = sorted_logs[0]
        t_first = oldest.get("timestamp")
        t_last = latest.get("timestamp")

        if isinstance(t_first, str):
            t_first = datetime.fromisoformat(t_first.replace("Z", "+00:00"))
        if isinstance(t_last, str):
            t_last = datetime.fromisoformat(t_last.replace("Z", "+00:00"))

        if t_first and t_last:
            hours_diff = (t_last - t_first).total_seconds() / 3600.0
            if hours_diff > 0.1:
                delta_temp = current_temp - float(oldest.get("temperature_celsius", current_temp))
                slope = round(delta_temp / hours_diff, 3)

    is_excursion = current_temp > max_temp or current_temp < min_temp

    # Time to breach max_temp if slope is positive
    hours_to_excursion: Optional[float] = None
    if not is_excursion and slope > 0:
        buffer_degrees = max_temp - current_temp
        hours_to_excursion = round(max(0.0, buffer_degrees / slope), 1)

    # Risk level assessment
    if is_excursion:
        severity = "critical"
        alert_msg = f"ACTIVE EXCURSION: Temperature {current_temp:.2f}°C exceeds upper limit {max_temp}°C!"
    elif hours_to_excursion is not None and hours_to_excursion <= 4.0:
        severity = "critical"
        alert_msg = f"IMMINENT FAILURE: Thermal buffer will deplete in {hours_to_excursion} hours at +{slope:.2f}°C/hr."
    elif hours_to_excursion is not None and hours_to_excursion <= 12.0:
        severity = "high"
        alert_msg = f"WARNING: Rising temperature trend (+{slope:.2f}°C/hr). Excursion within {hours_to_excursion} hours."
    else:
        severity = "normal"
        alert_msg = f"Stable cold-chain operation at {current_temp:.2f}°C."

    return {
        "container_id": container_id,
        "cargo_type": cargo_type,
        "current_temperature": current_temp,
        "safe_range": {"min": min_temp, "max": max_temp},
        "temperature_velocity_per_hour": slope,
        "battery_level_pct": battery_pct,
        "excursion_detected": is_excursion,
        "estimated_hours_to_excursion": hours_to_excursion,
        "severity": severity,
        "alert_message": alert_msg,
        "readings_analyzed": len(sorted_logs),
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
    }
