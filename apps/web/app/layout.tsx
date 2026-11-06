import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import { DemoWalkthroughTour } from '@/components/demo/DemoWalkthroughTour';
import { OFFICIAL_PRODUCTION_FRONTEND_URL } from '@/lib/domain-config';

export const metadata: Metadata = {
  metadataBase: new URL(OFFICIAL_PRODUCTION_FRONTEND_URL),
  title: 'MediNexa | Connected Healthcare Platform for Modern Hospitals',
  description:
    'MediNexa unifies patient care, operations, diagnostics, pharmacy, billing, telemedicine and AI into one intelligent healthcare ecosystem.',
  alternates: {
    canonical: OFFICIAL_PRODUCTION_FRONTEND_URL,
  },
  openGraph: {
    title: 'MediNexa | Connected Healthcare Platform for Modern Hospitals',
    description:
      'MediNexa unifies patient care, operations, diagnostics, pharmacy, billing, telemedicine and AI into one intelligent healthcare ecosystem.',
    url: OFFICIAL_PRODUCTION_FRONTEND_URL,
    siteName: 'MediNexa Healthcare OS',
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('medinexa_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen selection:bg-blue-600 selection:text-white">
        {children}
        <DemoWalkthroughTour />
      </body>
    </html>
  );
}
