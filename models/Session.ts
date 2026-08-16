import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISession extends Document {
  jti: string;
  refreshTokenHash: string;
  ip: string;
  userAgentHash: string;
  lastActivity: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    jti: { type: String, required: true, unique: true, index: true },
    refreshTokenHash: { type: String, required: true },
    ip: { type: String, required: true },
    userAgentHash: { type: String, required: true },
    lastActivity: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
