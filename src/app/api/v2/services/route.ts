import { NextResponse } from 'next/server';
import { getServices } from '@/lib/smm';

export async function GET(req: Request) {
    try {
        // Optional: Require API Key even for services to track usage
        // const authHeader = req.headers.get('Authorization');
        // ... validate key ...

        const services = await getServices();

        // Transform to a cleaner format if needed, or return as is
        return NextResponse.json(services);

    } catch (error: any) {
        console.error('API V2 Services Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
