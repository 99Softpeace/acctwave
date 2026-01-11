import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import VirtualNumber from '@/models/VirtualNumber';
import Transaction from '@/models/Transaction';
import { authOptions } from '@/lib/auth';
import { getOrderStatus } from '@/lib/smm';
import { SMSPool } from '@/lib/smspool';

export const dynamic = 'force-dynamic';

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

        // Fetch ALL Transaction-based Services (eSIM, Data, Airtime, etc.)
        // Filter by type: 'order' covers all of these.
        const miscTransactions = await Transaction.find({
            user: (session.user as any).id,
            type: 'order'
        }).sort({ createdAt: -1 }).lean();

        console.log(`History API: User ${(session.user as any).id} - Found ${miscTransactions.length} Misc/Transaction Orders`);

        // Normalize and Combine
        const normalizedBoosts = boostOrders.map((o: any) => ({
            _id: o._id,
            type: 'boost',
            service_name: o.service_name === 'Modded App / Account' ? 'Social Media Logs' : o.service_name,
            link: o.link,
            quantity: o.quantity,
            charge: o.charge,
            status: o.status,
            start_count: o.start_count,
            remains: o.remains,
            createdAt: o.createdAt,
            external_order_id: o.external_order_id,
            code: o.code // Include credentials/details for logs
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
        const normalizedMisc = miscTransactions.map((t: any) => {
            const isEsim = t.category === 'esim_purchase' || t.description?.toLowerCase().includes('esim') || t.metadata?.planId;
            const od = t.metadata?.orderData || {};

            return {
                _id: t._id,
                type: isEsim ? 'esim' : 'misc',
                service_name: t.description || (isEsim ? 'eSIM Purchase' : 'Service Order'),
                charge: t.amount,
                status: t.status === 'successful' ? 'Completed' : t.status,
                createdAt: t.createdAt,
                // Mapped fields for eSIM
                qr_code: isEsim ? (od.qr_code || od.qr || od.image || od.qrCode || od.qr_code_url || od.qrUrl || od.iccid) : undefined,
                activation_code: isEsim ? (od.activation_code || od.code || od.activation || od.lpa || od.smdp_address || od.smdpAddress) : undefined,
                smdp_address: isEsim ? (od.smdp_address || od.smdp || od.server || od.smdpAddress) : undefined,
                plan_id: t.metadata?.planId,
                external_order_id: t.reference,
                // Mapped fields for Generic/Data
                details: isEsim ? (t.metadata?.planName || 'eSIM Data Plan') : (t.metadata?.network || t.category || '')
            };
        });

        const allOrders = [...normalizedBoosts, ...normalizedRentals, ...normalizedMisc].sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Optional: Update status from SMM provider for pending orders (Only for Boosts)
        await Promise.all(normalizedBoosts.map(async (order: any) => {
            const mutableStatuses = ['Pending', 'In progress', 'Processing', 'Partial'];
            if (mutableStatuses.includes(order.status) && order.external_order_id) {
                try {
                    const statusRes = await getOrderStatus(order.external_order_id);
                    // SMM providers usually return { status: "Completed", ... } or { order: "123", status: "Completed" }
                    // Adjust based on actual response. Assuming keys like 'status'
                    const remoteStatus = statusRes.status;

                    if (remoteStatus && remoteStatus !== order.status) {
                        console.log(`[Order Sync] Updating Order ${order._id}: ${order.status} -> ${remoteStatus}`);

                        // Update in DB
                        await Order.findByIdAndUpdate(order._id, { status: remoteStatus });

                        // Update in Response
                        order.status = remoteStatus;
                    }
                } catch (err) {
                    console.error(`[Order Sync] Failed to check status for ${order._id}:`, err);
                }
            }
        }));

        // Sync Virtual Number Rentals (Check for SMS Code)
        await Promise.all(normalizedRentals.map(async (rental: any) => {
            if (rental.status === 'Active' && rental.external_order_id) {
                try {
                    const check = await SMSPool.checkOrder(rental.external_order_id);
                    if (check.code) {
                        console.log(`[Rental Sync] Order ${rental._id} completed. Code: ${check.code}`);
                        await VirtualNumber.findByIdAndUpdate(rental._id, {
                            status: 'completed',
                            smsCode: check.code
                        });
                        rental.status = 'Completed';
                        rental.code = check.code;
                    }
                } catch (e) {
                    console.error(`[Rental Sync] Error for ${rental._id}:`, e);
                }
            }
        }));

        // Sync eSIM Transactions (Check for Profile/QR)
        await Promise.all(normalizedMisc.map(async (misc: any) => {
            // Only syncing statuses for actual eSIMs
            if (misc.type === 'esim') {
                const pendingStatuses = ['pending', 'processing', 'submitted'];
                if (pendingStatuses.includes(misc.status.toLowerCase()) && misc.external_order_id) {
                    try {
                        const details = await SMSPool.checkESIMOrder(misc.external_order_id);
                        if (details) {
                            console.log(`[eSIM Sync] Order ${misc._id} completed.`);

                            const tx = await Transaction.findById(misc._id);
                            if (tx) {
                                tx.status = 'successful';
                                tx.metadata = {
                                    ...tx.metadata,
                                    orderData: details
                                };
                                await tx.save();

                                misc.status = 'Completed';
                                misc.qr_code = details.qr_code;
                                misc.activation_code = details.activation_code;
                                misc.smdp_address = details.smdp_address;
                            }
                        }
                    } catch (e) {
                        console.error(`[eSIM Sync] Error for ${misc._id}:`, e);
                    }
                }
            }
        }));

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
