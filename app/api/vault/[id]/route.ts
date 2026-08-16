import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { VaultEntry } from '@/models/VaultEntry';
import { AuditLog } from '@/models/AuditLog';
import { encrypt, decrypt } from '@/lib/crypto';
import { vaultEntrySchema } from '@/lib/validations';
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
  try {
    const { accessToken } = await getAuthCookies();
    if (!accessToken || !(await verifyAccessToken(accessToken))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const validation = vaultEntrySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, category, usernameOrEmail = '', password = '', url, notes, metadata, tags } = validation.data;

    await connectDB();
    const existing = await VaultEntry.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Vault entry not found' }, { status: 404 });
    }

    existing.title = title;
    existing.category = category;
    existing.usernameOrEmail = usernameOrEmail || '';
    existing.passwordEncrypted = encrypt(password) || '';
    existing.url = url;
    existing.notesEncrypted = notes ? encrypt(notes) : undefined;
    existing.metadataEncrypted = metadata ? encrypt(JSON.stringify(metadata)) : undefined;
    existing.tags = tags || [];

    await existing.save();

    const ip = getClientIp(request);
    await AuditLog.create({
      action: 'entry_updated',
      entityId: id,
      ip,
      details: `Updated vault credential entry "${title}"`,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      entry: {
        id: existing._id.toString(),
        title: existing.title,
        category: existing.category,
        usernameOrEmail: existing.usernameOrEmail || '',
        password,
        url: existing.url || '',
        notes: notes || '',
        metadata: metadata || {},
        tags: existing.tags || [],
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('API PUT Vault Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { accessToken } = await getAuthCookies();
    if (!accessToken || !(await verifyAccessToken(accessToken))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const entry = await VaultEntry.findByIdAndDelete(id);

    if (!entry) {
      return NextResponse.json({ error: 'Vault entry not found' }, { status: 404 });
    }

    const ip = getClientIp(request);
    await AuditLog.create({
      action: 'entry_deleted',
      entityId: id,
      ip,
      details: `Deleted vault credential entry "${entry.title}"`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, message: 'Vault entry deleted successfully' });
  } catch (error: any) {
    console.error('API DELETE Vault Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
