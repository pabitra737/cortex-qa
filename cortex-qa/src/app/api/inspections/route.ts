import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authHelpers';
import { dbService, sendEmailNotification } from '@/lib/services';
import { Inspection } from '@/types';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ message: 'Project ID is required in search queries.' }, { status: 400 });
    }

    const inspections = await dbService.getInspections(projectId);
    return NextResponse.json({ inspections });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['Super Admin', 'Factory Admin', 'QA Manager', 'QA Engineer', 'QA Inspector']);
    const body = await request.json();
    const { id, projectId, stage, checklistId, status, answers, signatureUrl, remarks } = body;

    if (!projectId || !stage || !checklistId || !status || !answers) {
      return NextResponse.json({ message: 'Missing required inspection parameters.' }, { status: 400 });
    }

    const project = await dbService.getProject(projectId);
    if (!project) {
      return NextResponse.json({ message: 'Project not found.' }, { status: 404 });
    }

    // Verify tenant boundary
    if (user.role !== 'Super Admin' && user.factoryId !== project.factoryId) {
      return NextResponse.json({ message: 'Forbidden: Access denied to project in other factory.' }, { status: 403 });
    }

    const factory = await dbService.getFactory(project.factoryId);
    const allowStageSkipping = factory?.settings.allowStageSkipping || false;

    // 1. Strict Stage Stepper Sequence Check
    if (!allowStageSkipping && user.role !== 'Super Admin' && user.role !== 'Factory Admin') {
      // Check if trying to submit a stage higher than the project's current stage
      if (stage > project.currentStage) {
        return NextResponse.json({ message: `Forbidden: Cannot submit Stage ${stage} yet. Current stage is Stage ${project.currentStage}.` }, { status: 403 });
      }

      // Check if previous stage passed
      if (stage > 1) {
        const inspections = await dbService.getInspections(projectId);
        const previousStagePassed = inspections.some(i => i.stage === stage - 1 && i.status === 'passed');
        if (!previousStagePassed) {
          return NextResponse.json({ message: `Forbidden: Stage ${stage - 1} must be completed and marked PASSED first.` }, { status: 403 });
        }
      }
    }

    // 2. Save Inspection
    const newInspection: Inspection = {
      id: id || `${projectId}_${stage}`,
      projectId,
      factoryId: project.factoryId,
      stage,
      checklistId,
      inspectorId: user.uid,
      status,
      answers,
      signatureUrl,
      remarks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (user.role === 'QA Manager' || user.role === 'Factory Admin' || user.role === 'Super Admin') {
      newInspection.approvedBy = user.uid;
    }

    await dbService.saveInspection(newInspection);
    await dbService.createAuditLog(user.uid, 'INSPECTION_SAVE', `Saved Stage ${stage} inspection for Project ${project.name}: Status ${status}`);

    // 3. Post-execution checks
    // If Stage 12 is passed, set project status to completed, generate certificate details, and notify.
    if (stage === 12 && status === 'passed') {
      await dbService.updateProject(projectId, { status: 'completed' });
      await dbService.createAuditLog(user.uid, 'PROJECT_COMPLETED', `Project ${project.name} has passed all 12 stages of quality compliance inspection.`);
      
      // Send notifications to client / managers
      const managers = (await dbService.getUsers(project.factoryId)).filter(u => u.role === 'QA Manager' || u.role === 'Factory Admin');
      const emails = ['customer@cortex.com', ...managers.map(m => m.email)];
      
      const emailBody = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: auto;">
          <h2 style="color: #b16a41;">CORTEX-QA Compliance Notification</h2>
          <p>This is to certify that <strong>${project.name}</strong> has successfully completed the 12-Stage quality compliance inspection at our manufacturing facility.</p>
          <hr />
          <h3>Project Details</h3>
          <ul>
            <li><strong>Project:</strong> ${project.name}</li>
            <li><strong>Factory:</strong> ${factory?.name}</li>
            <li><strong>Status:</strong> COMPLETED & RELEASED</li>
            <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          <p>The digital certificate and compliance report have been generated. You can download them directly from your dashboard.</p>
          <p style="font-size: 11px; color: #888;">This is an automated system email sent by CORTEX-QA Quality Management Platform.</p>
        </div>
      `;
      
      for (const email of emails) {
        await sendEmailNotification(email, `CORTEX-QA COMPLIANCE RELEASE: ${project.name}`, emailBody);
      }
    }

    return NextResponse.json({ success: true, inspection: newInspection });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}
