import './globals.css';
import React from 'react';

export const metadata = {
  title: 'MediNexa | Unified Hospital Management Platform',
  description:
    'Unified Hospital Management Platform for Modern Healthcare. Manage patients, appointments, admissions, pharmacy, laboratory, billing, insurance, emergency services, and telemedicine.',
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
      <body className="antialiased bg-white text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
