import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentProvider =
  | 'jazzcash'
  | 'easypaisa'
  | 'zindigi'
  | 'upaisa'
  | 'ubl_omni'
  | 'hbl_konnect'
  | 'keenu'
  | 'simpaisa'
  | 'finja'
  | 'jazz_cash_business'
  | 'bank'
  | 'meezan'
  | 'ubl'
  | 'hbl'
  | 'mcb'
  | 'abl'
  | 'bank_alfalah'
  | 'bank_al_habib'
  | 'faysal_bank'
  | 'askari_bank'
  | 'bankislami'
  | 'dubai_islamic'
  | 'al_baraka'
  | 'paypak'
  | 'sadapay'
  | 'nayapay'
  | 'card'
  | 'paypal'
  | 'payoneer'
  | 'wise'
  | 'nsave'
  | 'skrill'
  | 'revolut'
  | 'redotpay'
  | 'crypto_exchange'
  | 'other';

export interface IPaymentAccount extends Document {
  provider: PaymentProvider;
  accountTitle: string;
  accountNumberEncrypted: string;
  bankName?: string;
  notesEncrypted?: string;
  currency?: string;
  walletTier?: string;
  linkedCnic?: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentAccountSchema = new Schema<IPaymentAccount>(
  {
    provider: {
      type: String,
      required: true,
      default: 'other',
    },
    accountTitle: { type: String, required: true, trim: true },
    accountNumberEncrypted: { type: String, required: true },
    bankName: { type: String, trim: true },
    notesEncrypted: { type: String },
    currency: { type: String, default: 'PKR', trim: true },
    walletTier: { type: String, default: '', trim: true },
    linkedCnic: { type: String, default: '', trim: true },
    isPinned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

PaymentAccountSchema.index({ isPinned: -1, updatedAt: -1 });
PaymentAccountSchema.index({ provider: 1 });

export const PaymentAccount: Model<IPaymentAccount> =
  mongoose.models.PaymentAccount || mongoose.model<IPaymentAccount>('PaymentAccount', PaymentAccountSchema);

