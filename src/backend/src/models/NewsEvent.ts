import mongoose, { Schema, Document } from 'mongoose';

export type NewsSource = 'reuters' | 'maritime_bulletin' | 'port_authority' | 'ais_feed' | 'social' | 'local_news';

export interface INewsEvent extends Document {
  event_id: string;
  source: NewsSource;
  raw_text: string;
  normalized_event: {
    title: string;
    port_id?: string;
    disruption_type: string;
    severity: string;
    action_suggested?: string;
  };
  credibility_score: number;
  timestamp: Date;
  verification_status: 'verified' | 'unverified' | 'refuted';
  url?: string;
  matched_disruption_id?: string;
  created_at: Date;
  updated_at: Date;
}

const NewsEventSchema = new Schema<INewsEvent>(
  {
    event_id: { type: String, required: true, unique: true, index: true },
    source: {
      type: String,
      required: true,
      enum: ['reuters', 'maritime_bulletin', 'port_authority', 'ais_feed', 'social', 'local_news'],
      index: true,
    },
    raw_text: { type: String, required: true },
    normalized_event: {
      title: { type: String, required: true },
      port_id: { type: String, index: true },
      disruption_type: { type: String, required: true },
      severity: { type: String, required: true },
      action_suggested: { type: String },
    },
    credibility_score: { type: Number, required: true, min: 0, max: 1 },
    timestamp: { type: Date, required: true },
    verification_status: {
      type: String,
      enum: ['verified', 'unverified', 'refuted'],
      default: 'unverified',
      index: true,
    },
    url: { type: String },
    matched_disruption_id: { type: String, index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const NewsEvent = mongoose.model<INewsEvent>('NewsEvent', NewsEventSchema);
