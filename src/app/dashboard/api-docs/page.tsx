'use client';

import { useState, useEffect } from 'react';
import { Copy, RefreshCw, Eye, EyeOff, Code, Terminal, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ApiDocsPage() {
    const [apiKey, setApiKey] = useState('Loading...');
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => {
        fetchApiKey();
    }, []);

    const fetchApiKey = async () => {
        try {
            const res = await fetch('/api/user/api-key');
            const data = await res.json();
            if (data.success) {
                setApiKey(data.apiKey);
            }
        } catch (error) {
            console.error('Failed to fetch API key', error);
        } finally {
            setLoading(false);
        }
    };

    const generateNewKey = async () => {
        if (!confirm('Are you sure? This will invalidate your old key immediately.')) return;

        setRegenerating(true);
        try {
            const res = await fetch('/api/user/api-key', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setApiKey(data.apiKey);
                toast.success('New API key generated');
            }
        } catch (error) {
            toast.error('Failed to generate key');
        } finally {
            setRegenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">API Documentation</h1>
                <p className="text-gray-400">Integrate our services directly into your application.</p>
            </div>

            {/* API Key Section */}
            <div className="glass-card p-6 rounded-2xl border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Code className="w-6 h-6 text-primary" />
                    Your API Key
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                    Keep this key secret. It allows full access to your account.
                </p>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full bg-black/30 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                        <code className="font-mono text-blue-300 break-all">
                            {loading ? 'Loading...' : (showKey ? apiKey : 'sk_live_••••••••••••••••••••••••')}
                        </code>
                        <div className="flex items-center gap-2 ml-4 shrink-0">
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                disabled={loading}
                            >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                disabled={loading}
                            >
                                {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={generateNewKey}
                        disabled={loading || regenerating}
                        className="w-full md:w-auto px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                        {regenerating ? 'Generating...' : 'Generate New Key'}
                    </button>
                </div>
            </div>

            {/* Documentation Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Endpoints */}
                    <div className="glass-card p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4">Endpoints</h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold">POST</span>
                                    <code className="text-sm text-gray-300">/api/v2/order</code>
                                </div>
                                <p className="text-sm text-gray-400">Place a new order for any service.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">GET</span>
                                    <code className="text-sm text-gray-300">/api/v2/status/{'{order_id}'}</code>
                                </div>
                                <p className="text-sm text-gray-400">Check the status of an existing order.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">GET</span>
                                    <code className="text-sm text-gray-300">/api/v2/services</code>
                                </div>
                                <p className="text-sm text-gray-400">Get a list of all available services and prices.</p>
                            </div>
                        </div>
                    </div>

                    {/* Example Request */}
                    <div className="glass-card p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4">Example Request</h3>
                        <div className="bg-[#0d1117] rounded-xl p-4 overflow-x-auto border border-white/10">
                            <pre className="text-sm font-mono text-gray-300">
                                {`curl -X POST https://api.acctwave.com/v2/order \\
  -H "Authorization: Bearer sk_live_..." \\
  -d "service=123" \\
  -d "link=https://instagram.com/user" \\
  -d "quantity=1000"`}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Sidebar/Info */}
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4">Rate Limits</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex justify-between">
                                <span>Requests per minute</span>
                                <span className="text-white font-mono">60</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Requests per hour</span>
                                <span className="text-white font-mono">1000</span>
                            </li>
                        </ul>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-white/5 bg-blue-500/5">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-blue-400" />
                            Need Help?
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Check out our full documentation or contact developer support.
                        </p>
                        <button className="w-full py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors">
                            View Full Docs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
