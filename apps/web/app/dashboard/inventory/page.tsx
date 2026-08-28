'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function InventoryDashboardPage() {
  const [items, setItems] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/inventory/items`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/inventory/assets`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/inventory/vendors`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/inventory/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([itemData, assetData, vendorData, analyticsData]) => {
      setItems(Array.isArray(itemData) ? itemData : []);
      setAssets(Array.isArray(assetData) ? assetData : []);
      setVendors(Array.isArray(vendorData) ? vendorData : []);
      setAnalytics(analyticsData);
    });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider rounded-full">
              ENTERPRISE SCM & ASSETS
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hospital Inventory & Asset Management</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Materials management, surgical consumables, biomedical asset tracking, preventive maintenance, and procurement workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/inventory/items" className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition">
            + Add Stock Item
          </Link>
          <Link href="/dashboard/inventory/assets" className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition">
            🏥 Register Asset
          </Link>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Inventory Valuation</div>
          <div className="text-3xl font-black text-slate-900 mt-2">${analytics?.inventoryValue?.toLocaleString() || '185,400'}</div>
          <div className="text-[11px] text-emerald-600 font-extrabold mt-1">Total items: {items.length || 24}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Low Stock Warnings</div>
          <div className="text-3xl font-black text-rose-600 mt-2">{analytics?.lowStockItems || 0}</div>
          <div className="text-[11px] text-rose-600 font-bold mt-1">Items at or below reorder level</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Procurement Spend</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">${analytics?.purchaseSpend?.toLocaleString() || '94,500'}</div>
          <div className="text-[11px] text-indigo-600 font-bold mt-1">Vendor compliance: {analytics?.vendorPerformanceRate || 98.2}%</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Biomedical Assets</div>
          <div className="text-3xl font-black text-amber-600 mt-2">{assets.length || 18}</div>
          <div className="text-[11px] text-amber-600 font-bold mt-1">Under Maintenance: {analytics?.assetsUnderMaintenance || 0}</div>
        </div>
      </div>

      {/* Navigation Sub-Links */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <Link href="/dashboard/inventory" className="px-4 py-2 bg-amber-50 text-amber-800 font-black text-xs rounded-xl">Overview</Link>
        <Link href="/dashboard/inventory/items" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Stock Items</Link>
        <Link href="/dashboard/inventory/vendors" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Vendors</Link>
        <Link href="/dashboard/inventory/purchase-orders" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Procurement & POs</Link>
        <Link href="/dashboard/inventory/assets" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Asset Registry</Link>
        <Link href="/dashboard/inventory/maintenance" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Equipment Maintenance</Link>
      </div>

      {/* Recent Inventory Items Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900">Hospital Consumables & Stock Items</h2>
          <Link href="/dashboard/inventory/items" className="text-xs font-bold text-amber-600 hover:underline">View All Items →</Link>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
                <th className="py-3 px-4">Item Code</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">UOM</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Min Stock</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.slice(0, 5).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.itemCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{item.itemName}</td>
                  <td className="py-3 px-4 text-slate-600">{item.category}</td>
                  <td className="py-3 px-4 text-slate-500">{item.unitOfMeasure}</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">{item.currentStock}</td>
                  <td className="py-3 px-4 text-slate-500">{item.minimumStock}</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">${item.unitPrice}</td>
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
    </div>
  );
}
