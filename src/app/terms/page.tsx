import Link from 'next/link';
import { FileText, Shield, AlertCircle, HelpCircle } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Terms of Service
                </h1>
                <p className="text-gray-400">Last updated: November 29, 2025</p>
            </div>

            <div className="space-y-8">
                {/* Introduction */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                        By accessing and using Acctwave ("the Platform"), you agree to be bound by these Terms of Service.
                        These terms apply to all visitors, users, and others who access or use the Service.
                        If you disagree with any part of the terms, then you may not access the Service.
                    </p>
                </section>

                {/* Services */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-6 h-6 text-purple-500" />
                        <h2 className="text-xl font-bold">2. Description of Services</h2>
                    </div>
                    <div className="space-y-4 text-gray-400 leading-relaxed">
                        <p>
                            Acctwave provides a variety of digital services, including but not limited to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Social Media Marketing (SMM) services (likes, followers, views, etc.)</li>
                            <li>Virtual Top-Up (VTU) services for Airtime and Data bundles</li>
                            <li>Virtual Phone Number rentals and verification services</li>
                            <li>Utility bill payments (Electricity, Cable TV)</li>
                        </ul>
                        <p className="mt-4">
                            We act as an intermediary between you and various service providers. While we strive for high quality,
                            we do not guarantee the permanent stability of services provided by third parties (e.g., social media platforms may update their algorithms).
                        </p>
                    </div>
                </section>

                {/* User Accounts */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-xl font-bold">3. User Accounts & Security</h2>
                    </div>
                    <div className="space-y-4 text-gray-400 leading-relaxed">
                        <p>
                            When you create an account with us, you must provide information that is accurate, complete, and current at all times.
                            Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                        </p>
                        <p>
                            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                        </p>
                    </div>
                </section>

                {/* Payments & Refunds */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <HelpCircle className="w-6 h-6 text-green-500" />
                        <h2 className="text-xl font-bold">4. Payments & Refunds</h2>
                    </div>
                    <div className="space-y-4 text-gray-400 leading-relaxed">
                        <p>
                            <strong>Wallet Funding:</strong> Funds deposited into your Acctwave wallet are generally non-refundable and can only be used for purchasing services on the platform.
                        </p>
                        <p>
                            <strong>Order Refunds:</strong>
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>SMM Orders:</strong> Refunds are automatically processed to your wallet if an order is canceled or cannot be completed by the server.
                                However, orders placed for "No Refill" services are at your own risk.
                            </li>
                            <li>
                                <strong>VTU/Data:</strong> Please ensure you enter the correct phone number. We cannot reverse airtime or data transactions sent to the wrong number.
                            </li>
                            <li>
                                <strong>Virtual Numbers:</strong> Numbers are provided for verification purposes. If a code is not received within the stipulated time, the fee is typically reversed.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Prohibited Use */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <h2 className="text-xl font-bold mb-4">5. Prohibited Use</h2>
                    <p className="text-gray-400 leading-relaxed">
                        You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the service.
                        This includes, but is not limited to, using the service for fraud, money laundering, or harassment.
                    </p>
                </section>

                {/* Limitation of Liability */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <h2 className="text-xl font-bold mb-4">6. Limitation of Liability</h2>
                    <p className="text-gray-400 leading-relaxed">
                        In no event shall Acctwave, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages,
                        including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                    </p>
                </section>

                {/* Contact */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <h2 className="text-xl font-bold mb-4">7. Contact Us</h2>
                    <p className="text-gray-400 leading-relaxed">
                        If you have any questions about these Terms, please contact us via our support channels or join our community on Telegram.
                    </p>
                    <div className="mt-6">
                        <Link href="https://chat.whatsapp.com/placeholder" target="_blank" className="text-green-500 hover:text-green-400 transition-colors font-medium">
                            Join WhatsApp Community &rarr;
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
