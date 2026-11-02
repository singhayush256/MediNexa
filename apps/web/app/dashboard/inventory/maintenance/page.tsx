'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function InventoryMaintenanceSubPage() {
  const [tickets, setTickets] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/inventory/assets`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const allTickets = Array.isArray(data) ? data.flatMap((a: any) => a.tickets || []) : [];
        setTickets(allTickets);
      });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Biomedical Equipment Maintenance Center</h1>
          <p className="text-xs text-slate-500 mt-1">Corrective engineering tickets, preventive calibrations, and equipment repair logs.</p>
        </div>
        <Link href="/dashboard/inventory" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Inventory Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Ticket Number</th>
              <th className="py-3 px-4">Asset</th>
              <th className="py-3 px-4">Issue Description</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-amber-700">{t.ticketNumber}</td>
                <td className="py-3 px-4 text-slate-900 font-bold">{t.asset?.assetName || 'Biomedical Unit'}</td>
                <td className="py-3 px-4 text-slate-700">{t.issueDescription}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    t.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                    t.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {t.priority}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">{t.assignedTo}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
