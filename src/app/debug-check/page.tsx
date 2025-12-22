import dbConnect from '@/lib/db';
import DebugLog from '@/models/DebugLog';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DebugLogsPage() {
    // Basic security: Obscure URL slightly or assume dev usage.
    // For now, open access is fine for temporary debugging.

    await dbConnect();
    const logs = await DebugLog.find().sort({ timestamp: -1, _id: -1 }).limit(20).lean();

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px' }}>
            <h1>Webhook Debug Logs (Production)</h1>
            <p>Refreshed: {new Date().toISOString()}</p>
            <hr />
            {logs.length === 0 ? <p>No logs found.</p> : (
                logs.map((log: any) => (
                    <div key={log._id} style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '10px' }}>
                        <div><strong>Time:</strong> {new Date(log.timestamp || log.createdAt).toLocaleString()}</div>
                        <div><strong>Source:</strong> {log.source} ({log.type})</div>
                        <div><strong>Message:</strong> {log.message}</div>
                        <pre style={{ background: '#f0f0f0', padding: '5px', overflowX: 'scroll' }}>
                            {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                    </div>
                ))
            )}
        </div>
    );
}
