# 🛡️ ShareApp — Secure Vault & Payment Credentials Hub
> **Comprehensive Application Documentation, Schema Directory & Category Field Specification**

---

## 📌 Executive Summary & Application Overview

**ShareApp** is a modern, high-security digital password manager, credential vault, and payment account quick-sharing application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **MongoDB (Mongoose)**.

### 🎯 Application Purpose & Capabilities
- **Encrypted Vault Storage**: Safely stores sensitive credentials, financial details, identity documents, academic records, and custom digital assets using industry-standard **AES-256-GCM** encryption.
- **Payment Hub & Quick-Share**: Stores payment accounts (JazzCash, EasyPaisa, Meezan, SadaPay, IBANs, Credit Cards) for 1-click copying and instant WhatsApp quick-sharing.
- **Dynamic Field Extensibility**: Supports custom key-value pairs and document/scan file attachments (up to 5MB) across **all** vault categories.
- **Multi-Layered Security**:
  - 🔑 **AES-256-GCM Symmetric Encryption** at rest for secrets, notes, card numbers, and files.
  - 🔐 **TOTP 2FA Authentication** with QR code pairing & 8-digit recovery keys.
  - ⏱️ **Auto-Lock Overlay** triggered by user inactivity or tab switching.
  - 🛡️ **IP Rate Limiting & Geo-Security** (Lockout after 5 failed attempts with country/city detection).
  - 📜 **Audit Logging** tracking 9 distinct security actions.
  - 📦 **Encrypted JSON Backups** (Export & Import with password protection).

---

## 📊 Quick Category & Schema Summary

| Realm | Category / Provider Type | Identifier (`enum`) | Icon | Specific Fields Count | Base + Universal Fields Count | Total Fields Available |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Vault** | 1. Banking & Finance | `banking` | 🏦 | 5 | 8 | **13** |
| **Vault** | 2. Email Accounts | `email` | ✉️ | 2 | 8 | **10** |
| **Vault** | 3. Social Media | `social` | 🌐 | 2 | 8 | **10** |
| **Vault** | 4. Government & NADRA | `government` | 🏛️ | 5 | 8 | **13** |
| **Vault** | 5. Education & Academic | `education` | 🎓 | 4 | 8 | **12** |
| **Vault** | 6. Custom & User-Defined | `custom` | ⚙️ | 1 | 8 | **9** |
| **Payment** | Quick-Share Payment Provider | `payment` (9 options) | 💳 | 5 | 1 | **6** |

---

## 🌐 Global Universal Vault Fields (Inherited by ALL 6 Vault Categories)

Every single Vault entry across all 6 categories inherits the following **8 Core & Universal Fields**:

| # | Field Label | Technical Key | Status | Data Type | Encryption | Description & Example |
| :-: | :--- | :--- | :---: | :--- | :---: | :--- |
| 1 | **Record Title / Name** | `title` | 🔴 **Mandatory** | `String` (1-100 chars) | Plaintext | Primary name for search & identification (e.g. `"Meezan Main Account"`) |
| 2 | **Target Category** | `category` | 🔴 **Mandatory** | `Enum` (6 values) | Plaintext | Category identifier: `banking`, `email`, `social`, `government`, `education`, `custom` |
| 3 | **Username / Email / ID** | `usernameOrEmail` | 🟡 **Optional** | `String` | Plaintext | Primary login username, email, CNIC, or roll number. Fallbacks to title if left blank. |
| 4 | **Password / Secret PIN** | `password` | 🟡 **Optional** | `String` | 🔒 **AES-256-GCM** | Secret password, PIN, or passphrase. Generated via Quick Pass or Password Generator. |
| 5 | **Website / Login URL** | `url` | 🟡 **Optional** | `String` | Plaintext | Direct portal link (e.g. `https://netbanking.meezanbank.com`) |
| 6 | **Encrypted Notes** | `notes` | 🟡 **Optional** | `String` | 🔒 **AES-256-GCM** | Confidential notes, security questions, recovery phrases. |
| 7 | **Organization Tags** | `tags` | 🟡 **Optional** | `Array<String>` | Plaintext | Tag list for rapid filtering (e.g. `["#primary", "#active", "#salary"]`) |
| 8 | **Dynamic Custom Fields** | `customFields` | 🟡 **Optional** | `Array<Key-Value>` | 🔒 **AES-256-GCM** | Unlimited user-defined custom key-value pairs (e.g. Key: `"PUK Code"`, Value: `"881297"`) |
| 9 | **Attached Documents** | `files` | 🟡 **Optional** | `Array<FileData>` | 🔒 **AES-256-GCM** | Uploaded scans/docs (PDF, PNG, JPG, DOCX up to 5MB as Base64 Data URL) |

