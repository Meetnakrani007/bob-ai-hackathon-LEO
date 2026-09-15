import { Request, Response } from 'express';
import { Fleet } from '../models';

export async function getAvailableFleet(req: Request, res: Response): Promise<void> {
  const { requires_refrigeration, asset_type, lat, lng, radius_km = '200' } = req.query;

  const filter: any = {
    availability: true,
    status: 'idle',
  };

  if (requires_refrigeration === 'true') {
    filter.refrigeration_capable = true;
  }

  if (asset_type) {
    filter.asset_type = asset_type;
  }

  let fleet = await Fleet.find(filter);

  // If geo-coordinates provided, calculate distance and sort
  if (lat && lng) {
    const targetLat = parseFloat(lat as string);
    const targetLng = parseFloat(lng as string);
    const maxRadius = parseFloat(radius_km as string);

    // Haversine distance calculation in km
    const fleetWithDistance = fleet.map((f) => {
      const dLat = ((f.location.lat - targetLat) * Math.PI) / 180;
      const dLng = ((f.location.lng - targetLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((targetLat * Math.PI) / 180) *
          Math.cos((f.location.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance_km = 6371 * c; // Earth radius in km

      return {
        ...f.toObject(),
        distance_km: Number(distance_km.toFixed(1)),
        estimated_arrival_hours: Number((distance_km / f.speed_kmh).toFixed(1)),
      };
    });

    // Filter by radius and sort closest first
    const filtered = fleetWithDistance.filter((f) => f.distance_km <= maxRadius);
    filtered.sort((a, b) => a.distance_km - b.distance_km);

    res.json({
      data: filtered,
      count: filtered.length,
    });
    return;
  }

  res.json({
    data: fleet,
    count: fleet.length,
  });
}

export async function getFleetById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const asset = await Fleet.findOne({ vehicle_id: id });

  if (!asset) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: `Fleet asset "${id}" not found` },
    });
    return;
  }

  res.json({ data: asset });
}
