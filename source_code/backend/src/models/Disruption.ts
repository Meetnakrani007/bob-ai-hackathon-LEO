import mongoose, { Schema, Document } from 'mongoose';

export type DisruptionType = 'strike' | 'weather' | 'geopolitical' | 'congestion' | 'equipment_failure' | 'canal_blockage';
export type DisruptionSeverity = 'low' | 'medium' | 'high' | 'critical';
export type DisruptionStatus = 'active' | 'mitigated' | 'resolved';
export type VerificationStatus = 'unverified' | 'investigating' | 'verified' | 'false_alarm';

export interface IDisruption extends Document {
  disruption_id: string;
  title: string;
  description: string;
  type: DisruptionType;
  severity: DisruptionSeverity;
  affected_ports: string[];
  affected_routes: string[];
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  radius_km: number;
  started_at: Date;
  estimated_end?: Date;
  status: DisruptionStatus;
  verification_status: VerificationStatus;
  confidence_score: number;
  evidence_summary: string;
  evidence_count: number;
  impact_estimate_usd?: number;
  created_at: Date;
  updated_at: Date;
}

const DisruptionSchema = new Schema<IDisruption>(
  {
    disruption_id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['strike', 'weather', 'geopolitical', 'congestion', 'equipment_failure', 'canal_blockage'],
      index: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      index: true,
    },
    affected_ports: [{ type: String, index: true }],
    affected_routes: [{ type: String }],
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      name: { type: String, required: true },
    },
    radius_km: { type: Number, default: 50 },
    started_at: { type: Date, required: true },
    estimated_end: { type: Date },
    status: {
      type: String,
      enum: ['active', 'mitigated', 'resolved'],
      default: 'active',
      index: true,
    },
    verification_status: {
      type: String,
      enum: ['unverified', 'investigating', 'verified', 'false_alarm'],
      default: 'investigating',
      index: true,
    },
    confidence_score: { type: Number, default: 0.85, min: 0, max: 1 },
    evidence_summary: { type: String, required: true },
    evidence_count: { type: Number, default: 1 },
    impact_estimate_usd: { type: Number },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

DisruptionSchema.index({ 'location.lat': 1, 'location.lng': 1 });

export const Disruption = mongoose.model<IDisruption>('Disruption', DisruptionSchema);
