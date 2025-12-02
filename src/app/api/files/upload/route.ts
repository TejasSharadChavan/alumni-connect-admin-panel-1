import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { files, sessions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const session = await db.select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (session.length === 0) return null;

    const expiresAt = new Date(session[0].expiresAt);
    if (expiresAt < new Date()) return null;

    const user = await db.select()
      .from(users)
      .where(eq(users.id, session[0].userId))
      .limit(1);

    if (user.length === 0 || user[0].status !== 'active') return null;

    return user[0];
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';

    if (!file) {
      return NextResponse.json({ 
        error: 'No file provided',
        code: 'MISSING_FILE' 
      }, { status: 400 });
    }

    // Validate file size (10MB for images, 5MB for documents)
    const maxSize = type === 'image' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size must be less than ${maxSize / 1024 / 1024}MB`,
        code: 'FILE_TOO_LARGE' 
      }, { status: 400 });
    }

    // Validate MIME type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (type === 'image' && !validImageTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid image type. Allowed: JPEG, PNG, GIF, WebP',
        code: 'INVALID_FILE_TYPE' 
      }, { status: 400 });
    }

    if (type === 'document' && !validDocTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid document type. Allowed: PDF, DOC, DOCX',
        code: 'INVALID_FILE_TYPE' 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomStr}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Save to database
    const publicUrl = `/uploads/${filename}`;
    const newFile = await db.insert(files).values({
      ownerId: user.id,
      type,
      filename: file.name,
      storagePath: filepath,
      url: publicUrl,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json({
      id: newFile[0].id,
      url: publicUrl,
      filename: file.name,
      size: file.size,
      type,
      mimeType: file.type,
      uploadedAt: newFile[0].uploadedAt,
    }, { status: 201 });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ 
      error: 'File upload failed: ' + (error as Error).message,
      code: 'UPLOAD_FAILED' 
    }, { status: 500 });
  }
}