---

## 📑 Detailed Specification: All 6 Vault Categories

---

### 1. Banking & Finance Category (`banking`) 🏦

Designed for storing bank accounts, credit/debit cards, IBAN numbers, SWIFT codes, and ATM PINs securely.

- **Total Category-Specific Fields**: 5
- **Total Universal & Base Fields**: 8
- **Total Combined Fields**: **13 Fields**
- **Mandatory Fields Count**: 1 (`title` / Account Title)
- **Optional Fields Count**: 12

#### Detailed Field Table for Banking:

| Field Name | Technical Key | Status | Data Type | Encryption | Default | Example Value | Description |
| :--- | :--- | :---: | :--- | :---: | :--- | :--- | :--- |
| **Account Title / Name** | `title` | 🔴 **Mandatory** | `String` | Plaintext | None | `"Anza Muneeb Khan - Savings"` | Main identification title for the account |
| **Bank / Provider Name** | `bankName` | 🟡 **Optional** | `String` | 🔒 Metadata | `""` | `"Meezan Bank Limited"` | Financial institution or bank brand |
| **Account Number / IBAN** | `accountNumberIban` | 🟡 **Optional** | `String` | 🔒 Metadata | `""` | `"PK36MEZN0001090801234567"` | Account number or 24-character IBAN |
| **SWIFT / BIC Code** | `swiftCode` | 🟡 **Optional** | `String` | 🔒 Metadata | `""` | `"MEZNPKKA"` | International wire transfer BIC/SWIFT code |
| **ATM / Card Secret PIN** | `atmPin` | 🟡 **Optional** | `String` | 🔒 Metadata | `""` | `"8912"` | 4-digit or 6-digit ATM / Debit card secret PIN |
| **Branch Name / City** | `branchCity` | 🟡 **Optional** | `String` | 🔒 Metadata | `""` | `"I.I. Chundrigar Branch, Karachi"` | Home branch name or city location |
| **Username / User ID** | `usernameOrEmail` | 🟡 **Optional** | `String` | Plaintext | `""` | `"anza_muneeb"` | Internet banking portal login ID |
| **Login Password** | `password` | 🟡 **Optional** | `String` | 🔒 AES-GCM | `""` | `"P@ssw0rd#2026!"` | Internet banking login password |
| **Portal Website URL** | `url` | 🟡 **Optional** | `String` | Plaintext | `""` | `"https://ebanking.meezanbank.com"` | Direct internet banking login link |
| **Confidential Notes** | `notes` | 🟡 **Optional** | `String` | 🔒 AES-GCM | `""` | `"Branch Code: 0109, Manager Phone: ..."` | Security answers or branch contact info |
| **Account Tags** | `tags` | 🟡 **Optional** | `Array<String>` | Plaintext | `[]` | `["#salary", "#primary"]` | Tags for quick searching |
| **Custom Key-Values** | `customFields` | 🟡 **Optional** | `Array` | 🔒 Metadata | `[]` | `[{ key: "Branch Code", value: "0109" }]` | Extra custom fields |
| **Attached Scans** | `files` | 🟡 **Optional** | `Array` | 🔒 Metadata | `[]` | `[ChequeBookScan.pdf]` | Attached cheque book scan or bank statement |

