export interface BankOption {
  id: string;
  name: string;
  category: 'public' | 'private' | 'islamic' | 'foreign' | 'digital' | 'microfinance' | 'emi';
  categoryLabel: string;
  code?: string;
}

export const PAKISTANI_BANKS: BankOption[] = [
  // --- Public Sector Commercial Banks ---
  { id: 'nbp', name: 'National Bank of Pakistan (NBP)', category: 'public', categoryLabel: 'Public Sector Banks', code: 'NBP' },
  { id: 'bop', name: 'Bank of Punjab (BOP)', category: 'public', categoryLabel: 'Public Sector Banks', code: 'BOP' },
  { id: 'bok', name: 'Bank of Khyber (BOK)', category: 'public', categoryLabel: 'Public Sector Banks', code: 'BOK' },
  { id: 'sindh_bank', name: 'Sindh Bank Limited', category: 'public', categoryLabel: 'Public Sector Banks', code: 'SND' },
  { id: 'fwbl', name: 'First Women Bank Limited (FWBL)', category: 'public', categoryLabel: 'Public Sector Banks', code: 'FWB' },

  // --- Domestic Private Commercial Banks ---
  { id: 'hbl', name: 'Habib Bank Limited (HBL)', category: 'private', categoryLabel: 'Private Commercial Banks', code: 'HBL' },
  { id: 'mcb', name: 'MCB Bank Limited', category: 'private', categoryLabel: 'Private Commercial Banks', code: 'MCB' },
  { id: 'ubl', name: 'United Bank Limited (UBL)', category: 'private', categoryLabel: 'Private Commercial Banks', code: 'UBL' },
  { id: 'abl', name: 'Allied Bank Limited (ABL)', category: 'private', categoryLabel: 'Private Commercial Banks', code: 'ABL' },
  { id: 'bank_alfalah', name: 'Bank Alfalah Limited', category: 'private', categoryLabel: 'Private Commercial Banks', code: 'BAFL' },
  { id: 'bank_al_habib', name: 'Bank AL Habib Limited', category: 'private', categoryLabel: 'Private Commercial Banks', code: 'BAHL' },
  { id: 'askari_bank', name: 'Askari Bank Limited', category: 'private', categoryLabel: 'Private Commercial Banks', code: 'AKBL' },
  { id: 'faysal_bank', name: 'Faysal Bank Limited', category: 'private', categoryLabel: 'Private Commercial Banks', code: 'FABL' },
  { id: 'habib_metro', name: 'Habib Metropolitan Bank Limited', category: 'private', categoryLabel: 'Private Commercial Banks', code: 'HMB' },
  { id: 'js_bank', name: 'JS Bank Limited', category: 'private', categoryLabel: 'Private Commercial Banks', code: 'JSBL' },
  { id: 'soneri_bank', name: 'Soneri Bank Limited', category: 'private', categoryLabel: 'Private Commercial Banks', code: 'SNBL' },
  { id: 'samba_bank', name: 'Samba Bank Limited', category: 'private', categoryLabel: 'Private Commercial Banks', code: 'SAMBA' },
  { id: 'silk_bank', name: 'Silk Bank Limited', category: 'private', categoryLabel: 'Private Commercial Banks', code: 'SILK' },
  { id: 'bank_makramah', name: 'Bank Makramah Limited (BML / Summit Bank)', category: 'private', categoryLabel: 'Private Commercial Banks', code: 'BML' },

  // --- Islamic Banks (Full-fledged & Islamic Subsidiaries) ---
  { id: 'meezan', name: 'Meezan Bank Limited', category: 'islamic', categoryLabel: 'Islamic Banks', code: 'MEZN' },
  { id: 'bankislami', name: 'BankIslami Pakistan Limited', category: 'islamic', categoryLabel: 'Islamic Banks', code: 'BIPL' },
  { id: 'dubai_islamic', name: 'Dubai Islamic Bank Pakistan (DIBPL)', category: 'islamic', categoryLabel: 'Islamic Banks', code: 'DIB' },
  { id: 'al_baraka', name: 'Al Baraka Bank (Pakistan) Limited', category: 'islamic', categoryLabel: 'Islamic Banks', code: 'ABPL' },
  { id: 'mcb_islamic', name: 'MCB Islamic Bank Limited', category: 'islamic', categoryLabel: 'Islamic Banks', code: 'MIB' },

  // --- Foreign Scheduled Banks ---
  { id: 'scb', name: 'Standard Chartered Bank (Pakistan) Limited', category: 'foreign', categoryLabel: 'Foreign Banks', code: 'SCB' },
  { id: 'citibank', name: 'Citibank N.A. Pakistan', category: 'foreign', categoryLabel: 'Foreign Banks', code: 'CITI' },
  { id: 'icbc', name: 'Industrial and Commercial Bank of China (ICBC)', category: 'foreign', categoryLabel: 'Foreign Banks', code: 'ICBC' },
  { id: 'bank_of_china', name: 'Bank of China Limited', category: 'foreign', categoryLabel: 'Foreign Banks', code: 'BOC' },
  { id: 'deutsche_bank', name: 'Deutsche Bank AG Pakistan', category: 'foreign', categoryLabel: 'Foreign Banks', code: 'DB' },

  // --- SBP-Licensed Digital Banks & Microfinance ---
  { id: 'easypaisa_bank', name: 'Easypaisa Bank Limited (Telenor Microfinance Bank)', category: 'digital', categoryLabel: 'Digital & Microfinance Banks', code: 'TMFB' },
  { id: 'mobilink_mfb', name: 'Mobilink Microfinance Bank (JazzCash)', category: 'digital', categoryLabel: 'Digital & Microfinance Banks', code: 'MMFB' },
  { id: 'raqami_digital', name: 'Raqami Islamic Digital Bank Limited', category: 'digital', categoryLabel: 'Digital & Microfinance Banks', code: 'RAQAMI' },
  { id: 'mashreq_pk', name: 'Mashreq Bank Pakistan Limited', category: 'digital', categoryLabel: 'Digital & Microfinance Banks', code: 'MSHQ' },
  { id: 'khushhali_mfb', name: 'Khushhali Microfinance Bank Limited', category: 'microfinance', categoryLabel: 'Digital & Microfinance Banks', code: 'KMBL' },
  { id: 'fmfb', name: 'First Microfinance Bank Limited (HBL Microfinance)', category: 'microfinance', categoryLabel: 'Digital & Microfinance Banks', code: 'FMFB' },
  { id: 'nrsp_mfb', name: 'NRSP Microfinance Bank Limited', category: 'microfinance', categoryLabel: 'Digital & Microfinance Banks', code: 'NRSP' },
  { id: 'u_microfinance', name: 'U Microfinance Bank Limited (UPaisa)', category: 'microfinance', categoryLabel: 'Digital & Microfinance Banks', code: 'UMFB' },
  { id: 'finca_mfb', name: 'FINCA Microfinance Bank Limited', category: 'microfinance', categoryLabel: 'Digital & Microfinance Banks', code: 'FINCA' },

  // --- Electronic Money Institutions (EMIs) ---
  { id: 'nayapay', name: 'NayaPay (SBP Licensed EMI)', category: 'emi', categoryLabel: 'Electronic Money Institutions (EMIs)', code: 'NAYA' },
  { id: 'sadapay', name: 'SadaPay (SBP Licensed EMI)', category: 'emi', categoryLabel: 'Electronic Money Institutions (EMIs)', code: 'SADA' },
  { id: 'finja', name: 'Finja EMI', category: 'emi', categoryLabel: 'Electronic Money Institutions (EMIs)', code: 'FNJA' },
];

export const BANK_CATEGORIES = [
  { key: 'public', label: 'Public Sector Commercial Banks' },
  { key: 'private', label: 'Domestic Private Banks' },
  { key: 'islamic', label: 'Islamic Banking Institutions' },
  { key: 'foreign', label: 'Foreign Banks in Pakistan' },
  { key: 'digital', label: 'SBP Digital Banks' },
  { key: 'microfinance', label: 'Microfinance Banks' },
  { key: 'emi', label: 'Electronic Money Institutions (EMIs)' },
];
