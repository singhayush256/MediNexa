'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function InventoryItemsSubPage() {
  const [items, setItems] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/inventory/items`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Hospital Consumables & Stock Items</h1>
          <p className="text-xs text-slate-500 mt-1">Surgical consumables, PPE kits, biomedical supplies, and general materials.</p>
        </div>
        <Link href="/dashboard/inventory" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to Inventory Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Item Code</th>
              <th className="py-3 px-4">Item Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Current Stock</th>
              <th className="py-3 px-4">Min Stock</th>
              <th className="py-3 px-4">Reorder Level</th>
              <th className="py-3 px-4">Unit Price</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-amber-700">{item.itemCode}</td>
                <td className="py-3 px-4 text-slate-900 font-bold">{item.itemName}</td>
                <td className="py-3 px-4 text-slate-600">{item.category}</td>
                <td className={`py-3 px-4 font-black ${item.currentStock <= item.minimumStock ? 'text-rose-600' : 'text-slate-900'}`}>{item.currentStock} {item.unitOfMeasure}</td>
                <td className="py-3 px-4 text-slate-500">{item.minimumStock}</td>
                <td className="py-3 px-4 text-slate-500">{item.reorderLevel}</td>
                <td className="py-3 px-4 text-emerald-600 font-extrabold">${item.unitPrice}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                    {item.status}
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
