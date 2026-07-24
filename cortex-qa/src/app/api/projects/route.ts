import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authHelpers';
import { dbService } from '@/lib/services';
import { Project } from '@/types';

export async function GET() {
  try {
    const user = await requireAuth();
    const projects = await dbService.getProjects(user.factoryId);
    return NextResponse.json({ projects });
  } catch (err: unknown) {
    const error = err as { message?: string; status?: number };
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: error.status || 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['Super Admin', 'Factory Admin', 'QA Manager', 'QA Engineer']);
    const body = await request.json();
    const { 
      name, 
      description, 
      engineerIds, 
      inspectorIds,
      customerName,
      customerEmail,
      poNumber,
      poDate,
      panelType,
      panelRating,
      drawingNumber,
      panelThicknessBody,
      panelThicknessGland,
      panelThicknessMounting,
      panelThicknessDoor,
      cableEntry,
      wireSizeControl,
      wireSizePower
    } = body;

    if (!name) {
      return NextResponse.json({ message: 'Project name is required.' }, { status: 400 });
    }

    // Resolve assigned inspector name
    let assignedInspectorName = 'Do not assign inspector yet';
    if (inspectorIds && inspectorIds.length > 0) {
      const inspector = await dbService.getUser(inspectorIds[0]);
      if (inspector) {
        assignedInspectorName = inspector.name;
      }
    }

    // Generate dynamic serial number based on type and rating
    const randNum = Math.floor(100 + Math.random() * 900);
    const generatedSn = `VIREON-${panelType || 'MCC'}-${panelRating || '415V'}-2026-${randNum}`;

    const newProject: Project = {
      id: 'proj-' + Math.random().toString(36).substr(2, 9),
      factoryId: user.factoryId,
      name,
      description: description || '',
      engineerIds: engineerIds || [user.uid],
      inspectorIds: inspectorIds || [],
      assignedInspectorName,
      serialNumber: generatedSn,
      drawingNumber: drawingNumber || '040',
      tags: [panelType || 'MCC', 'Pending', panelRating || '415V'],
      status: 'pending',
      currentStage: 1, // Reset to Incoming Material stage
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName,
      customerEmail,
      poNumber,
      poDate,
      panelType,
      panelRating,
      panelThicknessBody,
      panelThicknessGland,
      panelThicknessMounting,
      panelThicknessDoor,
      cableEntry,
      wireSizeControl,
      wireSizePower
    };

    await dbService.createProject(newProject);
    await dbService.createAuditLog(user.uid, 'PROJECT_CREATE', `Created project: ${name}`);

    return NextResponse.json({ success: true, project: newProject });
  } catch (err: unknown) {
    const error = err as { message?: string; status?: number };
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: error.status || 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth(['Super Admin', 'Factory Admin', 'QA Manager', 'QA Engineer']);
    const body = await request.json();
    const { id, name, description, engineerIds, inspectorIds, status, currentStage } = body;

    if (!id) {
      return NextResponse.json({ message: 'Project ID is required for updates.' }, { status: 400 });
    }

    const targetProject = await dbService.getProject(id);
    if (!targetProject) {
      return NextResponse.json({ message: 'Project not found.' }, { status: 404 });
    }

    // Verify boundary
    if (user.role !== 'Super Admin' && user.factoryId !== targetProject.factoryId) {
      return NextResponse.json({ message: 'Forbidden: Access denied to tenant project.' }, { status: 403 });
    }

    const updatePayload: Partial<Project> = {};
    if (name) updatePayload.name = name;
    if (description) updatePayload.description = description;
    if (engineerIds) updatePayload.engineerIds = engineerIds;
    if (inspectorIds) updatePayload.inspectorIds = inspectorIds;
    if (status) updatePayload.status = status;
    
    // Validate currentStage sequence shifts
    if (currentStage !== undefined) {
      // If the user is admin, allow arbitrary overrides. Otherwise, block stage skipping
      const factory = await dbService.getFactory(targetProject.factoryId);
      const allowStageSkipping = factory?.settings.allowStageSkipping || false;
      
      if (!allowStageSkipping && user.role !== 'Super Admin' && user.role !== 'Factory Admin') {
        const stepDiff = currentStage - targetProject.currentStage;
        if (stepDiff > 1) {
          return NextResponse.json({ message: 'Forbidden: Cannot skip workflow stages without administrator permission.' }, { status: 403 });
        }
      }
      updatePayload.currentStage = currentStage;
    }

    const updated = await dbService.updateProject(id, updatePayload);
    await dbService.createAuditLog(user.uid, 'PROJECT_UPDATE', `Modified project ID ${id}: stage set to ${updated.currentStage}, status ${updated.status}`);

    return NextResponse.json({ success: true, project: updated });
  } catch (err: unknown) {
    const error = err as { message?: string; status?: number };
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: error.status || 500 });
  }
}
