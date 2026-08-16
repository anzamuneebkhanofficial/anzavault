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

export async function GET(request: NextRequest) {
  try {
    const { accessToken } = await getAuthCookies();
    if (!accessToken || !(await verifyAccessToken(accessToken))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const entries = await VaultEntry.find({}).sort({ updatedAt: -1 });

    // Decrypt sensitive fields in memory before returning to authenticated client
    const decryptedEntries = entries.map((entry) => {
      let metadataObj: Record<string, any> = {};
      if (entry.metadataEncrypted) {
        try {
          const decryptedStr = decrypt(entry.metadataEncrypted);
          if (decryptedStr && decryptedStr.startsWith('{')) {
            metadataObj = JSON.parse(decryptedStr);
          }
        } catch (err) {
          console.error('Metadata decrypt error:', err);
        }
      }

      // Optimize list payload performance: retain files metadata without clogging network payload
      if (Array.isArray(metadataObj.files)) {
        metadataObj.fileCount = metadataObj.files.length;
      }

      return {
        id: entry._id.toString(),
        title: entry.title,
        category: entry.category,
        usernameOrEmail: entry.usernameOrEmail || '',
        password: entry.passwordEncrypted ? decrypt(entry.passwordEncrypted) : '',
        url: entry.url || '',
        notes: entry.notesEncrypted ? decrypt(entry.notesEncrypted) : '',
        metadata: metadataObj,
        tags: entry.tags || [],
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      };
    });

    return NextResponse.json({ entries: decryptedEntries });
  } catch (error: any) {
    console.error('API GET Vault Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await getAuthCookies();
    if (!accessToken || !(await verifyAccessToken(accessToken))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const passwordEncrypted = encrypt(password);
    const notesEncrypted = notes ? encrypt(notes) : undefined;
    const metadataEncrypted = metadata ? encrypt(JSON.stringify(metadata)) : undefined;

    const newEntry = await VaultEntry.create({
      title,
      category,
      usernameOrEmail: usernameOrEmail || '',
      passwordEncrypted: passwordEncrypted || '',
      url,
      notesEncrypted,
      metadataEncrypted,
      tags: tags || [],
    });

    const ip = getClientIp(request);
    await AuditLog.create({
      action: 'entry_created',
      entityId: newEntry._id.toString(),
      ip,
      details: `Created vault credential entry "${title}" in category "${category}"`,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      entry: {
        id: newEntry._id.toString(),
        title: newEntry.title,
        category: newEntry.category,
        usernameOrEmail: newEntry.usernameOrEmail || '',
        password,
        url: newEntry.url || '',
        notes: notes || '',
        metadata: metadata || {},
        tags: newEntry.tags || [],
        createdAt: newEntry.createdAt,
        updatedAt: newEntry.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('API POST Vault Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
