'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, ShoppingBag, Smartphone, FileText, Settings, User } from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const guestLinks = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'API', href: '/api-docs' },
];

const userLinks = [
  { name: 'Dashboard', href: '/dashboard' },
];

const dashboardLinks = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Boost Social Media', href: '/dashboard/new-order', icon: ShoppingBag },
  { name: 'Virtual Numbers', href: '/dashboard/virtual-numbers', icon: Smartphone },
  { name: 'API Docs', href: '/api-docs', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  const isAuthenticated = status === 'authenticated';
  const visibleLinks = isAuthenticated ? userLinks : guestLinks;
  const mobileLinks = isAuthenticated ? dashboardLinks : guestLinks;

  if (isDashboard) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center gap-3 group">
            <div className="relative w-12 h-12">
              <Image
                src="/acctwave_logo.png"
                alt="Acctwave Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white group-hover:text-primary transition-colors">
              Acct<span className="text-primary">wave</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {visibleLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors group"
                >
                  {link.name}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(0,122,255,0.3)] hover:shadow-[0_0_20px_rgba(0,122,255,0.6)]"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{session?.user?.name || 'User'}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button - Hidden on Dashboard */}
          {!isDashboard && (
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden glass border-b border-white/5"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {mobileLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-white hover:bg-white/5 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                {/* @ts-ignore - icon exists on dashboard links */}
                {link.icon && <link.icon className="w-5 h-5" />}
                {link.name}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2 px-3">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    className="text-center text-gray-300 hover:text-white py-2 border border-white/10 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="text-center bg-primary text-white py-2 rounded-lg shadow-lg"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setIsOpen(false);
                  }}
                  className="text-center text-red-400 hover:text-red-300 py-2 border border-white/10 rounded-lg flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
