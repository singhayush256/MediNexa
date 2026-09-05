'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { normalizeRoleCode } from '@medinexa/validation';
import { MediNexaChatWidget } from '@/components/ai/MediNexaChatWidget';

/**
 * Enterprise RBAC Route Access Rules:
 * Strict whitelist of permitted roles for each dashboard route prefix.
 */
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Super Admin Platform
  '/dashboard/super-admin': ['SUPER_ADMIN', 'MEDINEXA_ADMIN'],
  '/dashboard/admin/backup': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],

  // Executive, Command Center & Admin Settings
  '/dashboard/command-center': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'EMS_OPERATOR'],
  '/dashboard/executive': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/system-health': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/audit': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/subscription': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/analytics': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/procurement': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN'],

  // Hospital Revenue & Finance
  '/dashboard/revenue': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'BILLING_STAFF'],
  '/dashboard/finance': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'BILLING_STAFF'],

  // Billing & Insurance Claims
  '/dashboard/billing': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'BILLING_STAFF', 'INSURANCE_COORDINATOR'],
  '/dashboard/insurance': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'INSURANCE_COORDINATOR'],
  '/dashboard/claims': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'INSURANCE_COORDINATOR'],

  // Staff Management (HRMS)
  '/dashboard/hrms': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'],

  // Pharmacy & Prescriptions
  '/dashboard/pharmacy/prescriptions': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'PHARMACY_STAFF', 'PHARMACIST'],
  '/dashboard/pharmacy': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'PHARMACY_STAFF', 'PHARMACIST'],
  '/dashboard/inventory': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'PHARMACY_STAFF', 'PHARMACIST'],
  '/dashboard/medication-reminders': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'PHARMACY_STAFF', 'PHARMACIST', 'PATIENT'],

  // Laboratory & Diagnostics
  '/dashboard/lab': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'LAB_STAFF', 'DOCTOR'],
  '/dashboard/laboratory': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'LAB_STAFF', 'DOCTOR'],
  '/dashboard/blood-bank': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'LAB_STAFF', 'DOCTOR'],
  '/dashboard/radiology': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'LAB_STAFF', 'DOCTOR'],

  // Doctor Station & Clinical Consultations
  '/dashboard/doctors': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
  '/dashboard/doctor-appointments': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
  '/dashboard/doctor-queue': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
  '/dashboard/telemedicine': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR'],
  '/dashboard/clinical': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE'],
  '/dashboard/copilot': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE'],
  '/dashboard/ot': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE'],
  '/dashboard/icu': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE'],

  // Nursing Care & Inpatient
  '/dashboard/nursing': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'NURSE'],
  '/dashboard/emergency': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'NURSE', 'DOCTOR'],

  // Appointment Booking & Patient Registration
  '/dashboard/appointments': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST'],
  '/dashboard/patients': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
  '/dashboard/admissions': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
  // Hospital Facilities & Live Beds
  '/dashboard/hospital/beds': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
  '/dashboard/hospital': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
  '/dashboard/nearby-hospitals': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'EMS_OPERATOR'],
  '/dashboard/bed-bookings': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
  '/dashboard/opd': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST'],
  '/dashboard/queue': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST'],
  '/dashboard/triage': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
  '/dashboard/ambulance': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'AMBULANCE_DRIVER', 'EMS_OPERATOR'],
  '/dashboard/ems': ['HOSPITAL_ADMIN', 'MEDINEXA_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'AMBULANCE_DRIVER', 'EMS_OPERATOR'],
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
      if (normalizedRole === 'RECEPTIONIST') {
        router.replace('/dashboard/appointments');
        return;
      }
      if (['LAB_STAFF', 'LAB_TECH', 'LAB_TECHNICIAN'].includes(normalizedRole)) {
        router.replace('/dashboard/lab');
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
      if (normalizedRole === 'DOCTOR') {
        router.replace('/dashboard/doctors');
        return;
      }
    }

    // 5. SUPER_ADMIN holds universal clearance across all hospital and platform screens
    if (['MEDINEXA_ADMIN', 'SUPER_ADMIN'].includes(normalizedRole)) {
      setIsAuthorized(true);
      return;
    }

    // 6. Check route-level permissions against the active role
    if (pathname && pathname !== '/dashboard') {
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

  return (
    <>
      {children}
      <MediNexaChatWidget />
    </>
  );
}
