'use client';

import React, { createContext, useContext } from 'react';

interface DashboardShellContextValue {
  inShell: boolean;
}

const DashboardShellContext = createContext<DashboardShellContextValue>({
  inShell: false,
});

export function DashboardShellProvider({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShellContext.Provider value={{ inShell: true }}>
      {children}
    </DashboardShellContext.Provider>
  );
}

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}
