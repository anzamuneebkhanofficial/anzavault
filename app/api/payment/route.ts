import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PaymentAccount, PaymentProvider } from '@/models/PaymentAccount';
import { AuditLog } from '@/models/AuditLog';
import { encrypt, decrypt } from '@/lib/crypto';
import { paymentAccountSchema } from '@/lib/validations';
import { getAuthCookies, verifyAccessToken } from '@/lib/auth';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '127.0.0.1';
}

export async function GET(request: NextRequest) {
  const { accessToken } = await getAuthCookies();
  if (!accessToken || !(await verifyAccessToken(accessToken))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const accounts = await PaymentAccount.find({}).sort({ isPinned: -1, updatedAt: -1 });

  const decryptedAccounts = accounts.map((acc) => {
    return {
      id: acc._id.toString(),
      provider: acc.provider,
      accountTitle: acc.accountTitle,
      accountNumber: decrypt(acc.accountNumberEncrypted),
      bankName: acc.bankName || '',
      notes: acc.notesEncrypted ? decrypt(acc.notesEncrypted) : '',
      currency: acc.currency || 'PKR',
      walletTier: acc.walletTier || '',
      linkedCnic: acc.linkedCnic || '',
      isPinned: acc.isPinned,
      createdAt: acc.createdAt,
      updatedAt: acc.updatedAt,
    };
  });

  return NextResponse.json({ accounts: decryptedAccounts });
}

export async function POST(request: NextRequest) {
  const { accessToken } = await getAuthCookies();
  if (!accessToken || !(await verifyAccessToken(accessToken))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const validation = paymentAccountSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { provider, accountTitle, accountNumber, bankName, notes, currency, walletTier, linkedCnic, isPinned } = validation.data;

  await connectDB();
  const accountNumberEncrypted = encrypt(accountNumber);
  const notesEncrypted = notes ? encrypt(notes) : undefined;

  const newAccount = await PaymentAccount.create({
    provider: provider as PaymentProvider,
    accountTitle,
    accountNumberEncrypted,
    bankName,
    notesEncrypted,
    currency: currency || 'PKR',
    walletTier,
    linkedCnic,
    isPinned,
  });

  const ip = getClientIp(request);
  await AuditLog.create({
    action: 'entry_created',
    entityId: newAccount._id.toString(),
    ip,
    details: `Added payment quick-share entry "${accountTitle}" (${provider.toUpperCase()})`,
    timestamp: new Date(),
  });

  return NextResponse.json({
    success: true,
    account: {
      id: newAccount._id.toString(),
      provider: newAccount.provider,
      accountTitle: newAccount.accountTitle,
      accountNumber,
      bankName: newAccount.bankName || '',
      notes: notes || '',
      currency: newAccount.currency || 'PKR',
      walletTier: newAccount.walletTier || '',
      linkedCnic: newAccount.linkedCnic || '',
      isPinned: newAccount.isPinned,
      createdAt: newAccount.createdAt,
      updatedAt: newAccount.updatedAt,
    },
  });
}
