import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VirtualNumber from '@/models/VirtualNumber';
import Order from '@/models/Order'; // legacy rental model
import { TextVerified } from '@/lib/textverified';
import { SMSPool } from '@/lib/smspool';
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

        await dbConnect();

        // 1. Try Find in VirtualNumber (New System)
        try {
            const rental = await VirtualNumber.findById(id);
            if (rental) {
                // ... Existing logic for VirtualNumber ...
                const [provider, externalId] = rental.externalId ? rental.externalId.split(':') : [null, null];

                if (!provider || !externalId) {
                    return NextResponse.json(
                        { success: false, error: 'Invalid rental record: Missing external ID' },
                        { status: 500 }
                    );
                }

                let statusData = {
                    status: rental.status,
                    code: rental.smsCode,
                    messages: [] as any[]
                };

                if (provider === 'TV') {
                    const tvStatus = await TextVerified.getRental(externalId);
                    statusData.status = tvStatus.status.toLowerCase();
                    if (tvStatus.code) {
                        statusData.code = tvStatus.code;
                        statusData.messages = [{ sender: 'Service', date: new Date().toISOString(), text: tvStatus.code }];
                    }
                } else if (provider === 'SP') {
                    const spStatus = await SMSPool.checkOrder(externalId);
                    statusData.status = spStatus.status.toLowerCase();
                    if (spStatus.code) {
                        statusData.code = spStatus.code;
                        statusData.messages = [{ sender: 'Service', date: new Date().toISOString(), text: spStatus.full_code || spStatus.code }];
                    }
                }

                // Update DB
                if (statusData.code && !rental.smsCode) {
                    rental.smsCode = statusData.code;
                    rental.status = 'completed';
                    rental.fullSms = statusData.messages?.[0]?.text;
                    await rental.save();
                } else if (statusData.status !== rental.status && statusData.status !== 'completed') {
                    rental.status = statusData.status;
                    await rental.save();
                }

                return NextResponse.json({
                    success: true,
                    data: {
                        status: rental.status,
                        code: rental.smsCode,
                        messages: statusData.messages,
                        checkStatus: 'success'
                    }
                });
            }
        } catch (e) {
            // Not a VirtualNumber or invalid ID format (if different)
            // Continue to try Order
        }

        // 2. Try Find in Order (Legacy / DaisySMS System)
        // Order model uses different structure
        const order = await Order.findById(id);
        if (order) {
            // Assume DaisySMS for Orders (as per rent-number/order route)
            const status = await DaisySMS.getStatus(order.external_order_id);
            return NextResponse.json({ success: true, data: status });
        }

        return NextResponse.json(
            { success: false, error: 'Rental not found' },
            { status: 404 }
        );

    } catch (error: any) {
        console.error('Error in status check route:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
