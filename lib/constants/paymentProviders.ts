export interface PaymentProviderInfo {
  value: string;
  label: string;
  group: 'wallets' | 'banks' | 'international' | 'crypto';
  groupLabel: string;
  badgeColor?: string;
  popular?: boolean;
}

export const PAYMENT_PROVIDERS: PaymentProviderInfo[] = [
  // --- 1. Pakistani Mobile Wallets & Branchless Banking ---
  { value: 'jazzcash', label: 'JazzCash Mobile Wallet', group: 'wallets', groupLabel: 'Pakistani Digital Wallets', popular: true },
  { value: 'easypaisa', label: 'EasyPaisa Mobile Wallet', group: 'wallets', groupLabel: 'Pakistani Digital Wallets', popular: true },
  { value: 'zindigi', label: 'Zindigi (JS Bank Digital Wallet)', group: 'wallets', groupLabel: 'Pakistani Digital Wallets', popular: true },
  { value: 'sadapay', label: 'SadaPay (Mastercard EMI)', group: 'wallets', groupLabel: 'Pakistani Digital Wallets', popular: true },
  { value: 'nayapay', label: 'NayaPay (Visa EMI)', group: 'wallets', groupLabel: 'Pakistani Digital Wallets', popular: true },
  { value: 'upaisa', label: 'UPaisa (U Microfinance Bank)', group: 'wallets', groupLabel: 'Pakistani Digital Wallets' },
  { value: 'ubl_omni', label: 'UBL Omni Mobile Account', group: 'wallets', groupLabel: 'Pakistani Digital Wallets' },
  { value: 'hbl_konnect', label: 'HBL Konnect Mobile Wallet', group: 'wallets', groupLabel: 'Pakistani Digital Wallets' },
  { value: 'keenu', label: 'Keenu Wallet', group: 'wallets', groupLabel: 'Pakistani Digital Wallets' },
  { value: 'simpaisa', label: 'SimPaisa Payment Wallet', group: 'wallets', groupLabel: 'Pakistani Digital Wallets' },
  { value: 'finja', label: 'Finja Business Wallet', group: 'wallets', groupLabel: 'Pakistani Digital Wallets' },
  { value: 'jazz_cash_business', label: 'JazzCash Merchant Account', group: 'wallets', groupLabel: 'Pakistani Digital Wallets' },

  // --- 2. Pakistani Banks (Domestic & Islamic) ---
  { value: 'meezan', label: 'Meezan Bank Limited', group: 'banks', groupLabel: 'Pakistani Banks', popular: true },
  { value: 'ubl', label: 'United Bank Limited (UBL)', group: 'banks', groupLabel: 'Pakistani Banks', popular: true },
  { value: 'bank', label: 'Generic Bank Transfer (IBAN / Account)', group: 'banks', groupLabel: 'Pakistani Banks', popular: true },
  { value: 'hbl', label: 'Habib Bank Limited (HBL)', group: 'banks', groupLabel: 'Pakistani Banks' },
  { value: 'mcb', label: 'MCB Bank Limited', group: 'banks', groupLabel: 'Pakistani Banks' },
  { value: 'abl', label: 'Allied Bank Limited (ABL)', group: 'banks', groupLabel: 'Pakistani Banks' },
  { value: 'bank_alfalah', label: 'Bank Alfalah Limited', group: 'banks', groupLabel: 'Pakistani Banks' },
  { value: 'bank_al_habib', label: 'Bank AL Habib Limited', group: 'banks', groupLabel: 'Pakistani Banks' },
  { value: 'faysal_bank', label: 'Faysal Bank Limited', group: 'banks', groupLabel: 'Pakistani Banks' },
  { value: 'askari_bank', label: 'Askari Bank Limited', group: 'banks', groupLabel: 'Pakistani Banks' },
  { value: 'bankislami', label: 'BankIslami Pakistan Limited', group: 'banks', groupLabel: 'Pakistani Banks' },
  { value: 'dubai_islamic', label: 'Dubai Islamic Bank Pakistan', group: 'banks', groupLabel: 'Pakistani Banks' },
  { value: 'al_baraka', label: 'Al Baraka Bank Pakistan', group: 'banks', groupLabel: 'Pakistani Banks' },
  { value: 'paypak', label: 'PayPak Local Debit Scheme', group: 'banks', groupLabel: 'Pakistani Banks' },
  { value: 'card', label: 'Credit / Debit Card (Visa / Mastercard)', group: 'banks', groupLabel: 'Pakistani Banks' },

  // --- 3. International Payment Platforms ---
  { value: 'paypal', label: 'PayPal Account', group: 'international', groupLabel: 'International Payment Platforms', popular: true },
  { value: 'payoneer', label: 'Payoneer Freelancer Account', group: 'international', groupLabel: 'International Payment Platforms', popular: true },
  { value: 'wise', label: 'Wise (formerly TransferWise)', group: 'international', groupLabel: 'International Payment Platforms', popular: true },
  { value: 'nsave', label: 'nsave (USD ACH Account)', group: 'international', groupLabel: 'International Payment Platforms', popular: true },
  { value: 'skrill', label: 'Skrill Digital Wallet', group: 'international', groupLabel: 'International Payment Platforms' },
  { value: 'revolut', label: 'Revolut Multi-Currency Account', group: 'international', groupLabel: 'International Payment Platforms' },
  { value: 'redotpay', label: 'RedotPay (Stablecoin Virtual Card)', group: 'international', groupLabel: 'International Payment Platforms' },

  // --- 4. Crypto & Digital Assets ---
  { value: 'crypto_exchange', label: 'Binance Pay / Crypto Exchange Wallet', group: 'crypto', groupLabel: 'Crypto & Digital Assets' },
  { value: 'other', label: 'Other Custom Payment Provider', group: 'crypto', groupLabel: 'Crypto & Digital Assets' },
];

export const PAYMENT_PROVIDER_GROUPS = [
  { group: 'wallets', title: 'Pakistani Mobile Wallets & EMIs', icon: 'Smartphone' },
  { group: 'banks', title: 'Pakistani Scheduled Banks', icon: 'Building2' },
  { group: 'international', title: 'International Cross-Border Platforms', icon: 'Globe' },
  { group: 'crypto', title: 'Crypto & Custom Payment Channels', icon: 'Coins' },
];
