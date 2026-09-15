import { Request, Response } from 'express';
import { Shipment, TemperatureLog, Route, Port, Disruption } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getShipments(req: AuthenticatedRequest, res: Response): Promise<void> {
  const {
    status,
    cargo_type,
    priority,
    requires_refrigeration,
    min_risk,
    search,
    limit = '50',
    offset = '0',
  } = req.query;

  const filter: any = {};

  if (status) filter.status = status;
  if (cargo_type) filter.cargo_type = cargo_type;
  if (priority) filter.priority = priority;
  if (requires_refrigeration !== undefined) {
    filter.requires_refrigeration = requires_refrigeration === 'true';
  }
  if (min_risk) {
    filter.risk_score = { $gte: Number(min_risk) };
  }
  if (search) {
    filter.$or = [
      { shipment_id: { $regex: search, $options: 'i' } },
      { tracking_number: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { container_id: { $regex: search, $options: 'i' } },
    ];
  }

  const numLimit = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const numOffset = Math.max(0, parseInt(offset as string, 10));

  const [shipments, total] = await Promise.all([
    Shipment.find(filter)
      .sort({ risk_score: -1, priority: 1, created_at: -1 })
      .skip(numOffset)
      .limit(numLimit),
    Shipment.countDocuments(filter),
  ]);

  res.json({
    data: shipments,
    pagination: {
      total,
      limit: numLimit,
      offset: numOffset,
      hasMore: numOffset + shipments.length < total,
    },
  });
}

export async function getShipmentById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const shipment = await Shipment.findOne({
    $or: [{ shipment_id: id }, { tracking_number: id }],
  });

  if (!shipment) {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Shipment with ID or tracking number "${id}" was not found`,
      },
    });
    return;
  }

  // If reefer, fetch recent temperature logs
  let temperatureHistory: any[] = [];
  if (shipment.requires_refrigeration) {
    temperatureHistory = await TemperatureLog.find({ container_id: shipment.container_id })
      .sort({ timestamp: -1 })
      .limit(24);
  }

  // Fetch current route
  const currentRoute = await Route.findOne({ route_id: shipment.current_route_id });

  // Fetch origin and destination ports
  const [originPort, destPort] = await Promise.all([
    Port.findOne({ port_id: shipment.origin_port_id }),
    Port.findOne({ port_id: shipment.destination_port_id }),
  ]);

  res.json({
    data: {
      ...shipment.toObject(),
      origin_port: originPort,
      destination_port: destPort,
      current_route: currentRoute,
      temperature_history: temperatureHistory,
    },
  });
}

export async function getShipmentRisk(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const shipment = await Shipment.findOne({
    $or: [{ shipment_id: id }, { tracking_number: id }],
  });

  if (!shipment) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: `Shipment "${id}" not found` },
    });
    return;
  }

  // Check if destination port has active disruptions
  const activeDisruptions = await Disruption.find({
    affected_ports: shipment.destination_port_id,
    status: 'active',
  });

  // Check temperature excursions
  let excursionCount = 0;
  let latestTemp: number | undefined;
  if (shipment.requires_refrigeration) {
    const logs = await TemperatureLog.find({ container_id: shipment.container_id }).sort({ timestamp: -1 }).limit(10);
    if (logs.length > 0) {
      latestTemp = logs[0].temperature_celsius;
      excursionCount = logs.filter((l) => l.excursion_detected).length;
    }
  }

  // Calculate dynamic factors
  const factors: Array<{ factor: string; impact_points: number; description: string }> = [];

  if (activeDisruptions.length > 0) {
    const primary = activeDisruptions[0];
    factors.push({
      factor: 'PORT_DISRUPTION',
      impact_points: 45,
      description: `Destination port (${shipment.destination_port_id}) affected by ${primary.type} disruption: "${primary.title}". Berths blocked.`,
    });
  }

  if (shipment.requires_refrigeration) {
    if (latestTemp && shipment.target_temp_max && latestTemp > shipment.target_temp_max - 0.5) {
      factors.push({
        factor: 'TEMPERATURE_EXCURSION_RISK',
        impact_points: 35,
        description: `Current container temperature (${latestTemp}°C) is near or above threshold (${shipment.target_temp_max}°C). Cold-chain decay active.`,
      });
    } else {
      factors.push({
        factor: 'COLD_CHAIN_SENSITIVITY',
        impact_points: 15,
        description: `Refrigerated pharma/perishable cargo with strict temperature tolerances (${shipment.target_temp_min}°C to ${shipment.target_temp_max}°C).`,
      });
    }
  }

  if (shipment.value_usd > 500000) {
    factors.push({
      factor: 'HIGH_CARGO_VALUE',
      impact_points: 14,
      description: `Cargo valuation of $${shipment.value_usd.toLocaleString()} USD elevates financial and insurance exposure.`,
    });
  }

  const totalCalculatedRisk = Math.min(99, Math.max(5, factors.reduce((sum, f) => sum + f.impact_points, 0)));

  res.json({
    data: {
      shipment_id: shipment.shipment_id,
      risk_score: Math.max(shipment.risk_score, totalCalculatedRisk),
      risk_level: totalCalculatedRisk > 75 ? 'critical' : totalCalculatedRisk > 50 ? 'high' : totalCalculatedRisk > 25 ? 'medium' : 'low',
      latest_temperature: latestTemp,
      factors,
      active_disruptions: activeDisruptions.map((d) => ({
        disruption_id: d.disruption_id,
        title: d.title,
        severity: d.severity,
        confidence: d.confidence_score,
      })),
    },
  });
}