---

### 2. Email Accounts Category (`email`) ✉️

Designed for managing personal, work, and custom domain email accounts.

- **Total Category-Specific Fields**: 2
- **Total Universal & Base Fields**: 8
- **Total Combined Fields**: **10 Fields**
- **Mandatory Fields Count**: 1 (`title` / Account Label)
- **Optional Fields Count**: 9

#### Detailed Field Table for Email:

| Field Name | Technical Key | Status | Data Type | Encryption | Default | Example Value | Description |
| :--- | :--- | :---: | :--- | :---: | :--- | :--- | :--- |
| **Account Label / Title** | `title` | 🔴 **Mandatory** | `String` | Plaintext | None | `"Primary Personal Gmail"` | Label to identify this email account |
| **Email Provider** | `emailProvider` | 🟡 **Optional** | `Enum` | 🔒 Metadata | `"Gmail"` | `"Gmail"`, `"Outlook"`, `"Proton"`, `"Yahoo"`, `"iCloud"`, `"Custom"` | Email provider service name |
| **Email Address** | `usernameOrEmail` | 🟡 **Optional** | `String` | Plaintext | `""` | `"anza@gmail.com"` | Full email address used to log in |
| **Recovery Email / Phone** | `recoveryEmail` | 🟡 **Optional** | `String` | 🔒 Metadata | `""` | `"backup@outlook.com"` or `"+923001234567"` | Backup email or phone number for recovery |
| **Email Password** | `password` | 🟡 **Optional** | `String` | 🔒 AES-GCM | `""` | `"s3cur3Emai!Pass"` | Mail account password or app password |
| **Webmail URL** | `url` | 🟡 **Optional** | `String` | Plaintext | `""` | `"https://mail.google.com"` | Direct link to webmail interface |
| **Recovery Notes / 2FA** | `notes` | 🟡 **Optional** | `String` | 🔒 AES-GCM | `""` | `"Backup codes: 1829-3910, 8821-4412"` | 2FA emergency codes or security questions |
| **Account Tags** | `tags` | 🟡 **Optional** | `Array<String>` | Plaintext | `[]` | `["#personal", "#primary"]` | Custom tags for sorting |
| **Custom Key-Values** | `customFields` | 🟡 **Optional** | `Array` | 🔒 Metadata | `[]` | `[{ key: "IMAP Server", value: "imap.gmail.com" }]` | Custom mail server config fields |
| **Attached Backups** | `files` | 🟡 **Optional** | `Array` | 🔒 Metadata | `[]` | `[BackupKey.txt]` | Attached security certificate or key |

---

### 3. Social Media Category (`social`) 🌐

Designed for Instagram, Facebook, LinkedIn, X (Twitter), YouTube, TikTok, and WhatsApp Business accounts.

- **Total Category-Specific Fields**: 2
- **Total Universal & Base Fields**: 8
- **Total Combined Fields**: **10 Fields**
- **Mandatory Fields Count**: 1 (`title` / Profile Title)
- **Optional Fields Count**: 9

#### Detailed Field Table for Social Media:

