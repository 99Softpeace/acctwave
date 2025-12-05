import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Features from "@/components/home/Features";
import HowItWorks from '@/components/home/HowItWorks';
import FAQ from '@/components/home/FAQ';
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
      <Stats />
      <Features />
      <HowItWorks />
      <FAQ />
    </div>
  );
}
