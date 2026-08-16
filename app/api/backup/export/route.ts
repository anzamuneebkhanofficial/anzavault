import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { VaultEntry } from '@/models/VaultEntry';
import { PaymentAccount } from '@/models/PaymentAccount';
import { decrypt } from '@/lib/crypto';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'swiz').toLowerCase();
    const category = searchParams.get('category') || 'all';
    const passphrase = searchParams.get('passphrase') || 'anza-vault-master';

    // Fetch Vault Entries
    let vaultQuery: any = {};
    if (category !== 'all') {
      vaultQuery.category = category;
    }
    const vaultDocs = await VaultEntry.find(vaultQuery).sort({ createdAt: -1 });
    const vaultEntries = vaultDocs.map((doc) => ({
      id: doc._id.toString(),
      type: 'vault',
      title: doc.title,
      category: doc.category,
      usernameOrEmail: doc.usernameOrEmail || '',
      password: doc.passwordEncrypted ? decrypt(doc.passwordEncrypted) : '',
      url: doc.url || '',
      notes: doc.notesEncrypted ? decrypt(doc.notesEncrypted) : '',
      tags: doc.tags || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    // Fetch Payment Accounts
    let paymentQuery: any = {};
    if (category !== 'all') {
      if (category === 'banking') {
        paymentQuery.provider = { $in: ['bank', 'ubl', 'meezan', 'sadapay', 'nayapay'] };
      } else {
        paymentQuery.provider = category;
      }
    }
    const paymentDocs = await PaymentAccount.find(paymentQuery).sort({ createdAt: -1 });
    const paymentAccounts = paymentDocs.map((doc) => ({
      id: doc._id.toString(),
      type: 'payment',
      provider: doc.provider,
      accountTitle: doc.accountTitle,
      accountNumber: decrypt(doc.accountNumberEncrypted),
      bankName: doc.bankName || '',
      notes: doc.notesEncrypted ? decrypt(doc.notesEncrypted) : '',
      isPinned: doc.isPinned,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    const exportPayload = {
      appName: 'Anza Vault',
      exportVersion: '2.0',
      exportedAt: new Date().toISOString(),
      categoryFilter: category,
      counts: {
        vault: vaultEntries.length,
        payment: paymentAccounts.length,
        total: vaultEntries.length + paymentAccounts.length,
      },
      data: {
        vaultEntries,
        paymentAccounts,
      },
    };

    // Format output
    if (format === 'json') {
      return new NextResponse(JSON.stringify(exportPayload, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="anza_vault_export_${Date.now()}.json"`,
        },
      });
    }

    if (format === 'swiz') {
      // Encrypt export payload using passphrase derived key
      const key = crypto.scryptSync(passphrase, 'anza-swiz-salt-v2', 32);
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      let encrypted = cipher.update(JSON.stringify(exportPayload), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag().toString('hex');

      const swizContent = JSON.stringify({
        magic: 'ANZA_VAULT_SWIZ_V2',
        timestamp: exportPayload.exportedAt,
        iv: iv.toString('hex'),
        authTag,
        payload: encrypted,
      }, null, 2);

      return new NextResponse(swizContent, {
        headers: {
          'Content-Type': 'application/x-swiz',
          'Content-Disposition': `attachment; filename="anza_vault_backup_${Date.now()}.swiz"`,
        },
      });
    }

    if (format === 'csv') {
      let csvLines = ['Type,Category/Provider,Title/AccountTitle,Username/AccountNumber,Password/BankName,URL,Tags,Notes,CreatedAt'];

      vaultEntries.forEach((v) => {
        const line = [
          'Vault Entry',
          `"${v.category}"`,
          `"${v.title.replace(/"/g, '""')}"`,
          `"${(v.usernameOrEmail || '').replace(/"/g, '""')}"`,
          `"${v.password.replace(/"/g, '""')}"`,
          `"${(v.url || '').replace(/"/g, '""')}"`,
          `"${(v.tags || []).join(';')}"`,
          `"${(v.notes || '').replace(/"/g, '""')}"`,
          `"${new Date(v.createdAt).toISOString()}"`,
        ];
        csvLines.push(line.join(','));
      });

      paymentAccounts.forEach((p) => {
        const line = [
          'Payment Account',
          `"${p.provider}"`,
          `"${p.accountTitle.replace(/"/g, '""')}"`,
          `"${p.accountNumber.replace(/"/g, '""')}"`,
          `"${(p.bankName || '').replace(/"/g, '""')}"`,
          '""',
          '""',
          `"${(p.notes || '').replace(/"/g, '""')}"`,
          `"${new Date(p.createdAt).toISOString()}"`,
        ];
        csvLines.push(line.join(','));
      });

      return new NextResponse(csvLines.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="anza_vault_export_${Date.now()}.csv"`,
        },
      });
    }

    if (format === 'txt') {
      let txtLines: string[] = [
        '========================================================================',
        '                        ANZA VAULT PERSONAL EXPORT                      ',
        '========================================================================',
        `Exported At : ${new Date().toLocaleString()}`,
        `Category    : ${category.toUpperCase()}`,
        `Total Items : ${exportPayload.counts.total} (${vaultEntries.length} credentials, ${paymentAccounts.length} payment accounts)`,
        '========================================================================',
        '',
        '--- PASSWORD VAULT CREDENTIALS ---',
      ];

      vaultEntries.forEach((v, idx) => {
        txtLines.push(`${idx + 1}. [${v.category.toUpperCase()}] ${v.title}`);
        txtLines.push(`   Username/Email : ${v.usernameOrEmail}`);
        txtLines.push(`   Password       : ${v.password}`);
        if (v.url) txtLines.push(`   URL            : ${v.url}`);
        if (v.tags?.length) txtLines.push(`   Tags           : #${v.tags.join(' #')}`);
        if (v.notes) txtLines.push(`   Notes          : ${v.notes}`);
        txtLines.push('------------------------------------------------------------------------');
      });

      txtLines.push('');
      txtLines.push('--- PAYMENT & BANKING ACCOUNTS ---');
      paymentAccounts.forEach((p, idx) => {
        txtLines.push(`${idx + 1}. [${p.provider.toUpperCase()}] ${p.accountTitle}`);
        txtLines.push(`   Account / IBAN : ${p.accountNumber}`);
        if (p.bankName) txtLines.push(`   Bank Name      : ${p.bankName}`);
        if (p.notes) txtLines.push(`   Notes          : ${p.notes}`);
        txtLines.push('------------------------------------------------------------------------');
      });

      return new NextResponse(txtLines.join('\n'), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="anza_vault_export_${Date.now()}.txt"`,
        },
      });
    }

    if (format === 'docx') {
      // Generate Word XML content compatible with Word/Office
      const xmlDoc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="10B981"/></w:rPr><w:t>ANZA VAULT PERSONAL DATA EXPORT</w:t></w:r></w:p>
    <w:p><w:r><w:t>Generated: ${new Date().toLocaleString()} | Filter: ${category.toUpperCase()}</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>Vault Credentials (${vaultEntries.length})</w:t></w:r></w:p>
    ${vaultEntries.map(v => `
      <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>[${v.category.toUpperCase()}] ${v.title}</w:t></w:r></w:p>
      <w:p><w:r><w:t>Username: ${v.usernameOrEmail} | Password: ${v.password} | URL: ${v.url}</w:t></w:r></w:p>
    `).join('')}
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>Payment Accounts (${paymentAccounts.length})</w:t></w:r></w:p>
    ${paymentAccounts.map(p => `
      <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>[${p.provider.toUpperCase()}] ${p.accountTitle}</w:t></w:r></w:p>
      <w:p><w:r><w:t>Account/IBAN: ${p.accountNumber} | Bank: ${p.bankName}</w:t></w:r></w:p>
    `).join('')}
  </w:body>
</w:wordDocument>`;

      return new NextResponse(xmlDoc, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="anza_vault_export_${Date.now()}.docx"`,
        },
      });
    }

    if (format === 'pdf') {
      // Printable HTML document for PDF generation
      const pdfHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Anza Vault Backup Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0B0F17; color: #E2E8F0; padding: 40px; margin: 0; }
    h1 { color: #10B981; margin-bottom: 5px; }
    .meta { font-size: 12px; color: #94A3B8; margin-bottom: 30px; border-bottom: 1px solid #334155; padding-bottom: 10px; }
    .section-title { font-size: 18px; font-weight: bold; color: #38BDF8; margin-top: 30px; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
    th { background: #1E293B; color: #94A3B8; text-align: left; padding: 10px; border-bottom: 1px solid #334155; }
    td { padding: 10px; border-bottom: 1px solid #1E293B; word-break: break-all; }
    .badge { background: #10B98120; color: #34D399; padding: 2px 6px; borderRadius: 4px; font-weight: bold; font-size: 10px; }
    @media print {
      body { background: white; color: black; }
      th { background: #F1F5F9; color: black; }
      td { border-bottom: 1px solid #E2E8F0; }
    }
  </style>
</head>
<body>
  <h1>Anza Vault Security Export</h1>
  <div class="meta">Generated on ${new Date().toLocaleString()} | Filter: ${category.toUpperCase()} | Total Records: ${exportPayload.counts.total}</div>
  
  <div class="section-title">Password Vault Credentials (${vaultEntries.length})</div>
  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Title</th>
        <th>Username / Email</th>
        <th>Password</th>
        <th>URL / Tags</th>
      </tr>
    </thead>
    <tbody>
      ${vaultEntries.map(v => `
        <tr>
          <td><span class="badge">${v.category}</span></td>
          <td><strong>${v.title}</strong></td>
          <td>${v.usernameOrEmail}</td>
          <td><code>${v.password}</code></td>
          <td>${v.url} ${v.tags?.length ? `#${v.tags.join(' #')}` : ''}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="section-title">Payment & Banking Accounts (${paymentAccounts.length})</div>
  <table>
    <thead>
      <tr>
        <th>Provider</th>
        <th>Account Title</th>
        <th>Account Number / IBAN</th>
        <th>Bank Name</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${paymentAccounts.map(p => `
        <tr>
          <td><span class="badge">${p.provider}</span></td>
          <td><strong>${p.accountTitle}</strong></td>
          <td><code>${p.accountNumber}</code></td>
          <td>${p.bankName || '—'}</td>
          <td>${p.notes || '—'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

      return new NextResponse(pdfHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported format requested' }, { status: 400 });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 });
  }
}