| Field Name | Technical Key | Status | Data Type | Encryption | Default | Example Value | Description |
| :--- | :--- | :---: | :--- | :---: | :--- | :--- | :--- |
| **Profile Name / Title** | `title` | 🔴 **Mandatory** | `String` | Plaintext | None | `"Official Instagram Account"` | Name of the social media account |
| **Social Platform** | `socialPlatform` | 🟡 **Optional** | `Enum` | 🔒 Metadata | `"Instagram"` | `"Instagram"`, `"Facebook"`, `"LinkedIn"`, `"X / Twitter"`, `"YouTube"`, `"WhatsApp"`, `"TikTok"`, `"Custom"` | Platform name |
| **Username / Handle** | `socialHandle` | 🟡 **Optional** | `String` | 🔒 Metadata | `""` | `"@anza_official"` | Public social handle |
| **Linked Login Email/Phone** | `usernameOrEmail` | 🟡 **Optional** | `String` | Plaintext | `""` | `"anza@example.com"` | Email/Phone used to sign in |
| **Account Password** | `password` | 🟡 **Optional** | `String` | 🔒 AES-GCM | `""` | `"Soc!al#MediaPass2026"` | Social profile login password |
| **Profile URL** | `url` | 🟡 **Optional** | `String` | Plaintext | `""` | `"https://instagram.com/anza_official"` | Link to the profile page |
| **2FA & Backup Notes** | `notes` | 🟡 **Optional** | `String` | 🔒 AES-GCM | `""` | `"2FA Backup Code: 9901-2218"` | Two-factor authentication backup codes |
| **Tags** | `tags` | 🟡 **Optional** | `Array<String>` | Plaintext | `[]` | `["#social", "#creator"]` | Tags for quick lookup |
| **Custom Key-Values** | `customFields` | 🟡 **Optional** | `Array` | 🔒 Metadata | `[]` | `[{ key: "Meta Business ID", value: "9012384" }]` | Business page IDs or API keys |
| **Attached Files** | `files` | 🟡 **Optional** | `Array` | 🔒 Metadata | `[]` | `[BrandLogo.png]` | Profile graphics or verification docs |

---

### 4. Government & NADRA Category (`government`) 🏛️

Designed for national identity cards (CNIC), Passports, Driving Licenses, FBR NTN tax records, and vehicle registrations.

- **Total Category-Specific Fields**: 5
- **Total Universal & Base Fields**: 8
- **Total Combined Fields**: **13 Fields**
- **Mandatory Fields Count**: 1 (`title` / Document Title)
- **Optional Fields Count**: 12

#### Detailed Field Table for Government & NADRA:

| Field Name | Technical Key | Status | Data Type | Encryption | Default | Example Value | Description |
| :--- | :--- | :---: | :--- | :---: | :--- | :--- | :--- |
| **Document Title** | `title` | 🔴 **Mandatory** | `String` | Plaintext | None | `"NADRA Smart National ID Card"` | Identifier title for the official document |
| **Document Type** | `docType` | 🟡 **Optional** | `Enum` | 🔒 Metadata | `"CNIC / National ID"` | `"CNIC / National ID"`, `"Driving License"`, `"Passport"`, `"FBR Tax NTN"`, `"Vehicle Reg"`, `"Other ID"` | Category of government identity |
| **National ID / CNIC No** | `cnicNumber` | 🟡 **Optional** | `String` | 🔒 Metadata | `""` | `"42101-1234567-9"` | 13-digit CNIC number, Passport #, or License # |
| **Full Name on Document** | `fullNameOnDoc` | 🟡 **Optional** | `String` | 🔒 Metadata | `""` | `"Anza Muneeb Khan"` | Exact legal name as printed on the document |
| **Expiry Date / Status** | `expiryDate` | 🟡 **Optional** | `Date String` | 🔒 Metadata | `""` | `"2030-12-31"` | Document expiration date (HTML5 Datepicker) |
| **Application / Ref No** | `referenceNo` | 🟡 **Optional** | `String` | 🔒 Metadata | `""` | `"Ref No: 9918273"` | NADRA track ID, passport booklet #, or NTN # |
| **Username / Login ID** | `usernameOrEmail` | 🟡 **Optional** | `String` | Plaintext | `""` | `"4210112345679"` | Online portal login username (e.g. Pak-Identity) |
| **Portal Password** | `password` | 🟡 **Optional** | `String` | 🔒 AES-GCM | `""` | `"GovPortal#Pass2026"` | Pak-Identity or FBR IRIS portal password |
| **Official Portal URL** | `url` | 🟡 **Optional** | `String` | Plaintext | `""` | `"https://id.nadra.gov.pk"` | Link to government online service portal |
| **Encrypted Notes** | `notes` | 🟡 **Optional** | `String` | 🔒 AES-GCM | `""` | `"Family Tree No: 481, Issue Date: 2020-01-01"` | Secret family numbers or issue dates |
| **Tags** | `tags` | 🟡 **Optional** | `Array<String>` | Plaintext | `[]` | `["#nadra", "#identity"]` | Search tags |
| **Custom Key-Values** | `customFields` | 🟡 **Optional** | `Array` | 🔒 Metadata | `[]` | `[{ key: "Blood Group", value: "B+" }]` | Extra ID attributes |
| **Attached Document Scans**| `files` | 🟡 **Optional** | `Array` | 🔒 Metadata | `[]` | `[CNIC_Front_Back.pdf]` | HD scan of front/back CNIC or Passport |

