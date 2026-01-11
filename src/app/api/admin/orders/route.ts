import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import VirtualNumber from '@/models/VirtualNumber';
import Transaction from '@/models/Transaction';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        // Fetch up to (page * limit * 5) items from EACH collection to ensuring correct sorting across collections
        // This prevents recent items from one collection being "hidden" by generic limit cutoffs if another collection has many recent items.
        const fetchLimit = (page * limit) * 5;

        // 1. Build Queries
        const boostQuery: any = {};
        const rentalQuery: any = {};
        const miscQuery: any = {
            type: 'order'
        };

        if (status && status !== 'All') {
            // Map common status to specific model statuses
            // boost: Pending, In progress, Completed, Partial, Canceled, Processing
            // rental: active, completed, cancelled, expired, pending
            // misc (transaction): successful, pending, failed

            boostQuery.status = status;

            // Approximate mapping for others
            if (status === 'Completed') {
                rentalQuery.status = { $in: ['completed'] };
                miscQuery.status = 'successful';
            } else if (status === 'Pending') {
                rentalQuery.status = { $in: ['active', 'pending'] };
                miscQuery.status = 'pending';
            } else if (status === 'Canceled') {
                rentalQuery.status = { $in: ['cancelled', 'expired'] };
                miscQuery.status = { $in: ['failed', 'cancelled'] };
            } else {
                // Fallback: try to match string
                rentalQuery.status = status.toLowerCase();
                miscQuery.status = status.toLowerCase();
            }
        }

        // 2. Fetch Data in Parallel
        const [boosts, rentals, miscOrders] = await Promise.all([
            Order.find(boostQuery)
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .limit(fetchLimit)
                .lean(),
            VirtualNumber.find(rentalQuery)
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .limit(fetchLimit)
                .lean(),
            Transaction.find(miscQuery)
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .limit(fetchLimit)
                .lean(),
        ]);

        // 3. Normalize Data
        const normalizedBoosts = boosts.map((o: any) => ({
            _id: o._id,
            original_type: 'boost',
            user: o.user,
            service_name: o.service_name,
            link: o.link,
            quantity: o.quantity,
            charge: o.charge,
            status: o.status,
            createdAt: o.createdAt,
            external_order_id: o.external_order_id
        }));

        const normalizedRentals = rentals.map((r: any) => ({
            _id: r._id,
            original_type: 'rental',
            user: r.user,
            service_name: `Foreign Number - ${r.serviceName} (${r.countryName})`,
            link: r.number, // Display number as link
            quantity: 1,
            charge: r.price,
            status: r.status.charAt(0).toUpperCase() + r.status.slice(1), // Capitalize
            createdAt: r.createdAt,
            external_order_id: r.externalId,
            details: r.smsCode ? `Code: ${r.smsCode}` : 'Waiting for SMS...'
        }));

        const normalizedMisc = miscOrders.map((t: any) => {
            const isEsim = t.category === 'esim_purchase' || t.description?.toLowerCase().includes('esim') || t.metadata?.planId;
            return {
                _id: t._id,
                original_type: isEsim ? 'esim' : 'misc',
                user: t.user,
                service_name: t.description || (isEsim ? 'eSIM Purchase' : 'Service Order'),
                link: null,
                quantity: 1,
                charge: t.amount,
                status: t.status === 'successful' ? 'Completed' : (t.status.charAt(0).toUpperCase() + t.status.slice(1)),
                createdAt: t.createdAt,
                external_order_id: t.reference,
                details: isEsim ? (t.metadata?.planName || 'eSIM Data Plan') : (t.metadata?.network || t.category || '')
            };
        });

        // 4. Merge and Sort
        const allOrders = [...normalizedBoosts, ...normalizedRentals, ...normalizedMisc].sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // 5. Paginate
        const startIndex = (page - 1) * limit;
        const paginatedOrders = allOrders.slice(startIndex, startIndex + limit);

        // 6. Get Counts (Approximation for performance)
        // Note: Total pages might be slightly off due to the fetchLimit strategy, 
        // but it's a sufficient trade-off for not querying all documents every time.
        // For accurate counts, we'd need separate CountDocuments queries.
        const totalBoosts = await Order.countDocuments(boostQuery);
        const totalRentals = await VirtualNumber.countDocuments(rentalQuery);
        const totalMisc = await Transaction.countDocuments(miscQuery);
        const total = totalBoosts + totalRentals + totalMisc;

        return NextResponse.json({
            success: true,
            data: paginatedOrders,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error('Error fetching admin orders:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
