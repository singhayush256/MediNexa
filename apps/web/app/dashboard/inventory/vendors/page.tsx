'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function InventoryVendorsSubPage() {
  const [vendors, setVendors] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/inventory/vendors`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setVendors(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Medical Equipment & Consumable Vendors</h1>
          <p className="text-xs text-slate-500 mt-1">Approved hospital suppliers, GST registration numbers, and vendor ratings.</p>
        </div>
        <Link href="/dashboard/inventory" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Inventory Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Vendor Code</th>
              <th className="py-3 px-4">Company Name</th>
              <th className="py-3 px-4">Contact Person</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">GST Number</th>
              <th className="py-3 px-4">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vendors.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-amber-700">{v.vendorCode}</td>
                <td className="py-3 px-4 text-slate-900 font-bold">{v.companyName}</td>
                <td className="py-3 px-4 text-slate-700">{v.contactPerson || '--'}</td>
                <td className="py-3 px-4 text-slate-600">{v.email || '--'}</td>
                <td className="py-3 px-4 text-slate-600">{v.phone || '--'}</td>
                <td className="py-3 px-4 font-mono text-slate-500">{v.gstNumber}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">★ {v.rating}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
