import mongoose, { Schema, Document } from 'mongoose';

export type PortEventType = 'berth_delay' | 'crane_breakdown' | 'labor_action' | 'customs_hold' | 'channel_dredging' | 'weather_warning';

export interface IPortEvent extends Document {
  event_id: string;
  port_id: string;
  timestamp: Date;
  event_type: PortEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  impact_delay_hours: number;
  created_at: Date;
}

const PortEventSchema = new Schema<IPortEvent>(
  {
    event_id: { type: String, required: true, unique: true, index: true },
    port_id: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true, index: true },
    event_type: {
      type: String,
      required: true,
      enum: ['berth_delay', 'crane_breakdown', 'labor_action', 'customs_hold', 'channel_dredging', 'weather_warning'],
      index: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
    },
    details: { type: String, required: true },
    impact_delay_hours: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

export const PortEvent = mongoose.model<IPortEvent>('PortEvent', PortEventSchema);
