import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import HowItWorks from '@/components/home/HowItWorks';
import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col gap-0">
      <Hero />
      {/* Assuming Features component will be added here later */}
      {/* <Features /> */}
      <HowItWorks />
      {/* Assuming Testimonials component will be added here later */}
      {/* <Testimonials /> */}
      <Stats />

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto glass-card rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Go Viral?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of Nigerian creators and businesses boosting their presence today.
            Instant delivery, secure payments, and 24/7 support.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
