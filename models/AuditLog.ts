import mongoose, { Schema, Document, Model } from 'mongoose';

export type AuditAction = 
  | 'login_success'
  | 'login_fail'
  | 'entry_created'
  | 'entry_updated'
  | 'entry_deleted'
  | 'entry_shared'
  | 'ip_blocked'
  | 'ip_unblocked'
  | 'totp_verified';

export interface IAuditLog extends Document {
  action: AuditAction;
  entityId?: string;
  ip: string;
  userAgent?: string;
  details?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'login_success',
        'login_fail',
        'entry_created',
        'entry_updated',
        'entry_deleted',
        'entry_shared',
        'ip_blocked',
        'ip_unblocked',
        'totp_verified'
      ],
    },
    entityId: { type: String },
    ip: { type: String, required: true, index: true },
    userAgent: { type: String },
    details: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
  }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
