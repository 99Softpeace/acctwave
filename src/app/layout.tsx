import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Outfit } from "next/font/google"; // Using Outfit for a modern feel
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Background from "@/components/layout/Background";
import PageWrapper from "@/components/layout/PageWrapper";
import { AuthProvider } from "@/context/AuthContext";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";
import { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/next";

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
  verification: {
    google: "JrTNIRXLOjlg2-dbOGBYgiH2L9hNt1RDZt2pBi1Mr2E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
               !function (w, d, t) {
               w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
               var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
               ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

               ttq.load('D5NBFOJC77U6NESDPE0G');
               ttq.page();
               }(window, document, 'ttq');
             `,
          }}
        />
      </head>
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
        <Analytics />
      </body>
    </html>
  );
}
