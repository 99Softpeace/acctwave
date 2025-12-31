
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const results: any = {
        env: {
            TV_KEY_EXISTS: !!process.env.TEXTVERIFIED_API_KEY,
            TV_KEY_LEN: process.env.TEXTVERIFIED_API_KEY?.length || 0,
            SP_KEY_EXISTS: !!process.env.SMSPOOL_API_KEY,
            SP_KEY_LEN: process.env.SMSPOOL_API_KEY?.length || 0,
        },
        connectivity: {}
    };

    // Test TextVerified
    const startTV = performance.now();
    try {
        const email = process.env.TEXTVERIFIED_EMAIL || '';
        // Test Auth Endpoint exactly like the library does
        const response = await fetch('https://www.textverified.com/api/pub/v2/auth', {
            method: 'POST',
            headers: {
                'X-API-KEY': process.env.TEXTVERIFIED_API_KEY || '',
                'X-API-USERNAME': email,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        results.connectivity.textverified = {
            status: response.status,
            statusText: response.statusText,
            latency: Math.round(performance.now() - startTV) + 'ms',
            ok: response.ok
        };
        if (!response.ok) {
            results.connectivity.textverified.errorBody = await response.text().catch(e => 'Could not read text');
        }
    } catch (error: any) {
        results.connectivity.textverified = {
            error: error.message,
            latency: Math.round(performance.now() - startTV) + 'ms'
        };
    }

    // Test SMSPool
    const startSP = performance.now();
    try {
        const response = await fetch(`https://api.smspool.net/country/retrieve_all?key=${process.env.SMSPOOL_API_KEY}`);
        results.connectivity.smspool = {
            status: response.status,
            statusText: response.statusText,
            latency: Math.round(performance.now() - startSP) + 'ms',
            ok: response.ok
        };
        if (!response.ok) {
            results.connectivity.smspool.errorBody = await response.text().catch(e => 'Could not read text');
        }
    } catch (error: any) {
        results.connectivity.smspool = {
            error: error.message,
            latency: Math.round(performance.now() - startSP) + 'ms'
        };
    }

    return NextResponse.json(results);
}
