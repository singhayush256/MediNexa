'use client';

import React from 'react';
import { ManagerSidebar } from '@/components/manager/ManagerSidebar';

export default function ManagerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
      <ManagerSidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
