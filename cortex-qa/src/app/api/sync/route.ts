import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authHelpers';
import { dbService } from '@/lib/services';

export async function GET() {
  try {
    await requireAuth();
    const logs = await dbService.getSyncLogs();
    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { logs } = await request.json();

    if (logs && Array.isArray(logs)) {
      for (const log of logs) {
        await dbService.createSyncLog(log.type, log.status, `${log.details} - Synced by User ${user.name}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}
