import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authHelpers';
import { dbService } from '@/lib/services';
import { Product } from '@/types';

export async function GET() {
  try {
    const user = await requireAuth();
    const products = await dbService.getProducts(user.factoryId);
    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['Super Admin', 'Factory Admin', 'QA Manager', 'QA Engineer']);
    const body = await request.json();
    const { name, sku, specifications, batches } = body;

    if (!name || !sku) {
      return NextResponse.json({ message: 'Product Name and SKU are required.' }, { status: 400 });
    }

    const newProduct: Product = {
      id: 'prod-' + Math.random().toString(36).substr(2, 9),
      factoryId: user.factoryId,
      name,
      sku,
      specifications: {
        dimensions: specifications?.dimensions || '',
        voltageRating: specifications?.voltageRating || '',
        currentRating: specifications?.currentRating || '',
        ipRating: specifications?.ipRating || 'IP54',
      },
      batches: batches || ['BATCH-' + new Date().getFullYear() + '-A'],
      createdAt: new Date().toISOString()
    };

    await dbService.createProduct(newProduct);
    await dbService.createAuditLog(user.uid, 'PRODUCT_CREATE', `Created product specifications template for SKU ${sku}`);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal Server Error' }, { status: err.status || 500 });
  }
}
