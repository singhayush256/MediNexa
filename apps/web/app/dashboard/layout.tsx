'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { normalizeRoleCode } from '@medinexa/validation';
import { getAuthorizedDashboardForRole } from '@/lib/auth-session';

/**
 * Enterprise RBAC Route Access Rules:
 * Strict whitelist of permitted roles for each dashboard route prefix.
 * Zero cross-portal access or user impersonation allowed.
 */
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Super Admin Platform
  '/dashboard/super-admin': ['SUPER_ADMIN', 'MEDINEXA_ADMIN'],
  '/dashboard/admin': ['HOSPITAL_ADMIN', 'ADMIN', 'EXECUTIVE'],
  '/dashboard/admin/backup': ['HOSPITAL_ADMIN', 'ADMIN'],

  // Executive & Admin Settings
  '/dashboard/command-center': ['HOSPITAL_ADMIN', 'ADMIN', 'EXECUTIVE'],
  '/dashboard/executive': ['HOSPITAL_ADMIN', 'ADMIN', 'EXECUTIVE'],
  '/dashboard/system-health': ['HOSPITAL_ADMIN', 'ADMIN', 'EXECUTIVE'],
  '/dashboard/audit': ['HOSPITAL_ADMIN', 'ADMIN', 'EXECUTIVE'],
  '/dashboard/security': ['HOSPITAL_ADMIN', 'ADMIN', 'EXECUTIVE'],
  '/dashboard/subscription': ['HOSPITAL_ADMIN', 'ADMIN', 'EXECUTIVE'],
  '/dashboard/analytics': ['HOSPITAL_ADMIN', 'ADMIN', 'EXECUTIVE'],
  '/dashboard/procurement': ['HOSPITAL_ADMIN', 'ADMIN', 'EXECUTIVE'],

  // Hospital Revenue & Finance
  '/dashboard/revenue': ['HOSPITAL_ADMIN', 'ADMIN', 'EXECUTIVE', 'BILLING_STAFF'],
  '/dashboard/finance': ['HOSPITAL_ADMIN', 'ADMIN', 'EXECUTIVE', 'BILLING_STAFF'],

  // Billing & Insurance Claims
  '/dashboard/billing': ['BILLING_STAFF'],
  '/dashboard/insurance': ['BILLING_STAFF', 'INSURANCE_COORDINATOR'],
  '/dashboard/claims': ['BILLING_STAFF', 'INSURANCE_COORDINATOR'],

  // Staff Management (HRMS) & Manager Operations
  '/dashboard/manager': ['MANAGER', 'HR_MANAGER', 'WARD_MANAGER'],
  '/dashboard/hrms': ['MANAGER', 'HR_MANAGER'],

  // Pharmacy & Prescriptions
  '/dashboard/pharmacy/prescriptions': ['PHARMACY_STAFF', 'PHARMACIST'],
  '/dashboard/pharmacy': ['PHARMACY_STAFF', 'PHARMACIST'],
  '/dashboard/inventory': ['PHARMACY_STAFF', 'PHARMACIST'],
  '/dashboard/medication-reminders': ['DOCTOR', 'NURSE', 'PHARMACY_STAFF', 'PHARMACIST'],

  // Laboratory, Radiology & Diagnostics
  '/dashboard/lab': ['LAB_STAFF', 'LAB_TECH', 'LAB_TECHNICIAN'],
  '/dashboard/laboratory': ['LAB_STAFF', 'LAB_TECH', 'LAB_TECHNICIAN'],
  '/dashboard/blood-bank': ['LAB_STAFF', 'LAB_TECH'],
  '/dashboard/radiology': ['RADIOLOGIST'],

  // Doctor Station & Clinical Consultations
  '/dashboard/doctors': ['DOCTOR'],
  '/dashboard/doctor-appointments': ['DOCTOR'],
  '/dashboard/doctor-queue': ['DOCTOR'],
  '/dashboard/telemedicine': ['DOCTOR'],
  '/dashboard/clinical': ['DOCTOR'],
  '/dashboard/copilot': ['DOCTOR'],
  '/dashboard/ot': ['DOCTOR', 'NURSE'],
  '/dashboard/icu': ['DOCTOR', 'NURSE', 'WARD_MANAGER'],

  // Nursing Care & Emergency
  '/dashboard/nursing': ['NURSE'],
  '/dashboard/nursing/mar': ['NURSE'],
  '/dashboard/emergency': ['EMERGENCY_STAFF', 'EMS_OPERATOR'],

  // Health Score & Family Doctor Station
  '/dashboard/health-score': ['DOCTOR', 'HOSPITAL_ADMIN'],
  '/dashboard/family-doctor': ['DOCTOR'],
  '/dashboard/patients/digital-twin': ['DOCTOR'],

  // Appointment Booking, Patients, Admissions & Front Desk
  '/dashboard/appointments': ['RECEPTIONIST', 'DOCTOR'],
  '/dashboard/patients': ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'BILLING_STAFF'],
  '/dashboard/admissions': ['RECEPTIONIST', 'NURSE', 'WARD_MANAGER'],
  '/dashboard/hospital/beds': ['RECEPTIONIST', 'NURSE', 'WARD_MANAGER', 'HOSPITAL_ADMIN'],
  '/dashboard/hospital': ['HOSPITAL_ADMIN', 'ADMIN'],
  '/dashboard/nearby-hospitals': ['HOSPITAL_ADMIN', 'ADMIN', 'EMS_OPERATOR', 'AMBULANCE_DRIVER'],
  '/dashboard/bed-bookings': ['RECEPTIONIST', 'WARD_MANAGER'],
  '/dashboard/opd': ['RECEPTIONIST', 'DOCTOR'],
  '/dashboard/reception': ['RECEPTIONIST'],
  '/dashboard/ward-manager': ['WARD_MANAGER'],
  '/dashboard/queue': ['RECEPTIONIST'],
  '/dashboard/triage': ['RECEPTIONIST', 'NURSE', 'EMERGENCY_STAFF'],
  '/dashboard/emergency-ambulance': ['AMBULANCE_DRIVER', 'EMS_OPERATOR'],
  '/dashboard/ambulance': ['AMBULANCE_DRIVER', 'EMS_OPERATOR'],
  '/dashboard/ems': ['AMBULANCE_DRIVER', 'EMS_OPERATOR'],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Check for authentication token
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

    // 2. Resolve normalized user role
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
    // Patients must NEVER access any /dashboard/* screen.
    if (normalizedRole === 'PATIENT') {
      setIsAuthorized(false);
      router.replace('/portal');
      return;
    }

    // 4. Role-specific redirection on root /dashboard
    if (pathname === '/dashboard') {
      if (['SUPER_ADMIN', 'MEDINEXA_ADMIN'].includes(normalizedRole)) {
        router.replace('/dashboard/super-admin');
        return;
      }
      if (['HOSPITAL_ADMIN', 'ADMIN', 'EXECUTIVE'].includes(normalizedRole)) {
        setIsAuthorized(true);
        return;
      }
      if (normalizedRole === 'RECEPTIONIST') {
        router.replace('/dashboard/reception');
        return;
      }
      if (['LAB_STAFF', 'LAB_TECH', 'LAB_TECHNICIAN'].includes(normalizedRole)) {
        router.replace('/dashboard/lab');
        return;
      }
      if (normalizedRole === 'RADIOLOGIST') {
        router.replace('/dashboard/radiology');
        return;
      }
      if (['PHARMACY_STAFF', 'PHARMACIST'].includes(normalizedRole)) {
        router.replace('/dashboard/pharmacy');
        return;
      }
      if (normalizedRole === 'BILLING_STAFF') {
        router.replace('/dashboard/billing');
        return;
      }
      if (['INSURANCE_COORDINATOR', 'INSURANCE_STAFF'].includes(normalizedRole)) {
        router.replace('/dashboard/insurance');
        return;
      }
      if (normalizedRole === 'NURSE') {
        router.replace('/dashboard/nursing');
        return;
      }
      if (['MANAGER', 'WARD_MANAGER', 'HR_MANAGER'].includes(normalizedRole)) {
        router.replace('/dashboard/manager');
        return;
      }
      if (['EMERGENCY_STAFF', 'EMS_OPERATOR'].includes(normalizedRole)) {
        router.replace('/dashboard/emergency');
        return;
      }
      if (normalizedRole === 'AMBULANCE_DRIVER') {
        router.replace('/dashboard/emergency-ambulance');
        return;
      }
      if (normalizedRole === 'DOCTOR') {
        router.replace('/dashboard/doctor-appointments');
        return;
      }
    }

    // 5. Strict role-level route isolation:
    // Check route permissions against the active role.
    // Impersonation and unauthorized navigation are strictly blocked and redirected
    // to the authenticated user's own single authorized portal.
    if (pathname && pathname !== '/dashboard') {
      const matchedPrefix = Object.keys(ROUTE_PERMISSIONS).find(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      );

      if (matchedPrefix) {
        const allowedRoles = ROUTE_PERMISSIONS[matchedPrefix];
        const hasAccess = allowedRoles.some((r) => normalizeRoleCode(r) === normalizedRole);

        if (!hasAccess) {
          setIsAuthorized(false);
          const authorizedPath = getAuthorizedDashboardForRole(normalizedRole);
          router.replace(authorizedPath);
          return;
        }
      }
    }

    setIsAuthorized(true);
  }, [router, pathname]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-blue-500/20 animate-pulse">
          M
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Verifying MediNexa RBAC Security Clearance...
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}
