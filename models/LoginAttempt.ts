import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoginAttempt extends Document {
  ip: string;
  emailAttempted: string;
  success: boolean;
  timestamp: Date;
  userAgent: string;
}

const LoginAttemptSchema = new Schema<ILoginAttempt>(
  {
    ip: { type: String, required: true, index: true },
    emailAttempted: { type: String, required: true },
    success: { type: Boolean, required: true },
    timestamp: { type: Date, default: Date.now },
    userAgent: { type: String, default: '' },
  },
  {
    timestamps: false,
  }
);

export const LoginAttempt: Model<ILoginAttempt> =
  mongoose.models.LoginAttempt || mongoose.model<ILoginAttempt>('LoginAttempt', LoginAttemptSchema);
