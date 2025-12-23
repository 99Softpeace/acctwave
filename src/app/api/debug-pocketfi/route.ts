import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const apiKey = process.env.POCKETFI_API_KEY || '';
    const secretKey = process.env.POCKETFI_SECRET_KEY || '';
    const businessId = process.env.POCKETFI_BUSINESS_ID || '';
    const signingSecret = process.env.WEBHOOK_SIGNING_SECRET || '';

    // Check what the library would see
    const libSecretKey = secretKey || apiKey;

    return NextResponse.json({
        env: {
            POCKETFI_API_KEY_PREFIX: apiKey.substring(0, 5) + '...',
            POCKETFI_SECRET_KEY_PREFIX: secretKey.substring(0, 5) + '...',
            POCKETFI_BUSINESS_ID: businessId,
            WEBHOOK_SIGNING_SECRET_SET: !!signingSecret, // just boolean to be safe
            WEBHOOK_SIGNING_SECRET_LENGTH: signingSecret.length
        },
        lib_logic: {
            RESOLVED_SECRET_KEY_PREFIX: libSecretKey.substring(0, 5) + '...',
            USING_FALLBACK: !secretKey && !!apiKey
        },
        timestamp: new Date().toISOString()
    });
}
