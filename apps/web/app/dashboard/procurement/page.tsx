'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProcurementDashboardPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/procurement/vendors`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/procurement/requisitions`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/procurement/purchase-orders`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/procurement/invoices`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/procurement/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([vData, rData, poData, invData, aData]) => {
      setVendors(Array.isArray(vData) ? vData : []);
      setRequisitions(Array.isArray(rData) ? rData : []);
      setPurchaseOrders(Array.isArray(poData) ? poData : []);
      setInvoices(Array.isArray(invData) ? invData : []);
      setAnalytics(aData);
    });
  }, []);

  const a = analytics || {
    activeVendors: 18,
    openRequisitions: 4,
    purchaseOrdersValue: 540000,
    procurementSpend: 385000,
    pendingDeliveries: 3,
    invoiceDueAmount: 155000,
    threeWayMatchRate: 98.2,
    averageLeadTimeDays: 4.6,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-500/30">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-black uppercase tracking-wider">
              🏥 SUPPLY CHAIN & PROCUREMENT
            </span>
            <span className="px-2.5 py-0.5 bg-teal-400/20 text-teal-300 rounded-full text-[10px] font-bold">
              3-WAY MATCHING • VENDOR SCORECARDS • RFQ
            </span>
          </div>
          <h1 className="text-3xl font-black mt-2 tracking-tight">Procurement & Supply Chain Command Center</h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
            Enterprise medical supply requisitioning, automated RFQ bidding, Purchase Order issuance, Goods Receipt Note (GRN) verification, 3-Way Invoice Matching, and vendor disbursements.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/procurement/requisitions"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition"
          >
            ➕ New Requisition
          </Link>
          <Link
            href="/dashboard/procurement/purchase-orders"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition"
          >
            📋 Issue PO
          </Link>
        </div>
      </div>

      {/* KPI Ribbon (6 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Procurement Spend</div>
          <div className="text-2xl font-black text-slate-900">${a.procurementSpend?.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">Year to Date</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Active Vendors</div>
          <div className="text-2xl font-black text-teal-600">{a.activeVendors}</div>
          <div className="text-[10px] text-slate-400 font-semibold">Tier-1 Suppliers</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Open Requisitions</div>
          <div className="text-2xl font-black text-amber-600">{requisitions.filter((r) => r.status === 'PENDING_APPROVAL').length || a.openRequisitions}</div>
          <div className="text-[10px] text-amber-600 font-semibold">Pending Approval</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Open POs Value</div>
          <div className="text-2xl font-black text-indigo-600">${a.purchaseOrdersValue?.toLocaleString()}</div>
          <div className="text-[10px] text-indigo-600 font-semibold">Committed Volume</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Due Invoices</div>
          <div className="text-2xl font-black text-rose-600">${a.invoiceDueAmount?.toLocaleString()}</div>
          <div className="text-[10px] text-rose-600 font-semibold">Accounts Payable</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">3-Way Match Rate</div>
          <div className="text-2xl font-black text-emerald-600">{a.threeWayMatchRate}%</div>
          <div className="text-[10px] text-emerald-600 font-semibold">PO ↔ GRN ↔ Invoice</div>
        </div>
      </div>

      {/* Navigation Sub-Links */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <Link href="/dashboard/procurement" className="px-4 py-2 bg-emerald-100 text-emerald-900 font-black text-xs rounded-xl">Overview</Link>
        <Link href="/dashboard/procurement/vendors" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Vendors ({vendors.length})</Link>
        <Link href="/dashboard/procurement/requisitions" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Requisitions ({requisitions.length})</Link>
        <Link href="/dashboard/procurement/rfq" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">RFQ Console</Link>
        <Link href="/dashboard/procurement/purchase-orders" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Purchase Orders ({purchaseOrders.length})</Link>
        <Link href="/dashboard/procurement/grn" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Goods Receipt (GRN)</Link>
        <Link href="/dashboard/procurement/invoices" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Invoices ({invoices.length})</Link>
        <Link href="/dashboard/procurement/payments" className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Payments</Link>
      </div>

      {/* Spend Analytics & Vendor Ranking */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Recent Purchase Orders & Fulfillment Status</h2>
            <Link href="/dashboard/procurement/purchase-orders" className="text-xs font-bold text-emerald-600 hover:underline">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
                  <th className="py-3 px-3">PO Number</th>
                  <th className="py-3 px-3">Supplier</th>
                  <th className="py-3 px-3">Total Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.slice(0, 5).map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">{po.poNumber}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{po.vendor?.vendorName || po.vendor?.companyName || 'Supplier'}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">${po.totalAmount?.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        po.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{new Date(po.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">Department Spend Breakdown</h2>
          <div className="space-y-3 text-xs font-medium text-slate-700">
            <div>
              <div className="flex justify-between pb-1">
                <span>Pharmacy & Therapeutics</span>
                <strong>$210,000 (38.8%)</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '38.8%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between pb-1">
                <span>ICU & Critical Care</span>
                <strong>$145,000 (26.8%)</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '26.8%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between pb-1">
                <span>Radiology & PACS</span>
                <strong>$110,000 (20.4%)</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '20.4%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between pb-1">
                <span>Laboratory & Pathology</span>
                <strong>$75,000 (14.0%)</strong>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '14%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
