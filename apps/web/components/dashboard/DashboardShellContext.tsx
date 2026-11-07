'use client';

import React, { createContext, useContext } from 'react';

const DashboardShellContext = createContext<boolean>(false);

export const DashboardShellProvider = DashboardShellContext.Provider;

export const useDashboardShell = () => useContext(DashboardShellContext);

