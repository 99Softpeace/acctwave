import { NextResponse } from 'next/server';
import { getProductInfo } from '@/lib/modded-apps';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const productCode = searchParams.get('productCode');

    if (!productCode) {
        return NextResponse.json({ message: 'Product code is required' }, { status: 400 });
    }

    try {
        const data = await getProductInfo(productCode);
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
