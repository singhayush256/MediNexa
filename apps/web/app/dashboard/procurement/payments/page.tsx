'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function VendorPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [vendorInvoiceId, setVendorInvoiceId] = useState('');
  const [amount, setAmount] = useState(8500.0);
  const [paymentMethod, setPaymentMethod] = useState('NEFT');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/procurement/payments`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/procurement/invoices`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([pmtData, invData]) => {
      setPayments(Array.isArray(pmtData) ? pmtData : []);
      const invs = (Array.isArray(invData) ? invData : []).filter((i: any) => i.status !== 'PAID');
      setInvoices(invs);
      if (invs.length > 0) {
        setVendorInvoiceId(invs[0].id);
        setAmount(invs[0].invoiceAmount);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDisbursePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/procurement/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          vendorInvoiceId,
          amount: Number(amount),
          paymentMethod,
        }),
      });

      if (res.ok) {
        alert('Vendor payment disbursed successfully!');
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
          <h1 className="text-2xl font-extrabold text-slate-900">Vendor Disbursements & Accounts Payable Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">Bank remittances, NEFT/RTGS wire transfers, and payment settlement audit trails.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
          >
            + Disburse Payment
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
              <th className="py-3 px-4">Payment Reference</th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Amount Disbursed</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Settlement Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((pmt) => (
              <tr key={pmt.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{pmt.paymentReference}</td>
                <td className="py-3 px-4 font-bold text-slate-900">
                  {pmt.vendorInvoice?.vendor?.vendorName || pmt.vendorInvoice?.vendor?.companyName || 'Supplier'}
                </td>
                <td className="py-3 px-4 font-mono text-slate-700">{pmt.vendorInvoice?.invoiceNumber}</td>
                <td className="py-3 px-4 font-extrabold text-emerald-600">${pmt.amount?.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded-full">
                    {pmt.paymentMethod}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500">{new Date(pmt.paymentDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Disburse Vendor Payment</h3>
            <form onSubmit={handleDisbursePayment} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Select Approved Invoice *</label>
                <select
                  value={vendorInvoiceId}
                  onChange={(e) => {
                    setVendorInvoiceId(e.target.value);
                    const sel = invoices.find((i) => i.id === e.target.value);
                    if (sel) setAmount(sel.invoiceAmount);
                  }}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      #{inv.invoiceNumber} - ${inv.invoiceAmount} ({inv.vendor?.vendorName})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Disbursement Amount ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label>Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="NEFT">NEFT (National Electronic Fund)</option>
                    <option value="RTGS">RTGS (Real-Time Gross Settlement)</option>
                    <option value="WIRE">International Wire Transfer</option>
                    <option value="CHEQUE">Treasury Cheque</option>
                    <option value="UPI">Corporate UPI</option>
                  </select>
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
                  Execute Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
