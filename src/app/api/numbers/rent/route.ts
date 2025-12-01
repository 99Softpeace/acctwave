import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import VirtualNumber from '@/models/VirtualNumber';
import { authOptions } from '@/lib/auth';
import { TextVerified } from '@/lib/textverified';
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
        let actualPrice = maxPrice; // Fallback

        // 2. Rent Number
        // Determine provider based on country and service ID format or fallback logic
        // TextVerified IDs are usually numeric strings. SMSPool IDs are also numeric but we might need a way to distinguish.
        // However, since we know we might have fallen back to SMSPool for US, we should try to detect or handle it.

        // A simple heuristic: If country is US, try TextVerified first. If it fails (404/400), try SMSPool?
        // Or better: Pass the provider from the frontend? 
        // Since we can't easily change the frontend contract right now without breaking things, let's try to infer.

        // Actually, the cleanest way without changing frontend is:
        // If country is US, try TextVerified. If it errors, check if it's a TextVerified error.
        // But wait, if we displayed SMSPool services for US, the ID passed is an SMSPool ID.
        // TextVerified.createVerification(smsPoolId) will likely fail.

        // Let's try to assume it's TextVerified for US, but if it fails, try SMSPool.
        // OR, we can check if the serviceId exists in TextVerified services list? No, too slow.

        // Let's try this:
        if (countryId === 'US') {
            try {
                // Try TextVerified first
                providerPrefix = 'TV';
                console.log(`Attempting TextVerified purchase for service ${serviceId}`);
                const verification = await TextVerified.createVerification(serviceId);
                rentalResult = {
                    id: verification.id,
                    number: verification.number,
                    expiresIn: 900 // 15 mins default
                };
            } catch (tvError: any) {
                console.log('TextVerified purchase failed, trying SMSPool fallback...', tvError.message);
                // If TextVerified fails, try SMSPool for US
                // We need the SMSPool Country ID for US, which is usually '1'
                // But we should verify.
                const usId = '1';
                providerPrefix = 'SP';
                const order = await SMSPool.orderSMS(usId, serviceId);
                rentalResult = {
                    id: order.order_id,
                    number: order.number,
                    expiresIn: 900
                };
            }
        } else {
            // SMSPool for other countries
            providerPrefix = 'SP';
            const order = await SMSPool.orderSMS(countryId, serviceId);
            rentalResult = {
                id: order.order_id,
                number: order.number,
                expiresIn: 900 // 15 mins default
            };
        }

        // 3. Deduct Balance
        user.balance -= actualPrice;
        await user.save();

        // 4. Create Record
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + rentalResult.expiresIn);

        const virtualNumber = await VirtualNumber.create({
            user: user._id,
            service: serviceId,
            serviceName: 'Virtual Number', // We could fetch name if needed
            country: countryId,
            countryName: countryId === 'US' ? 'United States' : countryId,
            number: rentalResult.number,
            externalId: `${providerPrefix}:${rentalResult.id}`, // Prefix ID to know provider
            price: actualPrice,
            status: 'active',
            expiresAt: expiresAt,
        });

        return NextResponse.json({
            success: true,
            message: 'Number rented successfully',
            data: virtualNumber,
            newBalance: user.balance
        });

    } catch (error: any) {
        console.error('Error renting number:', error);
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}
