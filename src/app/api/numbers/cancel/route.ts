import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import VirtualNumber from '@/models/VirtualNumber';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { numberId } = await req.json();

        await dbConnect();

        const virtualNumber = await VirtualNumber.findOne({
            _id: numberId,
            user: (session.user as any).id,
        });

        if (!virtualNumber) {
            return NextResponse.json({ message: 'Number not found' }, { status: 404 });
        }

        if (virtualNumber.status !== 'active') {
            return NextResponse.json({ message: 'Number is not active' }, { status: 400 });
        }

        // Refund logic: Only refund if NO SMS was received
        if (!virtualNumber.smsCode) {
            const user = await User.findById((session.user as any).id);
            if (user) {
                user.balance += virtualNumber.price;
                await user.save();
            }
        }

        virtualNumber.status = 'cancelled';
        await virtualNumber.save();

        return NextResponse.json({
            success: true,
            message: 'Number cancelled successfully',
        });

    } catch (error: any) {
        console.error('Error cancelling number:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
