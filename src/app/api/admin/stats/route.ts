import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is authenticated and is an admin
        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();

        // Fetch stats in parallel
        const [totalUsers, totalOrders, pendingOrders, revenueResult] = await Promise.all([
            User.countDocuments({}),
            Order.countDocuments({}),
            Order.countDocuments({ status: 'Pending' }),
            Order.aggregate([
                { $match: { status: { $ne: 'Canceled' } } }, // Exclude canceled orders
                { $group: { _id: null, total: { $sum: '$charge' } } }
            ])
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                totalOrders,
                pendingOrders,
                totalRevenue
            }
        });

    } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
