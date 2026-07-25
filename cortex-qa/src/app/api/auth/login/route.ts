import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dbService, checkRateLimit } from '@/lib/services';

export async function POST(request: Request) {
  // 1. Rate limiting
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.success) {
    return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    // 2. Fetch users and match
    const users = await dbService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials or user not found.' }, { status: 401 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({ message: 'This user account has been deactivated.' }, { status: 403 });
    }

    // 3. Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('cortex_session_id', user.uid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: 'lax',
    });

    // 4. Log to Audit Trails
    await dbService.createAuditLog(user.uid, 'USER_LOGIN', `User logged in from IP ${ip}`);

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
  }
}
