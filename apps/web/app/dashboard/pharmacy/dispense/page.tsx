'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PharmacyDispenseSubPage() {
  const [orders, setOrders] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/pharmacy/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Prescription Dispensing Workstation</h1>
          <p className="text-xs text-slate-500 mt-1">Dispense prescribed medications, record line items, and deduct stock.</p>
        </div>
        <Link href="/dashboard/pharmacy" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Pharmacy Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Prescribing Doctor</th>
              <th className="py-3 px-4">Total Items</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">#{ord.id.slice(0, 8)}</td>
                <td className="py-3 px-4 font-extrabold text-slate-800">{ord.patient?.user?.firstName || 'Alex'} {ord.patient?.user?.lastName || 'Rivera'}</td>
                <td className="py-3 px-4 text-slate-600">Dr. {ord.doctor?.user?.firstName || 'Smith'}</td>
                <td className="py-3 px-4 font-bold text-slate-800">{ord.totalItems || ord.items?.length || 1} Items</td>
                <td className="py-3 px-4">
                  <span className={`font-extrabold px-2.5 py-0.5 rounded-full text-[10px] ${ord.status === 'DISPENSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>
                    {ord.status}
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
