import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import axios from 'axios';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const userEmail = session.user.email;
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Return existing account if it exists
        if (user.virtualAccount && user.virtualAccount.accountNumber) {
            return NextResponse.json({ success: true, data: user.virtualAccount });
        }

        const pocketFiUrl = process.env.POCKETFI_API_BASE_URL || 'https://api.pocketfi.ng/api/v1';
        const authToken = process.env.POCKETFI_API_KEY || process.env.POCKETFI_SECRET_KEY;

        console.log('[PocketFi] Auth token present:', !!authToken);

        if (!authToken) {
            console.error('Missing PocketFi authentication token (POCKETFI_API_KEY or POCKETFI_SECRET_KEY)');
            return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
        }

        // Prepare payload
        const names = (user.name || 'Guest User').split(' ');
        const firstName = names[0];
        const lastName = names.slice(1).join(' ') || 'User';

        // Generate a unique reference
        const txRef = `VA-${user._id.toString().slice(-6)}-${Date.now()}`;

        const payload: any = {
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            phone: user.phoneNumber || `080${Math.floor(Math.random() * 90000000 + 10000000)}`,
            type: "static",
            businessId: Number(process.env.POCKETFI_BUSINESS_ID), // Ensure numeric
            bank: "090267", // numeric code for Kuda
            reference: txRef, // Unique reference is often required
            tx_ref: txRef     // Sending both common field names to be safe
        };
        // Only include BVN if user has one (empty string usually causes validation error)
        if (user.bvn) {
            payload.bvn = user.bvn;
        }

        if (!payload.businessId) {
            console.error('Missing POCKETFI_BUSINESS_ID in environment variables');
            return NextResponse.json({ message: 'Server configuration error: Missing Business ID' }, { status: 500 });
        }

        console.log('[PocketFi] Sending Payload (masked):', JSON.stringify({ ...payload, businessId: '***' }));

        console.log('[PocketFi] Sending Payload:', JSON.stringify({ ...payload, businessId: '***' }));

        console.log(`[PocketFi] Creating account for ${user.email}...`);

        // Ensure no trailing slash in base
        const baseUrl = (pocketFiUrl || '').replace(/\/$/, '');
        // Verified Endpoint from Documentation
        const targetUrl = `${baseUrl}/virtual-accounts/create`;
        console.log(`[PocketFi] Requesting URL: ${targetUrl}`);

        const response = await axios.post(targetUrl, payload, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;
        console.log('[PocketFi] Create Response:', JSON.stringify(data, null, 2));

        if (data.status === 'success' || data.success) {
            const accountData = data.data;

            console.log('[PocketFi Debug] Raw Account Data:', JSON.stringify(accountData, null, 2));

            // Robust Mapping to handle API variations
            const newAccount = {
                // Check all possible fields for bank name
                bankName: accountData.bank_name || accountData.bank || accountData.bankName || 'Unknown Bank',
                // Check all possible fields for account number
                accountNumber: accountData.account_number || accountData.number || accountData.accountNumber,
                // Check all possible fields for account name
                accountName: accountData.account_name || accountData.accountName || user.name
            };

            if (!newAccount.bankName || newAccount.bankName === 'Unknown Bank') {
                console.warn('[PocketFi Warning] Bank name missing in response');
            }
            if (!newAccount.accountNumber) {
                console.error('[PocketFi Error] Account number missing in response');
                throw new Error('Account number missing from payment provider response');
            }

            // Update User Transactionally (Mongoose save is atomic for the doc)
            user.virtualAccount = newAccount;
            await user.save();

            return NextResponse.json({
                success: true,
                data: newAccount
            });
        } else {
            console.error('[PocketFi] Creation Failed:', data);
            return NextResponse.json({
                success: false,
                message: data.message || 'Failed to create virtual account',
                details: data
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('[PocketFi] API Request Error:', error.message);
        if (error.response) {
            console.error('[PocketFi] Error Data:', JSON.stringify(error.response.data, null, 2));
            console.error('[PocketFi] Error Status:', error.response.status);
            console.error('[PocketFi] Error Headers:', JSON.stringify(error.response.headers, null, 2));
        }
        return NextResponse.json({
            success: false,
            message: error.response?.data?.message || error.message || 'Internal server error',
            details: error.response?.data
        }, { status: 500 });
    }
}
