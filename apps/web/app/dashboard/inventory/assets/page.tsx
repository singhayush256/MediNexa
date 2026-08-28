'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function InventoryAssetsSubPage() {
  const [assets, setAssets] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/inventory/assets`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setAssets(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Hospital Asset & Biomedical Equipment Registry</h1>
          <p className="text-xs text-slate-500 mt-1">Ventilators, CT/MRI scanners, dialysis units, defibrillators, and OT surgical suites.</p>
        </div>
        <Link href="/dashboard/inventory" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Inventory Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Asset Code</th>
              <th className="py-3 px-4">Asset Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Maintenance Freq</th>
              <th className="py-3 px-4">Warranty Expiry</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-amber-700">{asset.assetCode}</td>
                <td className="py-3 px-4 text-slate-900 font-bold">{asset.assetName}</td>
                <td className="py-3 px-4 text-slate-600">{asset.category}</td>
                <td className="py-3 px-4 text-slate-700 font-medium">{asset.currentLocation}</td>
                <td className="py-3 px-4 text-slate-500">{asset.maintenanceFrequency}</td>
                <td className="py-3 px-4 text-slate-500">{new Date(asset.warrantyExpiry).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    asset.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                    asset.status === 'UNDER_MAINTENANCE' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {asset.status}
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
