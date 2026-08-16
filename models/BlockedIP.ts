import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlockedIP extends Document {
  ip: string;
  reason: string;
  attemptCount: number;
  countryCode?: string;
  countryName?: string;
  city?: string;
  flagEmoji?: string;
  blockedAt: Date;
}

const BlockedIPSchema = new Schema<IBlockedIP>(
  {
    ip: { type: String, required: true, unique: true, index: true },
    reason: { type: String, default: 'max_attempts_exceeded' },
    attemptCount: { type: Number, default: 2 },
    countryCode: { type: String, default: 'PK' },
    countryName: { type: String, default: 'Pakistan' },
    city: { type: String, default: 'Karachi' },
    flagEmoji: { type: String, default: '🇵🇰' },
    blockedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

export const BlockedIP: Model<IBlockedIP> =
  mongoose.models.BlockedIP || mongoose.model<IBlockedIP>('BlockedIP', BlockedIPSchema);
