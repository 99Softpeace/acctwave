import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export default async function DebugAuthPage() {
    const session = await getServerSession(authOptions);
    let dbStatus = 'Not Checked';
    let dbUser = null;

    if (session?.user) {
        try {
            await dbConnect();
            // @ts-ignore
            const id = session.user.id;
            if (id) {
                dbUser = await User.findById(id).lean();
                dbStatus = dbUser ? 'Found' : 'Not Found';
            } else {
                dbStatus = 'No ID in Session';
            }
        } catch (e: any) {
            dbStatus = 'Error: ' + e.message;
        }
    }

    return (
        <div className="p-8 bg-black text-white font-mono whitespace-pre-wrap">
            <h1 className="text-xl font-bold mb-4">Auth Debugger</h1>

            <div className="border p-4 rounded mb-4 border-gray-700">
                <h2 className="text-green-400 font-bold">Session State (NextAuth)</h2>
                {JSON.stringify(session, null, 2)}
            </div>

            <div className="border p-4 rounded mb-4 border-gray-700">
                <h2 className="text-blue-400 font-bold">Database State (Realtime)</h2>
                <p>Status: {dbStatus}</p>
                {dbUser && (
                    <>
                        <p>ID: {dbUser._id.toString()}</p>
                        <p>Name: {dbUser.name}</p>
                        <p>Email: {dbUser.email}</p>
                        <p className="text-xl">
                            isSuspended:
                            <span className={dbUser.isSuspended ? 'text-red-500 font-bold ml-2' : 'text-green-500 font-bold ml-2'}>
                                {String(dbUser.isSuspended)}
                            </span>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
