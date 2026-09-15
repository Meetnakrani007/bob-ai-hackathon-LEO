import mongoose, { Schema, Document } from 'mongoose';

export type CargoType = 'pharmaceuticals' | 'electronics' | 'perishables' | 'automotive' | 'general';
export type ShipmentPriority = 'critical' | 'high' | 'medium' | 'low';
export type ShipmentStatus = 'in_transit' | 'delayed' | 'rerouted' | 'delivered' | 'at_risk' | 'held';

export interface IShipment extends Document {
  shipment_id: string;
  tracking_number: string;
  title: string;
  origin_port_id: string;
  destination_port_id: string;
  destination_name: string;
  current_location: {
    lat: number;
    lng: number;
  };
  current_route_id: string;
  cargo_type: CargoType;
  cargo_description: string;
  container_id: string;
  value_usd: number;
  weight_kg: number;
  deadline: Date;
  eta: Date;
  priority: ShipmentPriority;
  requires_refrigeration: boolean;
  target_temp_min?: number;
  target_temp_max?: number;
  status: ShipmentStatus;
  risk_score: number;
  risk_factors: string[];
  assigned_vehicle_id?: string;
  carrier_id?: string;
  reroute_history: Array<{
    from_route: string;
    to_route: string;
    timestamp: Date;
    reason: string;
    approved_by?: string;
  }>;
  created_at: Date;
  updated_at: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    shipment_id: { type: String, required: true, unique: true, index: true },
    tracking_number: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    origin_port_id: { type: String, required: true, index: true },
    destination_port_id: { type: String, required: true, index: true },
    destination_name: { type: String, required: true },
    current_location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    current_route_id: { type: String, required: true, index: true },
    cargo_type: {
      type: String,
      required: true,
      enum: ['pharmaceuticals', 'electronics', 'perishables', 'automotive', 'general'],
      index: true,
    },
    cargo_description: { type: String, required: true },
    container_id: { type: String, required: true, index: true },
    value_usd: { type: Number, required: true },
    weight_kg: { type: Number, required: true },
    deadline: { type: Date, required: true },
    eta: { type: Date, required: true },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
      index: true,
    },
    requires_refrigeration: { type: Boolean, default: false, index: true },
    target_temp_min: { type: Number },
    target_temp_max: { type: Number },
    status: {
      type: String,
      enum: ['in_transit', 'delayed', 'rerouted', 'delivered', 'at_risk', 'held'],
      default: 'in_transit',
      index: true,
    },
    risk_score: { type: Number, default: 0, min: 0, max: 100, index: true },
    risk_factors: [{ type: String }],
    assigned_vehicle_id: { type: String },
    carrier_id: { type: String },
    reroute_history: [
      {
        from_route: { type: String },
        to_route: { type: String },
        timestamp: { type: Date, default: Date.now },
        reason: { type: String },
        approved_by: { type: String },
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ShipmentSchema.index({ 'current_location.lat': 1, 'current_location.lng': 1 });

export const Shipment = mongoose.model<IShipment>('Shipment', ShipmentSchema);
