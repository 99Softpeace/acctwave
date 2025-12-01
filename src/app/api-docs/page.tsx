'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Terminal, Copy, Check, ChevronRight, Lock, Globe, Zap } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

export default function ApiDocsPage() {
    const [activeSection, setActiveSection] = useState('introduction');
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sections = [
        { id: 'introduction', title: 'Introduction' },
        { id: 'authentication', title: 'Authentication' },
        { id: 'endpoints', title: 'Endpoints' },
        { id: 'examples', title: 'Code Examples' },
    ];

    const codeExamples = {
        curl: `curl -X POST https://acctwave.com/api/v1/order \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": 123,
    "link": "https://instagram.com/user",
    "quantity": 1000
  }'`,
        nodejs: `const axios = require('axios');

async function placeOrder() {
  try {
    const response = await axios.post('https://acctwave.com/api/v1/order', {
      service: 123,
      link: 'https://instagram.com/user',
      quantity: 1000
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

placeOrder();`,
        python: `import requests

url = "https://acctwave.com/api/v1/order"
payload = {
    "service": 123,
    "link": "https://instagram.com/user",
    "quantity": 1000
}
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar Navigation */}
                    <div className="lg:w-64 flex-shrink-0 hidden lg:block">
                        <div className="sticky top-24 space-y-1">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
                                Documentation
                            </h3>
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between group ${activeSection === section.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {section.title}
                                    {activeSection === section.id && (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <div className="space-y-16">

                            {/* Header */}
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                                    <Terminal className="w-3 h-3" />
                                    API v1.0
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                                    API Documentation
                                </h1>
                                <p className="text-xl text-gray-400 max-w-2xl">
                                    Integrate Acctwave's powerful SMM services directly into your applications.
                                    Automate orders, check status, and manage your account programmatically.
                                </p>
                            </div>

                            {/* Introduction */}
                            <section id="introduction" className="space-y-6 scroll-mt-24">
                                <div className="flex items-center gap-3 text-2xl font-bold text-white">
                                    <Globe className="w-6 h-6 text-primary" />
                                    <h2>Introduction</h2>
                                </div>
                                <div className="prose prose-invert max-w-none text-gray-400">
                                    <p>
                                        The Acctwave API is built on REST principles. We enforce HTTPS in every request to improve data security, integrity, and privacy.
                                        The API does not support HTTP requests.
                                    </p>
                                    <p>
                                        All responses are returned in <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">JSON</code> format.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                                                <Zap className="w-5 h-5 text-green-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-2">High Performance</h3>
                                            <p className="text-sm">Optimized for speed with 99.9% uptime guarantee.</p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                                                <Lock className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
                                            <p className="text-sm">Bank-grade encryption and secure token authentication.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Authentication */}
                            <section id="authentication" className="space-y-6 scroll-mt-24">
                                <div className="flex items-center gap-3 text-2xl font-bold text-white">
                                    <Lock className="w-6 h-6 text-primary" />
                                    <h2>Authentication</h2>
                                </div>
                                <div className="space-y-4 text-gray-400">
                                    <p>
                                        Authenticate your API requests by including your API key in the <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">Authorization</code> header of every request.
                                        You can manage your API keys in the <a href="/dashboard/settings" className="text-primary hover:underline">Dashboard Settings</a>.
                                    </p>

                                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                                            <span className="text-xs font-mono text-gray-400">Header Format</span>
                                        </div>
                                        <div className="p-4 font-mono text-sm text-green-400">
                                            Authorization: Bearer YOUR_API_KEY
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Endpoints */}
                            <section id="endpoints" className="space-y-8 scroll-mt-24">
                                <div className="flex items-center gap-3 text-2xl font-bold text-white">
                                    <Code className="w-6 h-6 text-primary" />
                                    <h2>Endpoints</h2>
                                </div>

                                {/* Add Order */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-md bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/30">POST</span>
                                        <code className="text-lg text-white">/api/v1/order</code>
                                    </div>
                                    <p className="text-gray-400">Place a new order for a service.</p>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="py-3 px-4 text-sm font-medium text-gray-300">Parameter</th>
                                                    <th className="py-3 px-4 text-sm font-medium text-gray-300">Type</th>
                                                    <th className="py-3 px-4 text-sm font-medium text-gray-300">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm text-gray-400">
                                                <tr className="border-b border-white/5">
                                                    <td className="py-3 px-4 font-mono text-primary">service</td>
                                                    <td className="py-3 px-4">integer</td>
                                                    <td className="py-3 px-4">Service ID (see Services list)</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="py-3 px-4 font-mono text-primary">link</td>
                                                    <td className="py-3 px-4">string</td>
                                                    <td className="py-3 px-4">Link to the target (post, profile, etc.)</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="py-3 px-4 font-mono text-primary">quantity</td>
                                                    <td className="py-3 px-4">integer</td>
                                                    <td className="py-3 px-4">Amount to order</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Order Status */}
                                <div className="space-y-4 pt-8 border-t border-white/10">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 text-sm font-bold border border-blue-500/30">POST</span>
                                        <code className="text-lg text-white">/api/v1/status</code>
                                    </div>
                                    <p className="text-gray-400">Check the status of an existing order.</p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="py-3 px-4 text-sm font-medium text-gray-300">Parameter</th>
                                                    <th className="py-3 px-4 text-sm font-medium text-gray-300">Type</th>
                                                    <th className="py-3 px-4 text-sm font-medium text-gray-300">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm text-gray-400">
                                                <tr className="border-b border-white/5">
                                                    <td className="py-3 px-4 font-mono text-primary">order</td>
                                                    <td className="py-3 px-4">integer</td>
                                                    <td className="py-3 px-4">Order ID returned from order creation</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>

                            {/* Code Examples */}
                            <section id="examples" className="space-y-6 scroll-mt-24">
                                <div className="flex items-center gap-3 text-2xl font-bold text-white">
                                    <Terminal className="w-6 h-6 text-primary" />
                                    <h2>Code Examples</h2>
                                </div>

                                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(codeExamples.nodejs)}
                                            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                                        >
                                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copied ? 'Copied!' : 'Copy Code'}
                                        </button>
                                    </div>
                                    <div className="p-4 overflow-x-auto">
                                        <pre className="text-sm font-mono text-gray-300">
                                            <code>{codeExamples.nodejs}</code>
                                        </pre>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
