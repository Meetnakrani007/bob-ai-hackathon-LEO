import mongoose, { Schema, Document } from 'mongoose';

export type AuditAction =
  | 'REROUTE_APPROVED'
  | 'REROUTE_REJECTED'
  | 'DISRUPTION_VERIFIED'
  | 'FLEET_DISPATCHED'
  | 'PLAN_EXECUTED'
  | 'THRESHOLD_UPDATED'
  | 'MANUAL_OVERRIDE';

export interface IAuditLog extends Document {
  log_id: string;
  timestamp: Date;
  actor: {
    user_id: string;
    email: string;
    name: string;
    role: string;
  };
  organization_id: string;
  action: AuditAction | string;
  target_type: 'shipment' | 'disruption' | 'fleet' | 'route' | 'plan';
  target_id: string;
  details: Record<string, any>;
  reason: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'auto_applied';
  approved_by?: string;
  ai_recommendation_id?: string;
  confidence_score?: number;
  created_at: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    log_id: { type: String, required: true, unique: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    actor: {
      user_id: { type: String, required: true },
      email: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, required: true },
    },
    organization_id: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    target_type: {
      type: String,
      required: true,
      enum: ['shipment', 'disruption', 'fleet', 'route', 'plan'],
      index: true,
    },
    target_id: { type: String, required: true, index: true },
    details: { type: Schema.Types.Mixed, default: {} },
    reason: { type: String, required: true },
    approval_status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'auto_applied'],
      default: 'approved',
      index: true,
    },
    approved_by: { type: String },
    ai_recommendation_id: { type: String },
    confidence_score: { type: Number },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
