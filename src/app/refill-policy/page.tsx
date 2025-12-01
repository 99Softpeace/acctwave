import Link from 'next/link';
import { RefreshCw, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export default function RefillPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Refill Policy
                </h1>
                <p className="text-gray-400">Understanding how our service guarantees work.</p>
            </div>

            <div className="space-y-8">
                {/* What is Refill? */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <RefreshCw className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold">What is a Refill?</h2>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                        In the world of Social Media Marketing (SMM), "drops" can happen. This means the number of followers, likes, or views you purchased might decrease over time due to social media platforms updating their algorithms or removing inactive accounts.
                    </p>
                    <p className="text-gray-400 leading-relaxed mt-4">
                        A <strong>Refill</strong> is a free service we provide to restore your count to the original purchased amount if it drops within a specific warranty period.
                    </p>
                </section>

                {/* Service Types */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <h2 className="text-xl font-bold">Service Categories</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Refill Guaranteed (R30, R60, R365)
                            </h3>
                            <p className="text-sm text-gray-400">
                                These services come with a warranty. If you experience a drop within the specified period (e.g., 30 days for R30), simply click the "Refill" button on your orders page, and the system will automatically replenish your count.
                            </p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                No Refill
                            </h3>
                            <p className="text-sm text-gray-400">
                                These services are cheaper but come with <strong>NO WARRANTY</strong>. If the count drops 5 minutes or 5 months after purchase, we cannot refill it or offer a refund. Purchase these at your own risk.
                            </p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Auto Refill
                            </h3>
                            <p className="text-sm text-gray-400">
                                The system automatically detects drops and refills them without you needing to take any action. This is the most premium and stable option.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Conditions */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-xl font-bold">Refill Conditions</h2>
                    </div>
                    <ul className="space-y-3 text-gray-400 list-disc pl-5">
                        <li>
                            The refill button usually appears 24 hours after the order is completed.
                        </li>
                        <li>
                            Refills are only available if the current count is less than the start count + purchased quantity.
                        </li>
                        <li>
                            If you change your username or make your account private during the warranty period, the refill warranty is <strong>voided</strong>.
                        </li>
                        <li>
                            We cannot refill an order if you have placed a new order for the same link while the previous one is dropping. This overlaps the data and makes it impossible to track.
                        </li>
                    </ul>
                </section>

                {/* Processing Time */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-6 h-6 text-purple-500" />
                        <h2 className="text-xl font-bold">Processing Time</h2>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                        Refill requests are typically processed within 0-24 hours. However, in some cases (e.g., during major social media updates), it may take up to 72 hours. If your refill is not processed after 72 hours, please open a support ticket.
                    </p>
                </section>

                {/* Contact */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                    <h2 className="text-xl font-bold mb-4">Need Help?</h2>
                    <p className="text-gray-400 leading-relaxed">
                        If you are unsure which service to choose, always look for the "Refill" or "Guaranteed" tag in the service name. For further assistance, contact our support team.
                    </p>
                    <div className="mt-6">
                        <Link href="/dashboard/tickets" className="text-primary hover:text-blue-400 transition-colors font-medium">
                            Open Support Ticket &rarr;
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
