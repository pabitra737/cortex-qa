import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authHelpers';
import { dbService } from '@/lib/services';
import { UserProfile, UserRole } from '@/types';

// Role permission mapping helper
function getDefaultPermissions(role: UserRole): string[] {
  switch (role) {
    case 'Super Admin':
      return ['*'];
    case 'Factory Admin':
      return ['read:all', 'write:all', 'approve:all', 'manage:users', 'manage:projects'];
    case 'QA Manager':
      return ['read:all', 'write:inspections', 'approve:inspections', 'manage:projects'];
    case 'QA Engineer':
      return ['read:all', 'write:inspections', 'manage:projects'];
    case 'QA Inspector':
      return ['read:all', 'write:inspections'];
    case 'Operator':
      return ['read:all'];
    case 'Customer':
      return ['read:all', 'sign:report'];
    default:
      return [];
  }
}

export async function GET() {
  try {
    const user = await requireAuth();
    const allUsers = await dbService.getUsers();

    if (user.role !== 'Super Admin') {
      const filtered = allUsers.filter(u => u.factoryId === user.factoryId);
      return NextResponse.json({ users: filtered });
    }

    return NextResponse.json({ users: allUsers });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['Super Admin', 'Factory Admin']);
    const body = await request.json();
    const { email, name, role, factoryId } = body;

    if (!email || !name || !role || !factoryId) {
      return NextResponse.json({ message: 'Missing required user parameters.' }, { status: 400 });
    }

    // RBAC safety check: Factory Admins can only create users in their own factory
    if (user.role === 'Factory Admin' && user.factoryId !== factoryId) {
      return NextResponse.json({ message: 'Forbidden: Factory Admins can only manage users in their own tenant.' }, { status: 403 });
    }

    const newUser: UserProfile = {
      uid: 'user-' + Math.random().toString(36).substr(2, 9),
      email,
      name,
      role,
      factoryId,
      status: 'active',
      permissions: getDefaultPermissions(role),
      createdAt: new Date().toISOString()
    };

    await dbService.createUser(newUser);
    await dbService.createAuditLog(user.uid, 'USER_CREATE', `Created user account: ${name} (${role}) for factory ${factoryId}`);

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth(['Super Admin', 'Factory Admin']);
    const body = await request.json();
    const { uid, name, role, status, factoryId } = body;

    if (!uid) {
      return NextResponse.json({ message: 'User UID is required for updates.' }, { status: 400 });
    }

    const targetUser = await dbService.getUser(uid);
    if (!targetUser) {
      return NextResponse.json({ message: 'Target user profile not found.' }, { status: 404 });
    }

    // Verify boundaries
    if (user.role === 'Factory Admin' && user.factoryId !== targetUser.factoryId) {
      return NextResponse.json({ message: 'Forbidden: Cannot edit users outside your factory.' }, { status: 403 });
    }

    const updatePayload: Partial<UserProfile> = {};
    if (name) updatePayload.name = name;
    if (role) {
      updatePayload.role = role;
      updatePayload.permissions = getDefaultPermissions(role);
    }
    if (status) updatePayload.status = status;
    if (factoryId && user.role === 'Super Admin') updatePayload.factoryId = factoryId;

    const updated = await dbService.updateUser(uid, updatePayload);
    await dbService.createAuditLog(user.uid, 'USER_UPDATE', `Modified user profile for user ID ${uid}: status ${status || 'unchanged'}`);

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}
