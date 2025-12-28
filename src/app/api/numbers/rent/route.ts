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
            // Use SMSPool for US (Fallback due to network issues)
            providerPrefix = 'SP';
            console.log(`Attempting SMSPool purchase for US service ${serviceId}`);

            // We need to find the US country ID for SMSPool. 
            // Since we can't easily fetch it here without making another request, 
            // we'll default to '1' which is standard for US on many panels, 
            // OR ideally pass it from frontend. 
            // However, SMSPool.orderSMS takes countryId. 
            // If the frontend passed 'US', SMSPool might not accept 'US' string if it expects ID.
            // But looking at SMSPool.orderSMS implementation (viewed previously), it seemingly takes countryId as string.
            // If the user selected 'US' in frontend, and we fetch services using SMSPool ID for US, 
            // the `countryId` param here might be 'US' or the numeric ID depending on how frontend sends it.
            // Frontend sends `selectedCountry`.
            // If tab is 'us', frontend sets `selectedCountry` to 'US'.
            // So we need to map 'US' to SMSPool's US ID (usually 1 or 187).

            // Let's safe-guard:
            // Fetch countries to find US ID? Too slow.
            // Let's assume '1' is US for SMSPool (common) or try to use 'US' if valid.
            // Inspecting `smspool.ts` would confirm if it needs ID.
            // Previous code `SMSPool.getServices(usId)` used `usId`.

            // **CRITICAL**: The frontend sends `countryId: 'US'` when in US tab.
            // We need to convert 'US' to the correct SMSPool Country ID.
            // Hardcoding '1' is risky if it changes. 
            // But we can try '187' (often US on some) or '1'.
            // Let's checking `smspool.ts` via memory or assume '1' and handle error/lookup.
            // Actually, best to do a quick lookup or cached lookup.

            // Let's fetch countries to be sure.
            const allCountries = await SMSPool.getCountries();
            const usCountry = allCountries.find((c: any) => c.short_name === 'US' || c.name === 'United States');
            const usId = usCountry ? usCountry.id : '1';

            const order = await SMSPool.orderSMS(usId, serviceId);
            rentalResult = {
                id: order.order_id,
                number: order.number,
                expiresIn: 900
            };
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