---

### 5. Education & Academic Category (`education`) 🎓

Designed for degrees, university enrollment credentials, student portals, roll numbers, transcripts, and certificates.

- **Total Category-Specific Fields**: 4
- **Total Universal & Base Fields**: 8
- **Total Combined Fields**: **12 Fields**
- **Mandatory Fields Count**: 1 (`title` / Degree Title)
- **Optional Fields Count**: 11

#### Detailed Field Table for Education & Academic:

| Field Name | Technical Key | Status | Data Type | Encryption | Default | Example Value | Description |
| :--- | :--- | :---: | :--- | :---: | :--- | :--- | :--- |
| **Degree / Record Title** | `title` | 🔴 **Mandatory** | `String` | Plaintext | None | `"BS Computer Science Degree"` | Title of the academic record or degree |
| **University / Institution** | `institutionName` | 🟡 **Optional** | `String` | 🔒 Metadata | `""` | `"FAST NUCES / Karachi University"` | Name of school, college, or university |
| **Student Roll / Reg No** | `studentRollNo` | 🟡 **Optional** | `String` | 🔒 Metadata | `""` | `"20K-1192"` | Student ID, roll number, or registration code |
| **Graduation Year / CGPA** | `gradYearCgpa` | 🟡 **Optional** | `String` | 🔒 Metadata | `""` | `"Graduated 2024 \| CGPA: 3.8"` | Graduation details, grade, or GPA |
| **Portal Username / Email** | `usernameOrEmail` | 🟡 **Optional** | `String` | Plaintext | `""` | `"k201192@nu.edu.pk"` | Student portal login ID or university email |
| **Portal Password** | `password` | 🟡 **Optional** | `String` | 🔒 AES-GCM | `""` | `"StudentPortal#2026"` | Slate / LMS / Student portal password |
| **Portal Website URL** | `url` | 🟡 **Optional** | `String` | Plaintext | `""` | `"https://slate.nu.edu.pk"` | Link to LMS or student portal |
| **Academic Notes** | `notes` | 🟡 **Optional** | `String` | 🔒 AES-GCM | `""` | `"Degree Serial No: 881923"` | Degree serial number or transcript verification code |
| **Tags** | `tags` | 🟡 **Optional** | `Array<String>` | Plaintext | `[]` | `["#degree", "#university"]` | Sorting tags |
| **Custom Key-Values** | `customFields` | 🟡 **Optional** | `Array` | 🔒 Metadata | `[]` | `[{ key: "Major", value: "Software Engineering" }]` | Major, minor, or advisor name |
| **Attached Transcripts** | `files` | 🟡 **Optional** | `Array` | 🔒 Metadata | `[]` | `[Degree_Transcript.pdf]` | Digital copy of degree certificate or transcript |

---

### 6. Custom & User-Defined Category (`custom`) ⚙️

Designed for any custom credentials such as cryptocurrency wallet seeds, WiFi passwords, medical insurance, SIM card PINs/PUKs, and license keys.

