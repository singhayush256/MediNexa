'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function VendorInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-VND-${Date.now().toString().slice(-4)}`);
  const [invoiceAmount, setInvoiceAmount] = useState(8500.0);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
  );

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/procurement/invoices`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/procurement/purchase-orders`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([invData, poData]) => {
      setInvoices(Array.isArray(invData) ? invData : []);
      const pos = Array.isArray(poData) ? poData : [];
      setPurchaseOrders(pos);
      if (pos.length > 0) {
        setPurchaseOrderId(pos[0].id);
        setInvoiceAmount(pos[0].totalAmount);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    const po = purchaseOrders.find((p) => p.id === purchaseOrderId);
    if (!po) return;

    try {
      const res = await fetch(`${apiUrl}/procurement/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          invoiceNumber,
          vendorId: po.vendorId,
          purchaseOrderId,
          invoiceAmount: Number(invoiceAmount),
          dueDate: new Date(dueDate).toISOString(),
        }),
      });

      if (res.ok) {
        alert('Vendor invoice ingested and Three-Way Matched successfully!');
        setShowAddModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Vendor Invoices & Three-Way Match Engine</h1>
          <p className="text-xs text-slate-500 mt-1">Automated PO ↔ GRN ↔ Invoice validation, quantity/price mismatch detection, and payable clearance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
          >
            + Ingest Vendor Invoice
          </button>
          <Link href="/dashboard/procurement" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
            ← Back to Overview
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4">PO Reference</th>
              <th className="py-3 px-4">Invoice Amount</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">3-Way Match Status</th>
              <th className="py-3 px-4">Payment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{inv.invoiceNumber}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{inv.vendor?.vendorName || inv.vendor?.companyName}</td>
                <td className="py-3 px-4 font-mono text-slate-700">{inv.purchaseOrder?.poNumber}</td>
                <td className="py-3 px-4 font-extrabold text-slate-900">${inv.invoiceAmount?.toLocaleString()}</td>
                <td className="py-3 px-4 text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    inv.threeWayMatchStatus === 'MATCHED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {inv.threeWayMatchStatus}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    inv.status === 'PAID' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Ingest Vendor Invoice</h3>
            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Select Purchase Order *</label>
                <select
                  value={purchaseOrderId}
                  onChange={(e) => {
                    setPurchaseOrderId(e.target.value);
                    const selPo = purchaseOrders.find((p) => p.id === e.target.value);
                    if (selPo) setInvoiceAmount(selPo.totalAmount);
                  }}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      #{po.poNumber} - {po.vendor?.vendorName || po.vendor?.companyName} (${po.totalAmount})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Invoice Number *</label>
                <input
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Invoice Amount ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label>Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow"
                >
                  Match & Ingest Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
