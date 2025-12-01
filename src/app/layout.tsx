import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Using Outfit for a modern feel
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Background from "@/components/layout/Background";
import PageWrapper from "@/components/layout/PageWrapper";
import { AuthProvider } from "@/context/AuthContext";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Acctwave | #1 SMM Panel & Virtual Numbers",
  description: "The most advanced SMM panel and virtual number service in Nigeria. Boost your social media presence instantly.",
  icons: {
    icon: '/acctwave_logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthSessionProvider>
          <AuthProvider>
            <Background />
            <Navbar />
            <PageWrapper>
              {children}
            </PageWrapper>
            <Footer />
            <Toaster position="top-right" />
          </AuthProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
