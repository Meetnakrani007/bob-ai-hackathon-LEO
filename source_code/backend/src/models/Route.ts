import mongoose, { Schema, Document } from 'mongoose';

export type TransportMode = 'sea' | 'road' | 'rail' | 'air' | 'multimodal';
export type RouteStatus = 'active' | 'congested' | 'blocked' | 'alternative';

export interface IRouteWaypoint {
  lat: number;
  lng: number;
  name: string;
  order: number;
}

export interface IRoute extends Document {
  route_id: string;
  name: string;
  origin_port_id: string;
  destination_port_id: string;
  mode: TransportMode;
  distance_km: number;
  estimated_time_hours: number;
  base_cost_usd: number;
  risk_score: number;
  status: RouteStatus;
  waypoints: IRouteWaypoint[];
  passes_through_ports: string[];
  created_at: Date;
  updated_at: Date;
}

const RouteSchema = new Schema<IRoute>(
  {
    route_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    origin_port_id: { type: String, required: true, index: true },
    destination_port_id: { type: String, required: true, index: true },
    mode: {
      type: String,
      required: true,
      enum: ['sea', 'road', 'rail', 'air', 'multimodal'],
      index: true,
    },
    distance_km: { type: Number, required: true },
    estimated_time_hours: { type: Number, required: true },
    base_cost_usd: { type: Number, required: true },
    risk_score: { type: Number, default: 10, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['active', 'congested', 'blocked', 'alternative'],
      default: 'active',
      index: true,
    },
    waypoints: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        name: { type: String, required: true },
        order: { type: Number, required: true },
      },
    ],
    passes_through_ports: [{ type: String }],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Route = mongoose.model<IRoute>('Route', RouteSchema);
