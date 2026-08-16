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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { accessToken } = await getAuthCookies();
  if (!accessToken || !(await verifyAccessToken(accessToken))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
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
  const existing = await PaymentAccount.findById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Payment account not found' }, { status: 404 });
  }

  existing.provider = provider as PaymentProvider;
  existing.accountTitle = accountTitle;
  existing.accountNumberEncrypted = encrypt(accountNumber);
  existing.bankName = bankName;
  existing.notesEncrypted = notes ? encrypt(notes) : undefined;
  existing.currency = currency || 'PKR';
  existing.walletTier = walletTier || '';
  existing.linkedCnic = linkedCnic || '';
  existing.isPinned = isPinned;

  await existing.save();

  const ip = getClientIp(request);
  await AuditLog.create({
    action: 'entry_updated',
    entityId: id,
    ip,
    details: `Updated payment entry "${accountTitle}"`,
    timestamp: new Date(),
  });

  return NextResponse.json({
    success: true,
    account: {
      id: existing._id.toString(),
      provider: existing.provider,
      accountTitle: existing.accountTitle,
      accountNumber,
      bankName: existing.bankName || '',
      notes: notes || '',
      currency: existing.currency || 'PKR',
      walletTier: existing.walletTier || '',
      linkedCnic: existing.linkedCnic || '',
      isPinned: existing.isPinned,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { accessToken } = await getAuthCookies();
  if (!accessToken || !(await verifyAccessToken(accessToken))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  
  await connectDB();
  const existing = await PaymentAccount.findById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Payment account not found' }, { status: 404 });
  }

  if (typeof body.isPinned === 'boolean') {
    existing.isPinned = body.isPinned;
    await existing.save();
  }

  return NextResponse.json({
    success: true,
    isPinned: existing.isPinned,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { accessToken } = await getAuthCookies();
  if (!accessToken || !(await verifyAccessToken(accessToken))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const account = await PaymentAccount.findByIdAndDelete(id);

  if (!account) {
    return NextResponse.json({ error: 'Payment account not found' }, { status: 404 });
  }

  const ip = getClientIp(request);
  await AuditLog.create({
    action: 'entry_deleted',
    entityId: id,
    ip,
    details: `Deleted payment quick-share account "${account.accountTitle}"`,
    timestamp: new Date(),
  });

  return NextResponse.json({ success: true, message: 'Payment account deleted successfully' });
}
