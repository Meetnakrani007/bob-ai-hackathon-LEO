import { Request, Response } from 'express';
import { Disruption, NewsEvent, Shipment } from '../models';

export async function getActiveDisruptions(_req: Request, res: Response): Promise<void> {
  const disruptions = await Disruption.find({ status: 'active' }).sort({ severity: 1, started_at: -1 });

  // Enrich each disruption with corroborating news count and affected shipments count
  const enriched = await Promise.all(
    disruptions.map(async (d) => {
      const [evidenceList, affectedShipmentsCount] = await Promise.all([
        NewsEvent.find({ matched_disruption_id: d.disruption_id }),
        Shipment.countDocuments({
          $or: [
            { origin_port_id: { $in: d.affected_ports } },
            { destination_port_id: { $in: d.affected_ports } },
            { current_route_id: { $in: d.affected_routes } },
          ],
        }),
      ]);

      return {
        ...d.toObject(),
        evidence_items: evidenceList,
        affected_shipments_count: affectedShipmentsCount,
      };
    })
  );

  res.json({ data: enriched });
}

export async function getDisruptionById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const disruption = await Disruption.findOne({ disruption_id: id });
  if (!disruption) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: `Disruption "${id}" not found` },
    });
    return;
  }

  const [evidenceList, affectedShipments] = await Promise.all([
    NewsEvent.find({ matched_disruption_id: disruption.disruption_id }),
    Shipment.find({
      $or: [
        { origin_port_id: { $in: disruption.affected_ports } },
        { destination_port_id: { $in: disruption.affected_ports } },
      ],
    }).limit(20),
  ]);

  res.json({
    data: {
      ...disruption.toObject(),
      evidence_items: evidenceList,
      sample_affected_shipments: affectedShipments,
    },
  });
}
