import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userId = (session.user as any).id;
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Simple queries to avoid aggregation issues
        // Optimized aggregation for stats
        const stats = await Order.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: '$charge' },
                    totalOrders: { $count: {} },
                    activeOrders: {
                        $sum: {
                            $cond: [{ $in: ['$status', ['Pending', 'Processing', 'In progress']] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const totalSpent = stats[0]?.totalSpent || 0;
        const totalOrders = stats[0]?.totalOrders || 0;
        const activeOrders = stats[0]?.activeOrders || 0;

        const recentOrders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const formattedRecentOrders = recentOrders.map(order => ({
            id: `#${(order.external_order_id || order._id).toString().slice(-6)}`,
            service: order.service_name,
            link: order.link,
            quantity: order.quantity,
            status: order.status,
            date: new Date(order.createdAt).toLocaleDateString()
        }));

        return NextResponse.json({
            success: true,
            data: {
                name: user.name,
                balance: user.balance,
                totalSpent,
                activeOrders,
                totalOrders,
                recentOrders: formattedRecentOrders
            }
        });

    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
