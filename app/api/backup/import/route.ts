import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { VaultEntry } from '@/models/VaultEntry';
import { PaymentAccount } from '@/models/PaymentAccount';
import { encrypt } from '@/lib/crypto';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { fileContent, fileType, passphrase = 'anza-vault-master', strategy = 'skip' } = body;

    if (!fileContent) {
      return NextResponse.json({ error: 'No file content provided for import.' }, { status: 400 });
    }

    let parsedData: { vaultEntries?: any[]; paymentAccounts?: any[] } = {
      vaultEntries: [],
      paymentAccounts: [],
    };

    // Process file types
    if (fileType === 'swiz' || (typeof fileContent === 'string' && fileContent.includes('ANZA_VAULT_SWIZ_V2'))) {
      const swizObj = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
      if (!swizObj.iv || !swizObj.authTag || !swizObj.payload) {
        return NextResponse.json({ error: 'Invalid or corrupted .swiz file structure.' }, { status: 400 });
      }

      try {
        const key = crypto.scryptSync(passphrase, 'anza-swiz-salt-v2', 32);
        const iv = Buffer.from(swizObj.iv, 'hex');
        const authTag = Buffer.from(swizObj.authTag, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(swizObj.payload, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        const fullPayload = JSON.parse(decrypted);
        parsedData = fullPayload.data || fullPayload;
      } catch (err) {
        return NextResponse.json(
          { error: 'Failed to decrypt .swiz file. Please verify passphrase.' },
          { status: 400 }
        );
      }
    } else if (fileType === 'json' || (typeof fileContent === 'string' && fileContent.trim().startsWith('{'))) {
      const jsonObj = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
      parsedData = jsonObj.data || jsonObj;
    } else if (fileType === 'csv' || (typeof fileContent === 'string' && fileContent.includes(','))) {
      // Parse CSV
      const lines = fileContent.split('\n').filter((l: string) => l.trim().length > 0);
      const headers = lines[0].split(',').map((h: string) => h.trim().replace(/^"|"$/g, ''));

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c: string) => c.trim().replace(/^"|"$/g, ''));
        const type = cols[0] || 'Vault Entry';
        if (type.toLowerCase().includes('payment')) {
          parsedData.paymentAccounts?.push({
            provider: cols[1] || 'other',
            accountTitle: cols[2] || 'Imported Account',
            accountNumber: cols[3] || '',
            bankName: cols[4] || '',
            notes: cols[7] || '',
          });
        } else {
          parsedData.vaultEntries?.push({
            category: cols[1] || 'custom',
            title: cols[2] || 'Imported Credential',
            usernameOrEmail: cols[3] || 'imported@user',
            password: cols[4] || '',
            url: cols[5] || '',
            tags: cols[6] ? cols[6].split(';') : [],
            notes: cols[7] || '',
          });
        }
      }
    }

    let insertedVaultCount = 0;
    let insertedPaymentCount = 0;

    // Save Vault Entries
    if (parsedData.vaultEntries && Array.isArray(parsedData.vaultEntries)) {
      for (const entry of parsedData.vaultEntries) {
        if (!entry.title || !entry.usernameOrEmail) continue;

        const existing = await VaultEntry.findOne({
          title: entry.title,
          usernameOrEmail: entry.usernameOrEmail,
        });

        if (existing && strategy === 'skip') {
          continue;
        }

        const passwordEncrypted = encrypt(entry.password || 'password123');
        const notesEncrypted = entry.notes ? encrypt(entry.notes) : undefined;

        if (existing && strategy === 'overwrite') {
          await VaultEntry.updateOne(
            { _id: existing._id },
            {
              category: entry.category || 'custom',
              passwordEncrypted,
              url: entry.url || '',
              notesEncrypted,
              tags: entry.tags || [],
            }
          );
          insertedVaultCount++;
        } else {
          await VaultEntry.create({
            title: entry.title,
            category: entry.category || 'custom',
            usernameOrEmail: entry.usernameOrEmail,
            passwordEncrypted,
            url: entry.url || '',
            notesEncrypted,
            tags: entry.tags || [],
          });
          insertedVaultCount++;
        }
      }
    }

    // Save Payment Accounts
    if (parsedData.paymentAccounts && Array.isArray(parsedData.paymentAccounts)) {
      for (const acc of parsedData.paymentAccounts) {
        if (!acc.accountTitle || !acc.accountNumber) continue;

        const existing = await PaymentAccount.findOne({
          accountTitle: acc.accountTitle,
          provider: acc.provider,
        });

        if (existing && strategy === 'skip') {
          continue;
        }

        const accountNumberEncrypted = encrypt(acc.accountNumber);
        const notesEncrypted = acc.notes ? encrypt(acc.notes) : undefined;

        if (existing && strategy === 'overwrite') {
          await PaymentAccount.updateOne(
            { _id: existing._id },
            {
              accountNumberEncrypted,
              bankName: acc.bankName || '',
              notesEncrypted,
              isPinned: acc.isPinned || false,
            }
          );
          insertedPaymentCount++;
        } else {
          await PaymentAccount.create({
            provider: acc.provider || 'other',
            accountTitle: acc.accountTitle,
            accountNumberEncrypted,
            bankName: acc.bankName || '',
            notesEncrypted,
            isPinned: acc.isPinned || false,
          });
          insertedPaymentCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported: {
        vault: insertedVaultCount,
        payment: insertedPaymentCount,
        total: insertedVaultCount + insertedPaymentCount,
      },
      message: `Successfully imported ${insertedVaultCount} credentials and ${insertedPaymentCount} payment accounts.`,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
  }
}
