import { Request, Response } from 'express';
import { Port, Disruption, PortEvent } from '../models';

export async function getPorts(_req: Request, res: Response): Promise<void> {
  const ports = await Port.find().sort({ current_congestion_pct: -1 });
  res.json({ data: ports });
}

export async function getPortStatus(req: Request, res: Response): Promise<void> {
  const idParam = String(req.params.id);

  const port = await Port.findOne({
    $or: [{ port_id: idParam }, { code: idParam.toUpperCase() }],
  });

  if (!port) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: `Port with ID "${idParam}" was not found` },
    });
    return;
  }

  const [disruptions, recentEvents] = await Promise.all([
    Disruption.find({ affected_ports: port.port_id, status: 'active' }),
    PortEvent.find({ port_id: port.port_id }).sort({ timestamp: -1 }).limit(10),
  ]);

  res.json({
    data: {
      ...port.toObject(),
      active_disruptions: disruptions,
      recent_events: recentEvents,
    },
  });
}
