import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  totpCode: z.string().optional(),
});

export const vaultEntrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  category: z.enum(['banking', 'email', 'social', 'government', 'education', 'custom']).default('custom'),
  usernameOrEmail: z.string().optional().default(''),
  password: z.string().optional().default(''),
  url: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  metadata: z.record(z.string(), z.any()).optional().default({}),
  tags: z.array(z.string()).optional().default([]),
});

export const paymentAccountSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  accountTitle: z.string().min(1, 'Account title is required').max(100),
  accountNumber: z.string().min(1, 'Account number / IBAN is required'),
  bankName: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  currency: z.string().optional().default('PKR'),
  walletTier: z.string().optional().default(''),
  linkedCnic: z.string().optional().default(''),
  isPinned: z.boolean().default(false),
});

export const unblockIpSchema = z.object({
  ip: z.string().min(1, 'IP address is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type VaultEntryInput = z.infer<typeof vaultEntrySchema>;
export type PaymentAccountInput = z.infer<typeof paymentAccountSchema>;

