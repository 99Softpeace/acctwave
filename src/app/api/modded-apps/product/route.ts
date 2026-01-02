import { NextResponse } from 'next/server';
import { fetchProduct } from '@/lib/bulkacc-service';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const productCode = searchParams.get('productCode');

    if (!productCode) {
        return NextResponse.json({ message: 'Product code is required' }, { status: 400 });
    }

    try {
        const data = await fetchProduct(productCode);
        if (!data) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ statusCode: 200, data });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
