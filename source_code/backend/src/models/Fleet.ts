import mongoose, { Schema, Document } from 'mongoose';

export type AssetType = 'container_truck' | 'refrigerated_truck' | 'feeder_vessel' | 'cargo_aircraft';
export type FleetStatus = 'idle' | 'in_transit' | 'maintenance' | 'reserved';

export interface IFleet extends Document {
  vehicle_id: string;
  name: string;
  asset_type: AssetType;
  carrier_id: string;
  carrier_name: string;
  location: {
    lat: number;
    lng: number;
    city?: string;
  };
  capacity_teu: number;
  max_weight_tons: number;
  status: FleetStatus;
  availability: boolean;
  refrigeration_capable: boolean;
  current_temp?: number;
  hourly_cost_usd: number;
  speed_kmh: number;
  fuel_range_km: number;
  current_assignment?: string;
  created_at: Date;
  updated_at: Date;
}

const FleetSchema = new Schema<IFleet>(
  {
    vehicle_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    asset_type: {
      type: String,
      required: true,
      enum: ['container_truck', 'refrigerated_truck', 'feeder_vessel', 'cargo_aircraft'],
      index: true,
    },
    carrier_id: { type: String, required: true, index: true },
    carrier_name: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      city: { type: String },
    },
    capacity_teu: { type: Number, required: true },
    max_weight_tons: { type: Number, required: true },
    status: {
      type: String,
      enum: ['idle', 'in_transit', 'maintenance', 'reserved'],
      default: 'idle',
      index: true,
    },
    availability: { type: Boolean, default: true, index: true },
    refrigeration_capable: { type: Boolean, default: false, index: true },
    current_temp: { type: Number },
    hourly_cost_usd: { type: Number, required: true },
    speed_kmh: { type: Number, default: 60 },
    fuel_range_km: { type: Number, default: 800 },
    current_assignment: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

FleetSchema.index({ 'location.lat': 1, 'location.lng': 1 });

export const Fleet = mongoose.model<IFleet>('Fleet', FleetSchema);
