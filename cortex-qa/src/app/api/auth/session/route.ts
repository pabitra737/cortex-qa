import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dbService } from '@/lib/services';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cortex_session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ user: null });
    }

    const user = await dbService.getUser(sessionId);
    if (!user) {
      // Session refers to non-existent user
      cookieStore.set('cortex_session_id', '', { maxAge: 0, path: '/' });
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
  }
}
