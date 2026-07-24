import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authHelpers';
import { checkRateLimit, uploadToCloudinary, dbService } from '@/lib/services';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.success) {
    return NextResponse.json({ message: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 });
  }

  try {
    const user = await requireAuth();
    const { file, type } = await request.json();

    if (!file || !type) {
      return NextResponse.json({ message: 'File (base64 string) and type (signature|photo) are required.' }, { status: 400 });
    }

    // Call Cloudinary mock/real upload service
    const url = await uploadToCloudinary(file, type);
    
    // Log media upload action
    await dbService.createAuditLog(user.uid, 'MEDIA_UPLOAD', `Uploaded ${type} asset. Source: ${user.name}`);

    return NextResponse.json({ success: true, url });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}
