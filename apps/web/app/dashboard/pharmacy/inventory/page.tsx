'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PharmacyInventorySubPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [drugs, setDrugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/pharmacy/inventory`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/pharmacy/drugs`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([invData, drugData]) => {
        setInventory(Array.isArray(invData) ? invData : []);
        setDrugs(Array.isArray(drugData) ? drugData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pharmacy Inventory & Warehouse Roster</h1>
          <p className="text-xs text-slate-500 mt-1">Batch-wise inventory tracking, warehouse locations, and reorder levels.</p>
        </div>
        <Link
          href="/dashboard/pharmacy"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl"
        >
          ← Back to Pharmacy Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Medicine / Drug Name</th>
              <th className="py-3 px-4">Batch Number</th>
              <th className="py-3 px-4">Warehouse Location</th>
              <th className="py-3 px-4">Quantity On Hand</th>
              <th className="py-3 px-4">Expiry Date</th>
              <th className="py-3 px-4">Unit Price ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-extrabold text-slate-900">{inv.medicineName}</td>
                <td className="py-3 px-4 text-slate-600 font-mono">{inv.batchNumber}</td>
                <td className="py-3 px-4 text-slate-600">{inv.warehouseLocation || 'MAIN_PHARMACY'}</td>
                <td className="py-3 px-4">
                  <span className={`font-extrabold px-2.5 py-1 rounded-lg ${inv.stockQuantity < inv.reorderLevel ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {inv.stockQuantity} Units
                  </span>
                </td>
                <td className="py-3 px-4 font-medium">{new Date(inv.expiryDate).toISOString().slice(0, 10)}</td>
                <td className="py-3 px-4 font-extrabold text-slate-800">${(inv.sellingPrice || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
