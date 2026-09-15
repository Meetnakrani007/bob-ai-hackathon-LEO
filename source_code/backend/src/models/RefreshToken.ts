import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  token_id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked: boolean;
  user_agent?: string;
  ip_address?: string;
  created_at: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    token_id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    token_hash: { type: String, required: true },
    expires_at: { type: Date, required: true, index: { expires: 0 } },
    revoked: { type: Boolean, default: false },
    user_agent: { type: String },
    ip_address: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
