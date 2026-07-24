import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authHelpers';
import { generateReportPdf, dbService } from '@/lib/services';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ message: 'Project ID is required.' }, { status: 400 });
    }

    const htmlReport = await generateReportPdf(projectId);
    
    // Log PDF generation action
    await dbService.createAuditLog(user.uid, 'PDF_REPORT_GENERATE', `Generated QA compliance report for project ${projectId}`);

    // Set headers to serve as HTML (which browser prints/downloads as PDF natively)
    const response = new NextResponse(htmlReport);
    response.headers.set('Content-Type', 'text/html');
    return response;
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}
