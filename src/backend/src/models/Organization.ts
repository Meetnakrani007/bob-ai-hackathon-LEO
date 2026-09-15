import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  organization_id: string;
  name: string;
  tier: 'starter' | 'professional' | 'enterprise';
  tenant_settings: {
    risk_threshold_alert: number;
    auto_reroute_enabled: boolean;
    default_currency: string;
    timezone: string;
  };
  created_at: Date;
  updated_at: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    organization_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    tier: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      default: 'enterprise',
    },
    tenant_settings: {
      risk_threshold_alert: { type: Number, default: 70 },
      auto_reroute_enabled: { type: Boolean, default: false },
      default_currency: { type: String, default: 'USD' },
      timezone: { type: String, default: 'UTC' },
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
