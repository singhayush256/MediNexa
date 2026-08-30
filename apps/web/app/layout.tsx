import './globals.css';
import React from 'react';

export const metadata = {
  title: 'MediNexa | AI-Powered Healthcare Operating System',
  description:
    'Unified enterprise healthcare operating system for hospitals, clinics, laboratories, pharmacies, telemedicine, diagnostics, insurance claims, and patient engagement.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
