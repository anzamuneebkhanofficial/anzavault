import mongoose, { Schema, Document, Model } from 'mongoose';

export type VaultCategory =
  | 'banking'
  | 'email'
  | 'social'
  | 'government'
  | 'education'
  | 'custom';

export interface IVaultEntry extends Document {
  title: string;
  category: VaultCategory;
  usernameOrEmail?: string;
  passwordEncrypted?: string;
  url?: string;
  notesEncrypted?: string;
  metadataEncrypted?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VaultEntrySchema = new Schema<IVaultEntry>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['banking', 'email', 'social', 'government', 'education', 'custom'],
      default: 'custom',
    },
    usernameOrEmail: { type: String, default: '', trim: true },
    passwordEncrypted: { type: String, default: '' },
    url: { type: String, default: '', trim: true },
    notesEncrypted: { type: String, default: '' },
    metadataEncrypted: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

VaultEntrySchema.index({ category: 1, updatedAt: -1 });
VaultEntrySchema.index({ title: 1 });

export const VaultEntry: Model<IVaultEntry> =
  mongoose.models.VaultEntry || mongoose.model<IVaultEntry>('VaultEntry', VaultEntrySchema);
