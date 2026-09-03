'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { normalizeRoleCode } from '@medinexa/validation';

/**
 * RBAC Route Access Rules: Defines permitted roles for each dashboard route prefix.
 */
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Executive & Command Center
  '/dashboard/command-center': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/executive': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/system-health': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/audit': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],

  // Revenue, Finance & Analytics
  '/dashboard/revenue': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'BILLING_STAFF'],
  '/dashboard/finance': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'BILLING_STAFF'],
  '/dashboard/analytics': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],

  // Billing & Insurance
  '/dashboard/billing': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'BILLING_STAFF', 'INSURANCE_COORDINATOR'],
  '/dashboard/insurance': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'INSURANCE_COORDINATOR', 'BILLING_STAFF'],
  '/dashboard/claims': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'INSURANCE_COORDINATOR', 'BILLING_STAFF'],

  // HRMS Workforce
  '/dashboard/hrms': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'],

  // Procurement & Inventory
  '/dashboard/procurement': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'PHARMACY_STAFF', 'PHARMACIST'],
  '/dashboard/inventory': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'PHARMACY_STAFF', 'PHARMACIST'],

  // Pharmacy
  '/dashboard/pharmacy': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'PHARMACY_STAFF', 'PHARMACIST', 'DOCTOR'],

  // Laboratory
  '/dashboard/lab': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'LAB_STAFF', 'DOCTOR'],
  '/dashboard/laboratory': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'LAB_STAFF', 'DOCTOR'],
  '/dashboard/blood-bank': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'LAB_STAFF', 'DOCTOR'],

  // Clinical & Nursing
  '/dashboard/nursing': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'NURSE', 'DOCTOR'],
  '/dashboard/doctors': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
  '/dashboard/doctor-appointments': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
  '/dashboard/doctor-queue': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
  '/dashboard/telemedicine': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
  '/dashboard/copilot': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE'],

  // Admissions, Inpatient Wards & Beds
  '/dashboard/admissions': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR'],
  '/dashboard/hospital': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR'],
  '/dashboard/patients': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR'],
  '/dashboard/appointments': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'],
  '/dashboard/emergency': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'NURSE', 'DOCTOR', 'RECEPTIONIST'],
  '/dashboard/ambulance': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'AMBULANCE_DRIVER', 'EMS_OPERATOR', 'RECEPTIONIST', 'DOCTOR', 'NURSE'],
  '/dashboard/ems': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'AMBULANCE_DRIVER', 'EMS_OPERATOR', 'RECEPTIONIST'],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Check for authentication token in browser storage
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('medinexa_token') ||
          localStorage.getItem('token') ||
          sessionStorage.getItem('medinexa_token')
        : null;

    if (!token) {
      setIsAuthorized(false);
      router.replace(`/login?redirect=${encodeURIComponent(pathname || '/dashboard')}`);
      return;
    }

    // 2. Decode user role from local storage or cached profile
    let roleCode = 'STAFF';
    const rawUser = localStorage.getItem('medinexa_user');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        roleCode = parsed.roleCode || (parsed.role && parsed.role.code) || parsed.role || 'STAFF';
      } catch (e) {}
    }

    const normalizedRole = normalizeRoleCode(roleCode);

    // 3. STRICT PATIENT ISOLATION:
    // If the authenticated user is a PATIENT, they must NEVER access /dashboard/* routes.
    // Immediately redirect them to their dedicated 24/7 Patient Portal.
    if (normalizedRole === 'PATIENT') {
      setIsAuthorized(false);
      router.replace('/portal');
      return;
    }

    // 4. SUPER_ADMIN holds universal clearance across all staff workstations
    if (normalizedRole === 'MEDINEXA_ADMIN') {
      setIsAuthorized(true);
      return;
    }

    // 5. Check route-level permissions against the active role
    if (pathname && pathname !== '/dashboard') {
      // Find matching route rule (matching exact or prefix)
      const matchedPrefix = Object.keys(ROUTE_PERMISSIONS).find(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      );

      if (matchedPrefix) {
        const allowedRoles = ROUTE_PERMISSIONS[matchedPrefix];
        const hasAccess = allowedRoles.some((r) => normalizeRoleCode(r) === normalizedRole);

        if (!hasAccess) {
          setIsAuthorized(false);
          router.replace('/unauthorized');
          return;
        }
      }
    }

    setIsAuthorized(true);
  }, [router, pathname]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-blue-500/20 animate-pulse">
          M
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Verifying MediNexa RBAC Security Clearance...
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
