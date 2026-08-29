'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientAdmissionsPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/patient-portal/admissions`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setAdmissions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-black uppercase rounded-full">
              INPATIENT
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hospital Admissions History</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Inpatient hospital stays, attending medical team, and assigned bed locations.</p>
        </div>
        <Link href="/portal" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Portal
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading admission records...</div>
      ) : admissions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-4xl">🏥</div>
          <h3 className="font-extrabold text-sm text-slate-900">No Hospital Admissions</h3>
          <p className="text-xs text-slate-500">You have no recorded inpatient stays or hospital admissions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {admissions.map((adm) => (
            <div key={adm.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Admission #{adm.admissionNumber || adm.id.slice(0, 8)}</h3>
                  <div className="text-xs text-slate-500">
                    Admitted: {new Date(adm.admissionDate).toLocaleDateString()} {adm.dischargeDate ? `• Discharged: ${new Date(adm.dischargeDate).toLocaleDateString()}` : '• CURRENTLY ADMITTED'}
                  </div>
                </div>
                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${
                  adm.status === 'DISCHARGED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {adm.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Attending Doctor</div>
                  <div className="font-bold text-slate-800">
                    Dr. {adm.attendingDoctor?.user?.firstName} {adm.attendingDoctor?.user?.lastName || 'Chief Medical Officer'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Ward & Department</div>
                  <div className="font-bold text-slate-800">{adm.department?.name || 'Inpatient General Medicine'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
