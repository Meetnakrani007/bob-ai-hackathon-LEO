import mongoose, { Schema, Document } from 'mongoose';

export interface IPort extends Document {
  port_id: string;
  name: string;
  code: string;
  country: string;
  location: {
    lat: number;
    lng: number;
  };
  capacity_teu: number;
  current_congestion_pct: number;
  status: 'normal' | 'congested' | 'disrupted' | 'closed';
  average_dwell_time_hours: number;
  berths_total: number;
  berths_occupied: number;
  cold_storage_available: boolean;
  facilities: string[];
  created_at: Date;
  updated_at: Date;
}

const PortSchema = new Schema<IPort>(
  {
    port_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    country: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    capacity_teu: { type: Number, required: true },
    current_congestion_pct: { type: Number, default: 20, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['normal', 'congested', 'disrupted', 'closed'],
      default: 'normal',
    },
    average_dwell_time_hours: { type: Number, default: 24 },
    berths_total: { type: Number, default: 10 },
    berths_occupied: { type: Number, default: 4 },
    cold_storage_available: { type: Boolean, default: true },
    facilities: [{ type: String }],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

PortSchema.index({ 'location.lat': 1, 'location.lng': 1 });

export const Port = mongoose.model<IPort>('Port', PortSchema);
