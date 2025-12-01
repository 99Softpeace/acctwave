import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { initializePayment } from '@/lib/pocketfi';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { amount, email } = await req.json();

        if (!amount || amount < 100) {
            return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
        }

        // Generate a unique reference
        const reference = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

        // Initialize payment with PocketFi
        const paymentData = await initializePayment(email, amount, reference);

        if (paymentData.status === 'success') {
            return NextResponse.json({
                success: true,
                authorization_url: paymentData.data.authorization_url,
                reference: paymentData.data.reference
            });
        } else {
            return NextResponse.json({ success: false, message: paymentData.message || 'Payment initialization failed' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Payment initialization error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Internal server error',
            details: error.toString()
        }, { status: 500 });
    }
}
