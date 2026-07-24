import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dbService } from '@/lib/services';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cortex_session_id')?.value;
    
    if (sessionId) {
      // Log logout event
      await dbService.createAuditLog(sessionId, 'USER_LOGOUT', 'User logged out successfully.');
    }

    // Clear session cookie
    cookieStore.set('cortex_session_id', '', { maxAge: 0, path: '/' });
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
  }
}
