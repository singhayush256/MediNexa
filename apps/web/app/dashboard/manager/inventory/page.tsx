'use client';

import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Building2,
  ArrowRight,
} from 'lucide-react';

interface OperationalSupply {
  id: string;
  item: string;
  category: string;
  department: string;
  stockLevel: number;
  reorderThreshold: number;
  unit: string;
  status: 'OPTIMAL' | 'LOW' | 'CRITICAL';
}

export default function ManagerInventoryPage() {
  const [supplies, setSupplies] = useState<OperationalSupply[]>([
    { id: 'sup-01', item: 'N95 Surgical Respirator Masks', category: 'PPE', department: 'Critical Care ICU', stockLevel: 450, reorderThreshold: 100, unit: 'Pieces', status: 'OPTIMAL' },
    { id: 'sup-02', item: 'IV Infusion Sets (Adult)', category: 'Consumables', department: 'General Medicine', stockLevel: 65, reorderThreshold: 50, unit: 'Sets', status: 'LOW' },
    { id: 'sup-03', item: 'Endotracheal Tubes 7.5mm', category: 'Airway', department: 'Emergency & Trauma', stockLevel: 12, reorderThreshold: 15, unit: 'Units', status: 'CRITICAL' },
    { id: 'sup-04', item: 'Pulse Oximeter Disposable Probes', category: 'Monitoring', department: 'ICU Ward', stockLevel: 80, reorderThreshold: 30, unit: 'Probes', status: 'OPTIMAL' },
    { id: 'sup-05', item: 'Crash Cart Defibrillator Gel Pads', category: 'Emergency', department: 'Emergency', stockLevel: 8, reorderThreshold: 10, unit: 'Packs', status: 'LOW' },
  ]);

  const [requestedId, setRequestedId] = useState<string | null>(null);

  const handleRequestStock = (id: string, name: string) => {
    setRequestedId(id);
    setTimeout(() => setRequestedId(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>Ward Supplies & Operational Stocks</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Operational Inventory & Consumables
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Realtime monitoring of essential clinical supplies, buffer stock levels, and replenishment requisitions.
          </p>
        </div>
      </div>

      {requestedId && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Replenishment request dispatched to central procurement warehouse.</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Item & Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-center">Threshold</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {supplies.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-white">{s.item}</div>
                    <div className="font-mono text-[10px] text-slate-400">{s.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{s.category}</td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{s.department}</td>
                  <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">
                    {s.stockLevel} {s.unit}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                    {s.reorderThreshold} {s.unit}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        s.status === 'OPTIMAL'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : s.status === 'LOW'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {s.status !== 'OPTIMAL' ? (
                      <button
                        onClick={() => handleRequestStock(s.id, s.item)}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                      >
                        Request Restock
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs font-semibold">Stock Nominal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
