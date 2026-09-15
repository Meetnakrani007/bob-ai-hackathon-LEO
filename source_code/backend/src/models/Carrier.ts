import mongoose, { Schema, Document } from 'mongoose';

export interface ICarrier extends Document {
  carrier_id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  modes_supported: string[];
  fleet_size: number;
  reliability_score: number;
  on_time_rate_pct: number;
  active_contracts: number;
  primary_regions: string[];
  created_at: Date;
  updated_at: Date;
}

const CarrierSchema = new Schema<ICarrier>(
  {
    carrier_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    contact_email: { type: String, required: true },
    contact_phone: { type: String, required: true },
    modes_supported: [{ type: String }],
    fleet_size: { type: Number, default: 10 },
    reliability_score: { type: Number, default: 0.9, min: 0, max: 1 },
    on_time_rate_pct: { type: Number, default: 92, min: 0, max: 100 },
    active_contracts: { type: Number, default: 5 },
    primary_regions: [{ type: String }],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Carrier = mongoose.model<ICarrier>('Carrier', CarrierSchema);
