import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'Admin' | 'Logistics Manager' | 'Supply Chain Analyst' | 'Auditor' | 'Normal User';

export interface IUser extends Document {
  user_id: string;
  organization_id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  password_hash: string;
  avatar_url?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    user_id: { type: String, required: true, unique: true, index: true },
    organization_id: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ['Admin', 'Logistics Manager', 'Supply Chain Analyst', 'Auditor', 'Normal User'],
      default: 'Normal User',
    },
    permissions: [{ type: String }],
    password_hash: { type: String, required: true },
    avatar_url: { type: String },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
