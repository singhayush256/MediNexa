'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Building2,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { getHospitalProfile } from '@/lib/hospital-canonical-data';

export default function ManagerProfilePage() {
  const [manager, setManager] = useState({
    name: 'Rahul Verma',
    staffLoginId: 'MG.RAHUL-9137',
    role: 'Operations & Floor Manager',
    email: 'rahul.manager@medinexa.com',
    phone: '+91 98111 91370',
    department: 'Hospital Operational Command',
    hospitalName: 'MediNexa General Hospital (Hospital A)',
    facilityId: 'HOSPITAL_A',
    joinedDate: '12 January 2024',
    shift: 'Morning Operations (08:00 - 16:00)',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeHosp = localStorage.getItem('medinexa_active_hospital_id') || 'HOSPITAL_A';
      const prof = getHospitalProfile(null, activeHosp);
      if (prof?.name) {
        setManager((prev) => ({
          ...prev,
          hospitalName: prof.name,
          facilityId: activeHosp,
        }));
      }

      const uStr = localStorage.getItem('medinexa_user');
      if (uStr) {
        try {
          const u = JSON.parse(uStr);
          setManager((prev) => ({
            ...prev,
            name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : prev.name,
            email: u.email || prev.email,
            staffLoginId: u.staffLoginId || prev.staffLoginId,
          }));
        } catch (e) {}
      }
    }
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Manager Personnel Profile</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Operational Identity & Credentials
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational credentials, canonical staff login ID, active duty shift, and security authority.
          </p>
        </div>
      </div>

      {/* Identity Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-teal-600/20 shrink-0">
            {manager.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {manager.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                {manager.staffLoginId}
              </span>
              <span className="text-xs text-slate-500 font-semibold">• {manager.role}</span>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Staff
              </span>
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400 font-bold block">Assigned Hospital Facility:</span>
            <div className="font-extrabold text-slate-900 dark:text-white">
              {manager.hospitalName}
            </div>
            <div className="text-[11px] font-mono text-teal-600 font-semibold">
              Context: {manager.facilityId}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400 font-bold block">Operational Shift:</span>
            <div className="font-extrabold text-slate-900 dark:text-white">
              {manager.shift}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold">
              Daily handover required at 15:45
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400 font-bold block">Email:</span>
            <div className="font-semibold text-slate-900 dark:text-white">{manager.email}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400 font-bold block">Emergency Phone:</span>
            <div className="font-semibold text-slate-900 dark:text-white">{manager.phone}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
