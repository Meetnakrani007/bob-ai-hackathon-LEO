import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'alert' | 'action_required' | 'system' | 'info';
export type NotificationSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface INotification extends Document {
  notification_id: string;
  user_id: string;
  organization_id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  payload: Record<string, any>;
  read: boolean;
  read_at?: Date;
  created_at: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    notification_id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    organization_id: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['alert', 'action_required', 'system', 'info'],
      default: 'alert',
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false, index: true },
    read_at: { type: Date },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
