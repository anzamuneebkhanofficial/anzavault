<div align="center">

# 🔐 AnzaVault (ShareApp)

**Bank-Grade AES-256 Encrypted Personal Credential Vault & Quick-Share Payment Hub**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Security](https://img.shields.io/badge/Encryption-AES--256--GCM-emerald?style=for-the-badge&logo=letsencrypt)](https://nodejs.org/api/crypto.html)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-red?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Executive Overview

**AnzaVault** (internally *ShareApp*) is a self-hosted, single-user, bank-grade personal credential manager and payment quick-share portal. Built with **Next.js 16 (Turbopack)**, **TypeScript**, and **MongoDB**, AnzaVault combines zero-trust field-level cryptography (**AES-256-GCM**) with an intuitive dark-mode interface.

It is specifically tailored for:
1. **Personal Credential Management**: Ultra-secure storage of Passwords, Credit/Debit Cards, US ACH Routing Numbers, UK Sort Codes, NADRA Government Identity Documents, Academic Degrees, and Social Media Accounts.
2. **Pakistani Banking & Financial Sector**: Built-in support for all **33 State Bank of Pakistan (SBP) Scheduled Banks**, Islamic Banking Institutions, Microfinance Banks, Digital Banks, and Electronic Money Institutions (EMIs like SadaPay and NayaPay).
3. **International Freelance & Payment Quick-Sharing**: Instant 1-click account copying, WhatsApp template sharing, and QR code generation for international platforms (**Wise, Payoneer, nsave, PayPal, RedotPay, Skrill, Binance**) and domestic mobile wallets (**JazzCash, EasyPaisa, Zindigi**).
4. **10-Year Longevity**: Engineered with zero bloat, Mongoose compound database indexing, lightweight payload splitting, and PWA standalone mobile installation capability.

---

## ✨ Key Features

### 🛡️ 1. Cryptographic Security & Zero-Trust Architecture
- **AES-256-GCM Field Encryption**: Sensitive data (passwords, card CVVs, bank account numbers, private notes) are encrypted at rest using 96-bit random IVs and 128-bit authentication tags.
- **Timing-Safe Password Verification**: Protection against side-channel timing attacks via `crypto.timingSafeEqual` and Argon2id/SHA-256 hashing.
- **Single Active Session Control**: Automatic single-device session enforcement — logging in elsewhere revokes previous tokens.
- **Dynamic 2FA TOTP Support**: Optional RFC 6238 2FA Authenticator App integration (Google Authenticator / Authy / 1Password) with single-use emergency recovery codes.
- **IP Brute-Force Lockout**: Automatic 5-strike IP lockout and real-time security audit logging.

### 🏦 2. Pakistani Banking & Payment Provider Hub
- **33 SBP Scheduled Banks**: First-class dropdown support for Public Sector (NBP), Domestic Private (HBL, MCB, Alfalah, ABL, UBL), Islamic Banks (Meezan, BankIslami, Dubai Islamic), Foreign Banks, and Microfinance Institutions.
- **EMIs & Mobile Wallets**: Full registry of EMIs (SadaPay, NayaPay, Finja) and digital wallets (JazzCash, EasyPaisa, Zindigi, UPaisa, HBL Konnect).
- **International Freelancer Accounts**: US ACH Routing Numbers, Account Numbers, UK Sort Codes, IBANs, and multi-currency support (PKR, USD, GBP, EUR, AED, SAR).
- **1-Click Share & QR Codes**: Instant formatted sharing via WhatsApp, Email, or scanned QR code.

### 📱 3. Standalone PWA Installation
- **Cross-Platform PWA**: Fully configured Web App Manifest (`manifest.json`) allowing 1-click installation as a native standalone app on **iOS Home Screen**, **Android**, **Windows**, and **macOS**.

### 📊 4. Vault Health & Backup Utilities
- **Security Health Meter**: Live password strength auditing detecting weak passwords (<12 chars) or duplicate passwords reused across entries.
- **Encrypted Backups**: Password-protected JSON file export and import for seamless offline data backups.

---

## 📂 Vault & Payment Category Directory

### Vault Categories (6 Total)

| Category | Primary Use Case | Key Fields | Encryption |
| :--- | :--- | :--- | :--- |
| 🏦 **Banking** | Bank Accounts, Credit/Debit Cards, Loans | SBP Bank Dropdown, Account Number, IBAN, US ACH Routing, UK Sort Code, 16-Digit Card Number, Expiry, CVV (🔒 toggle), Currency | **AES-256-GCM** |
| 📧 **Email** | Personal & Custom Domain Email | Provider (Gmail, Outlook, Yahoo, Proton, Zoho, Yandex, Custom), Email, Password, Recovery Email, 2FA Backup Codes | **AES-256-GCM** |
| 🌐 **Social** | Social Media & Developer Profiles | Platform (GitHub, LinkedIn, Twitter/X, Discord, Telegram, Instagram, YouTube, Snapchat, Threads), Username, Password, URL | **AES-256-GCM** |
| 🪪 **Government** | Identity & NADRA Documents | Document Type (CNIC, NICOP, Passport, Driving License, Domicile, PRC, Arms License, B-Form), Doc Number, Issue/Expiry Dates | **AES-256-GCM** |
| 🎓 **Education** | Academic Degrees & Certifications | Institution, Degree Title, Roll Number, Passing Year, Grade/CGPA, Certifying Body | **AES-256-GCM** |
| 🛠️ **Custom** | API Keys, Crypto Wallets & Custom Records | Title, Username, Password, URL, Blockchain Network, Exchange Name, Dynamic Key-Value Pairs | **AES-256-GCM** |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16.3](https://nextjs.org/) (App Router & Turbopack)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Components**: React 19, [Lucide React](https://lucide.dev/), [Sonner Toasts](https://sonner.emilkowal.ski/)
- **Styling**: Vanilla CSS & Tailwind CSS Dark Mode
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose 8](https://mongoosejs.com/)
- **Authentication**: Custom JWT (Access & Refresh Tokens), Jose, Argon2id, RFC 6238 TOTP
- **Cryptography**: Node.js `crypto` (AES-256-GCM, SHA-256, timingSafeEqual)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB server or MongoDB Atlas Cloud URI

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/anzamuneebkhanofficial/anzavault.git
cd anzavault
npm install
```

### 2. Configure Local Environment Variables
Create a `.env.local` file in the root directory by copying the `.env.example` file:

```env
# Mandatory Settings
APP_NAME="AnzaVault (Local)"
NODE_ENV="development"
OWNER_EMAIL="demo@example.com"
ADMIN_PASSWORD="your_secure_password"
ENCRYPTION_KEY="your_64_character_hex_encryption_key_here"
JWT_ACCESS_SECRET="your_jwt_access_secret_here"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_here"
MONGODB_URI="mongodb://localhost:27017/your-database"

# Optional Settings (Set TOTP_SECRET="" for 1-step local login)
TOTP_SECRET=""
COOKIE_SECURE="false"
COOKIE_SAME_SITE="lax"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Log in using `anza@example.com` / `anza123`.

---

## 🌐 Production Deployment Guide

When deploying to **Vercel**, **Railway**, **Render**, or a **VPS**, configure your environment variables using `.env.example` as a reference:

1. **Set `NODE_ENV`**: `"production"`
2. **Set `MONGODB_URI`**: Your MongoDB Atlas Connection String
3. **Set `OWNER_EMAIL` & `ADMIN_PASSWORD`**: Your personal login email & strong master password
4. **Generate Fresh Encryption Key**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
5. **Build & Start**:
   ```bash
   npm run build
   npm start
   ```

---

## 📄 License & Ownership

Developed for private personal use. All code, design architectures, and security implementations are maintained under the MIT License.

---

<div align="center">
  <sub>Built with ❤️ by Anza Muneeb Khan • Powered by Next.js & AES-256 Cryptography</sub>
</div>
