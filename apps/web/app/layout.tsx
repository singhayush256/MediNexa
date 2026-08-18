import './globals.css';
import React from 'react';

export const metadata = {
  title: 'MediNexa - Connected Healthcare, One Platform',
  description: 'Clean, modular healthcare platform connecting patients, providers, hospitals, labs, and pharmacies.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-50 min-h-screen flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
