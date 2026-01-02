import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import VirtualNumber from '@/models/VirtualNumber';
import { authOptions } from '@/lib/auth';

import { SMSPool } from '@/lib/smspool';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { serviceId, countryId, maxPrice } = await req.json();

        if (!serviceId || !countryId) {
            return NextResponse.json({ message: 'Service and Country are required' }, { status: 400 });
        }

        await dbConnect();

        // 1. Check Balance
        const user = await User.findById((session.user as any).id);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        // We use the maxPrice passed from frontend as an estimate, 
        // but ideally we should re-fetch price or rely on the provider's response.
        // For now, we'll trust the frontend price for the check, but actual deduction happens after success.
        if (user.balance < (maxPrice || 0)) {
            return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
        }

        let rentalResult;
        let providerPrefix;
        let provider;
        let actualPrice = maxPrice; // Fallback

        // 2. Rent Number (Unified SMSPool Logic)
        provider = 'smspool';
        providerPrefix = 'SP';

        let effectiveCountryId = countryId;
        if (countryId === 'US') {
            effectiveCountryId = '1';
        }

        console.log(`[Rent] Routing request to SMSPool for service ${serviceId} in ${effectiveCountryId} (Req: ${countryId})`);

        try {
            const order = await SMSPool.orderSMS(effectiveCountryId, serviceId);
            rentalResult = {
                id: order.order_id,
                number: order.number,
                expiresIn: 1200 // 20 mins default
            };
        } catch (error: any) {
            console.error('[Rent] SMSPool failed:', error);
            throw new Error('Failed to rent number via SMSPool: ' + (error.message || 'Provider error'));
        }

        // 3. Deduct Balance
        user.balance -= actualPrice;
        await user.save();

        // 4. Create Record
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + rentalResult.expiresIn);

        console.log('[Rent] Creating VirtualNumber record:', {
            user: user._id,
            service: serviceId,
            country: countryId,
            number: rentalResult.number,
            externalId: `${providerPrefix}:${rentalResult.id}`,
            provider
        });

        try {
            const virtualNumber = await VirtualNumber.create({
                user: user._id,
                service: serviceId,
                serviceName: 'Virtual Number', // We could fetch name if needed
                country: countryId,
                countryName: countryId === 'US' ? 'United States' : countryId,
                number: rentalResult.number,
                externalId: `${providerPrefix}:${rentalResult.id}`, // Prefix ID to know provider
                provider: provider,
                price: actualPrice,
                status: 'active',
                expiresAt
            });
            console.log('[Rent] VirtualNumber created:', virtualNumber._id);
        } catch (dbError: any) {
            console.error('[Rent] Database creation failed:', dbError);
            throw new Error('Failed to save order to database: ' + dbError.message);
        }

        return NextResponse.json({
            success: true,
            message: 'Number rented successfully',
            number: rentalResult.number,
            id: rentalResult.id, // Return raw ID for immediate frontend use if needed
            expiresIn: rentalResult.expiresIn
        });

    } catch (error: any) {
        console.error('Error renting number:', error);

        // [DEBUG LOCAL] Log to file
        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(process.cwd(), 'debug_error.log');
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] [Rent FAULT] ${error.toString()}\nStack: ${error.stack}\n---\n`);
        } catch (e) {
            console.error('Failed to write log file:', e);
        }

        return NextResponse.json({
            message: error.message || 'Failed to rent number',
            details: error.toString()
        }, { status: 500 });
    }
}