- **Total Category-Specific Fields**: 1
- **Total Universal & Base Fields**: 8
- **Total Combined Fields**: **9 Fields**
- **Mandatory Fields Count**: 1 (`title` / Record Title)
- **Optional Fields Count**: 8

#### Detailed Field Table for Custom Category:

| Field Name | Technical Key | Status | Data Type | Encryption | Default | Example Value | Description |
| :--- | :--- | :---: | :--- | :---: | :--- | :--- | :--- |
| **Record Title** | `title` | 🔴 **Mandatory** | `String` | Plaintext | None | `"Crypto Wallet Seed Phrase"` | Name of the custom asset |
| **Custom Category Label** | `customCategoryName` | 🟡 **Optional** | `String` | 🔒 Metadata | `""` | `"Crypto"`, `"Medical"`, `"SIM Card"` | Custom sub-category tag |
| **Username / Account ID** | `usernameOrEmail` | 🟡 **Optional** | `String` | Plaintext | `""` | `"wallet_owner_01"` | Identifier or key name |
| **Secret Key / Password** | `password` | 🟡 **Optional** | `String` | 🔒 AES-GCM | `""` | `"12-word seed phrase string"` | Secret key, passkey, or PIN |
| **Reference Website URL** | `url` | 🟡 **Optional** | `String` | Plaintext | `""` | `"https://etherscan.io"` | External site link |
| **Encrypted Notes** | `notes` | 🟡 **Optional** | `String` | 🔒 AES-GCM | `""` | `"SIM PUK 1: 99182391, PUK 2: 12893812"` | Secret recovery details |
| **Tags** | `tags` | 🟡 **Optional** | `Array<String>` | Plaintext | `[]` | `["#crypto", "#seed"]` | Search tags |
| **Custom Key-Values** | `customFields` | 🟡 **Optional** | `Array` | 🔒 Metadata | `[]` | `[{ key: "Wallet Address", value: "0x71C...3b" }]` | Unlimited key-value pairs |
| **Attached Scans / Files** | `files` | 🟡 **Optional** | `Array` | 🔒 Metadata | `[]` | `[InsurancePolicy.pdf]` | Attached policy scan or keyfile |

---

## 💳 Payment Hub & Quick-Share Categories (`/payment`)

Managed independently under the Payment Hub module for **1-Click Copying** and **Instant WhatsApp Quick-Share**.

### Supported Payment Providers (9 Categories):
1. `jazzcash` — JazzCash Mobile Wallet
2. `easypaisa` — EasyPaisa Mobile Wallet
3. `bank` — Generic Bank Account / IBAN Transfer
4. `meezan` — Meezan Bank Limited
5. `ubl` — United Bank Limited
6. `sadapay` — SadaPay Digital Account
7. `nayapay` — NayaPay Digital Account
8. `card` — Credit / Debit Card Account
9. `other` — Other Custom Payment Provider

### Payment Account Fields Specification:

| Field Name | Technical Key | Status | Data Type | Encryption | Default | Example Value | Description |
| :--- | :--- | :---: | :--- | :---: | :--- | :--- | :--- |
| **Payment Provider** | `provider` | 🔴 **Mandatory** | `Enum` (9 values) | Plaintext | `"jazzcash"` | `"meezan"`, `"jazzcash"`, `"easypaisa"` | Provider brand selection |
| **Account Title** | `accountTitle` | 🔴 **Mandatory** | `String` (1-100) | Plaintext | None | `"Anza Muneeb Khan"` | Exact account holder title |
| **Account Number / IBAN** | `accountNumber` | 🔴 **Mandatory** | `String` | 🔒 **AES-256-GCM** | None | `"03001234567"` or `"PK36MEZN000109..."` | Mobile wallet number, account #, IBAN, or card # |
| **Bank Name** | `bankName` | 🟡 **Optional** | `String` | Plaintext | `""` | `"Meezan Bank Limited"` | Specific branch or financial institution name |
| **Notes / Remarks** | `notes` | 🟡 **Optional** | `String` | 🔒 **AES-256-GCM** | `""` | `"Primary salary account for client transfers"` | Extra instructions for quick sharing |
| **Pin to Favorites** | `isPinned` | 🟡 **Optional** | `Boolean` | Plaintext | `false` | `true` | Pins card to top Quick-Share bar |

