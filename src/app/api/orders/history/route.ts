import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import VirtualNumber from '@/models/VirtualNumber';
import Transaction from '@/models/Transaction';
import { authOptions } from '@/lib/auth';
import { getOrderStatus } from '@/lib/smm';
import { SMSPool } from '@/lib/smspool';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Fetch Boost orders
        const boostOrders = await Order.find({ user: (session.user as any).id })
            .lean();

        // Fetch Virtual Number rentals
        const rentalOrders = await VirtualNumber.find({ user: (session.user as any).id })
            .lean();

        // Fetch eSIM Transactions (including legacy ones missing category)
        const esimTransactions = await Transaction.find({
            user: (session.user as any).id,
            $or: [
                { category: 'esim_purchase' },
                { description: { $regex: 'eSIM Purchase', $options: 'i' } }
            ]
        }).sort({ createdAt: -1 }).lean();

        console.log(`History API: User ${(session.user as any).id} - Found ${esimTransactions.length} eSIMs`);

        // Normalize and Combine
        const normalizedBoosts = boostOrders.map((o: any) => ({
            _id: o._id,
            type: 'boost',
            service_name: o.service_name,
            link: o.link,
            quantity: o.quantity,
            charge: o.charge,
            status: o.status,
            start_count: o.start_count,
            remains: o.remains,
            createdAt: o.createdAt,
            external_order_id: o.external_order_id
        }));

        const normalizedRentals = rentalOrders.map((r: any) => ({
            _id: r._id,
            type: 'rental',
            service_name: r.serviceName || 'Virtual Number',
            phone: r.number,
            code: r.smsCode,
            charge: r.price,
            status: r.status === 'active' ? 'Active' : r.status === 'completed' ? 'Completed' : 'Canceled',
            createdAt: r.createdAt,
            expiresAt: r.expiresAt,
            external_order_id: r.externalId
        }));

        // Normalize and Combine
        // Self-heal eSIM orders: Check for missing codes and fetch them (Robust version)
        const normalizedEsims = esimTransactions.map((t: any) => {
            const od = t.metadata?.orderData || {};
            return {
                _id: t._id,
                type: 'esim',
                service_name: t.description || 'eSIM Purchase',
                charge: t.amount,
                status: t.status === 'successful' ? 'Completed' : t.status,
                createdAt: t.createdAt,
                // Mapped fields
                qr_code: od.qr_code || od.qr || od.image || od.qrCode || od.qr_code_url || od.qrUrl || od.iccid,
                activation_code: od.activation_code || od.code || od.activation || od.lpa || od.smdp_address || od.smdpAddress,
                smdp_address: od.smdp_address || od.smdp || od.server || od.smdpAddress,
                plan_id: t.metadata?.planId,
                external_order_id: t.reference
            };
        });

        const allOrders = [...normalizedBoosts, ...normalizedRentals, ...normalizedEsims].sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Optional: Update status from SMM provider for pending orders (Only for Boosts)
        // ... (We can skip re-checking rentals here as active/route handles that)

        return NextResponse.json({
            success: true,
            data: allOrders,
        });

    } catch (error: any) {
        console.error('Error fetching order history:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
