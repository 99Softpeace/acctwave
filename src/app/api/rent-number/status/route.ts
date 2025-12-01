import { NextResponse } from 'next/server';
import { DaisySMS } from '@/lib/daisysms';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Missing ID' },
                { status: 400 }
            );
        }

        const status = await DaisySMS.getRental(id);
        return NextResponse.json({ success: true, data: status });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
