import mongoose, { Schema, Document } from 'mongoose';

export interface ITemperatureLog extends Document {
  log_id: string;
  container_id: string;
  shipment_id: string;
  timestamp: Date;
  temperature_celsius: number;
  ambient_temp_celsius: number;
  humidity_pct: number;
  battery_level_pct: number;
  min_threshold: number;
  max_threshold: number;
  excursion_detected: boolean;
  excursion_duration_minutes?: number;
  location?: {
    lat: number;
    lng: number;
  };
  created_at: Date;
}

const TemperatureLogSchema = new Schema<ITemperatureLog>(
  {
    log_id: { type: String, required: true, unique: true, index: true },
    container_id: { type: String, required: true, index: true },
    shipment_id: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true, index: true },
    temperature_celsius: { type: Number, required: true },
    ambient_temp_celsius: { type: Number, required: true },
    humidity_pct: { type: Number, default: 50 },
    battery_level_pct: { type: Number, default: 95 },
    min_threshold: { type: Number, required: true },
    max_threshold: { type: Number, required: true },
    excursion_detected: { type: Boolean, default: false, index: true },
    excursion_duration_minutes: { type: Number, default: 0 },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

TemperatureLogSchema.index({ container_id: 1, timestamp: -1 });

export const TemperatureLog = mongoose.model<ITemperatureLog>('TemperatureLog', TemperatureLogSchema);
