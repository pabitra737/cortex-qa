import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authHelpers';
import { dbService } from '@/lib/services';
import { TenantFactory } from '@/types';

export async function GET() {
  try {
    const user = await requireAuth();
    const factories = await dbService.getFactories();
    
    // Filter by factoryId if the user is not a Super Admin
    if (user.role !== 'Super Admin') {
      const filtered = factories.filter(f => f.id === user.factoryId);
      return NextResponse.json({ factories: filtered });
    }
    
    return NextResponse.json({ factories });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['Super Admin']);
    const body = await request.json();
    const { name, location, settings } = body;

    if (!name || !location) {
      return NextResponse.json({ message: 'Name and location are required.' }, { status: 400 });
    }

    const newFactory: TenantFactory = {
      id: 'factory-' + Math.random().toString(36).substr(2, 9),
      name,
      location,
      settings: {
        allowStageSkipping: settings?.allowStageSkipping || false,
        requireDoubleApproval: settings?.requireDoubleApproval || false,
        companyLogoUrl: settings?.companyLogoUrl
      },
      createdAt: new Date().toISOString()
    };

    await dbService.createFactory(newFactory);
    await dbService.createAuditLog(user.uid, 'FACTORY_CREATE', `Created factory ${name} in ${location}`);

    return NextResponse.json({ success: true, factory: newFactory });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth(['Super Admin', 'Factory Admin']);
    const body = await request.json();
    const { id, settings } = body;

    if (!id || !settings) {
      return NextResponse.json({ message: 'Factory ID and settings payload are required.' }, { status: 400 });
    }

    // Verify Factory Admin is changing their own factory settings
    if (user.role === 'Factory Admin' && user.factoryId !== id) {
      return NextResponse.json({ message: 'Forbidden: Cannot edit other factory settings.' }, { status: 403 });
    }

    const updated = await dbService.updateFactorySettings(id, settings);
    await dbService.createAuditLog(user.uid, 'FACTORY_SETTINGS_UPDATE', `Updated settings for factory ${id}`);

    return NextResponse.json({ success: true, factory: updated });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}