---

## 🔒 Security & Data Encryption Architecture

| Data Type | Storage Method | Encryption Key | Decryption Location |
| :--- | :--- | :--- | :--- |
| **Passwords & Secret PINs** | Encrypted String in DB (`passwordEncrypted`) | `ENCRYPTION_KEY` env (AES-256-GCM) | Decrypted server-side on API response |
| **Notes & Recovery Info** | Encrypted String in DB (`notesEncrypted`) | `ENCRYPTION_KEY` env (AES-256-GCM) | Decrypted server-side on API response |
| **Category Custom Metadata** | Encrypted Base64 JSON (`metadataEncrypted`) | `ENCRYPTION_KEY` env (AES-256-GCM) | Decrypted server-side on API response |
| **Payment Account Numbers** | Encrypted String in DB (`accountNumberEncrypted`)| `ENCRYPTION_KEY` env (AES-256-GCM) | Decrypted server-side on API response |
| **Session State & Auth** | HTTP-Only Encrypted Cookie (`auth_token`) | `JWT_SECRET` env | Verified on middleware / API routes |
| **2FA Secret Keys** | Encrypted TOTP Key | `TOTP_SECRET` | Verified via OTP generator (Authenticator App) |

---

## 🛠️ Instructions for Developers: How to Maintain & Extend Categories

If you want to add a **New Vault Category** or **Add New Fields** to existing categories in the future, follow these 4 steps:

### 1. Update Schema & Types
- Open [`models/VaultEntry.ts`](file:///c:/Users/anzamuneebkhan/Desktop/chat_bot/shareapp/models/VaultEntry.ts) and add your new category string to `VaultCategory`:
  ```ts
  export type VaultCategory = 'banking' | 'email' | 'social' | 'government' | 'education' | 'custom' | 'your_new_category';
  ```
- Update Zod Validation schema in [`lib/validations.ts`](file:///c:/Users/anzamuneebkhan/Desktop/chat_bot/shareapp/lib/validations.ts).

### 2. Update Form Interface & State
- Open [`components/VaultFormModal.tsx`](file:///c:/Users/anzamuneebkhan/Desktop/chat_bot/shareapp/components/VaultFormModal.tsx):
  - Add your category to `CATEGORIES` array with a Lucide Icon.
  - Add new field keys to `FormValues` interface and `defaultValues`.
  - Add your custom form section JSX inside the modal.
  - Pack new fields into `metaPayload` in `onSubmitForm`.

### 3. Update Display & Search Cards
- Open [`app/vault/page.tsx`](file:///c:/Users/anzamuneebkhan/Desktop/chat_bot/shareapp/app/vault/page.tsx) to update category tab filters and card detail popups.

### 4. Keep Documentation Updated
- Update the field tables in this [`README.md`](file:///c:/Users/anzamuneebkhan/Desktop/chat_bot/shareapp/README.md) file so team members and user guides remain 100% synchronized!

---

## 🚀 Getting Started & Local Development

### Prerequisites
- Node.js >= 18.x
- MongoDB (Local instance or MongoDB Atlas URI)

### Environment Setup (`.env.local`)
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/shareapp
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
ENCRYPTION_KEY=32_byte_hex_encryption_key_here
ADMIN_PASSWORD=your_master_password
```

### Installation & Run Commands
```bash
# Install dependencies
npm install

# Run development server (with 120 FPS UI & live reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License & Confidentiality
This software and documentation are proprietary and confidential. All rights reserved.
