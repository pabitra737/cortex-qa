import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authHelpers';
import { sendEmailNotification, dbService } from '@/lib/services';

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['Super Admin', 'Factory Admin', 'QA Manager']);
    const { projectId, email } = await request.json();

    if (!projectId || !email) {
      return NextResponse.json({ message: 'Project ID and recipient email are required.' }, { status: 400 });
    }

    const project = await dbService.getProject(projectId);
    if (!project) {
      return NextResponse.json({ message: 'Project not found.' }, { status: 404 });
    }

    const factory = await dbService.getFactory(project.factoryId);

    const emailBody = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: auto;">
        <h2 style="color: #b16a41;">CORTEX-QA Manual Report Release</h2>
        <p>A manual quality report export has been triggered for project: <strong>${project.name}</strong>.</p>
        <hr />
        <h3>Project Compliance Status</h3>
        <ul>
          <li><strong>Project Name:</strong> ${project.name}</li>
          <li><strong>Factory:</strong> ${factory?.name || 'Vireon Panels'}</li>
          <li><strong>Current Stage:</strong> Stage ${project.currentStage} / 12</li>
          <li><strong>Status:</strong> ${project.status.toUpperCase()}</li>
        </ul>
        <p>Please log in to your CORTEX-QA dashboard to view complete history and download official records.</p>
      </div>
    `;

    await sendEmailNotification(email, `CORTEX-QA COMPLIANCE REPORT: ${project.name}`, emailBody);
    await dbService.createAuditLog(user.uid, 'EMAIL_REPORT_DISPATCH', `Manually emailed report for project ${projectId} to ${email}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}
