'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HrmsPayrollSubPage() {
  const [payrolls, setPayrolls] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/hrms/payroll`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setPayrolls(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Payroll Processing Workstation & Payslips</h1>
          <p className="text-xs text-slate-500 mt-1">Automated salary disbursement runs, tax deductions (PF/ESI), and downloadable employee payslips.</p>
        </div>
        <Link href="/dashboard/hrms" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to HRMS Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Payroll Month</th>
              <th className="py-3 px-4">Facility</th>
              <th className="py-3 px-4">Employees</th>
              <th className="py-3 px-4">Total Net Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Processed Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payrolls.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-violet-700">{p.payrollMonth}</td>
                <td className="py-3 px-4 font-bold text-slate-800">{p.facility?.name || 'MediNexa General'}</td>
                <td className="py-3 px-4 text-slate-700">{p.totalEmployees} staff members</td>
                <td className="py-3 px-4 font-extrabold text-emerald-600">${p.totalPayrollAmount?.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
