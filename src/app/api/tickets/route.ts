import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const tickets = await Ticket.find({ user: (session.user as any).id }).sort({ updatedAt: -1 });

        return NextResponse.json({ success: true, data: tickets });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { subject, message, priority } = await req.json();

        if (!subject || !message) {
            return NextResponse.json({ success: false, error: 'Subject and message are required' }, { status: 400 });
        }

        const ticket = await Ticket.create({
            user: (session.user as any).id,
            subject,
            priority: priority || 'Low',
            messages: [{
                sender: 'user',
                message,
            }],
        });

        return NextResponse.json({ success: true, data: ticket });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
