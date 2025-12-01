import Link from 'next/link';
import { CreditCard, Building, Smartphone, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PaymentMethods() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Payment Methods
                </h1>
                <p className="text-gray-400">Secure and instant ways to fund your Acctwave wallet.</p>
            </div>

            <div className="space-y-8">
                {/* Introduction */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <p className="text-gray-400 leading-relaxed">
                        We offer a variety of secure payment options to ensure you can easily fund your wallet and start using our services instantly. All transactions are processed via secure gateways.
                    </p>
                </section>

                {/* Bank Transfer (Virtual Accounts) */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <Building className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold">1. Automated Bank Transfer</h2>
                    </div>
                    <div className="space-y-4 text-gray-400 leading-relaxed">
                        <p>
                            This is the most popular and recommended method. Upon registration, you are automatically assigned a unique <strong>Virtual Bank Account</strong> (e.g., Wema Bank, Moniepoint, or Sterling Bank).
                        </p>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <h3 className="font-bold text-white mb-2 text-sm">How it works:</h3>
                            <ol className="list-decimal pl-5 space-y-2 text-sm">
                                <li>Copy your unique account number from the "Fund Wallet" page.</li>
                                <li>Open your bank app and make a transfer to that account.</li>
                                <li>The system automatically detects the payment and credits your wallet instantly (usually within 1-5 minutes).</li>
                            </ol>
                        </div>
                        <p className="text-sm text-yellow-500 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Note: A small charge (e.g., ₦50) may apply for bank transfers depending on the gateway.
                        </p>
                    </div>
                </section>

                {/* Card Payments */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="w-6 h-6 text-purple-500" />
                        <h2 className="text-xl font-bold">2. Card Payments</h2>
                    </div>
                    <p className="text-gray-400 leading-relaxed mb-4">
                        We accept all major Nigerian debit cards including Visa, Mastercard, and Verve.
                    </p>
                    <ul className="space-y-2 text-gray-400 list-disc pl-5">
                        <li>Instant crediting.</li>
                        <li>Secured by Paystack/Flutterwave/Monnify.</li>
                        <li>We do not store your card details.</li>
                    </ul>
                </section>

                {/* Manual Funding */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <Smartphone className="w-6 h-6 text-green-500" />
                        <h2 className="text-xl font-bold">3. Manual Funding</h2>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                        If you are having trouble with automated methods or wish to fund via Crypto (USDT), you can contact our support team for manual funding instructions.
                    </p>
                    <div className="mt-4">
                        <Link href="https://chat.whatsapp.com/placeholder" target="_blank" className="text-green-500 hover:text-green-400 transition-colors font-medium text-sm">
                            Contact Support for Manual Funding &rarr;
                        </Link>
                    </div>
                </section>

                {/* Troubleshooting */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <HelpCircle className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-xl font-bold">Payment Issues?</h2>
                    </div>
                    <div className="space-y-4 text-gray-400 leading-relaxed">
                        <p>
                            If you made a transfer and your wallet hasn't been credited after 30 minutes:
                        </p>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Check if the money was reversed to your bank account.</li>
                            <li>Ensure you sent it to the <strong>correct</strong> virtual account number assigned to you.</li>
                            <li>Contact support with your <strong>Payment Receipt</strong> or <strong>Session ID</strong> for manual verification.</li>
                        </ol>
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center mt-8">
                    <Link
                        href="/dashboard/fund-wallet"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/25"
                    >
                        <CreditCard className="w-5 h-5" />
                        Fund Your Wallet Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
