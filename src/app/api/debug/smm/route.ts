import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const SMM_API_URL = process.env.SMM_API_URL;
    const SMM_API_KEY = process.env.SMM_API_KEY;

    try {
        if (!SMM_API_URL || !SMM_API_KEY) {
            return NextResponse.json({
                error: 'Missing Env Vars',
                env: {
                    url_exists: !!SMM_API_URL,
                    key_exists: !!SMM_API_KEY
                }
            }, { status: 500 });
        }

        const params = new URLSearchParams({
            key: SMM_API_KEY,
            action: 'services',
        });

        const response = await fetch(SMM_API_URL, {
            method: 'POST',
            body: params,
            cache: 'no-store'
        });

        const text = await response.text();
        let json;
        try {
            json = JSON.parse(text);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON', raw: text }, { status: 500 });
        }

        return NextResponse.json({
            status: response.status,
            raw_sample: Array.isArray(json) ? json[0] : json,
            is_array: Array.isArray(json),
            count: Array.isArray(json) ? json.length : 0
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
