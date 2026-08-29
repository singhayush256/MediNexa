'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RFQPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [requisitionId, setRequisitionId] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
  );

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/procurement/rfq`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/procurement/requisitions`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/procurement/vendors`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([rfqData, reqData, vData]) => {
      setRfqs(Array.isArray(rfqData) ? rfqData : []);
      const reqs = Array.isArray(reqData) ? reqData : [];
      setRequisitions(reqs);
      if (reqs.length > 0) setRequisitionId(reqs[0].id);
      setVendors(Array.isArray(vData) ? vData : []);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/procurement/rfq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          requisitionId,
          submissionDeadline: new Date(submissionDeadline).toISOString(),
        }),
      });

      if (res.ok) {
        alert('RFQ broadcasted to suppliers successfully!');
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

  const handleAward = async (rfqId: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/procurement/rfq/${rfqId}/award`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        alert('RFQ awarded and Purchase Order automatically generated!');
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
          <h1 className="text-2xl font-extrabold text-slate-900">Request For Quotation (RFQ) Bidding Console</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-vendor bidding, price quotation analysis, and automated contract awarding.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
          >
            + Broadcast RFQ
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
              <th className="py-3 px-4">RFQ Number</th>
              <th className="py-3 px-4">Requisition</th>
              <th className="py-3 px-4">Bids Received</th>
              <th className="py-3 px-4">Submission Deadline</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rfqs.map((rfq) => (
              <tr key={rfq.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{rfq.rfqNumber}</td>
                <td className="py-3 px-4 font-bold text-slate-800">{rfq.requisition?.requisitionNumber} ({rfq.requisition?.department})</td>
                <td className="py-3 px-4 text-slate-600 font-extrabold">
                  {rfq.responses?.length || 0} Quotes Received
                </td>
                <td className="py-3 px-4 text-slate-500">{new Date(rfq.submissionDeadline).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    rfq.status === 'AWARDED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {rfq.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {rfq.status !== 'AWARDED' && (rfq.responses?.length > 0) && (
                    <button
                      onClick={() => handleAward(rfq.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg shadow"
                    >
                      Award Lowest Bid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Broadcast Request For Quotation</h3>
            <form onSubmit={handleCreateRFQ} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Select Requisition *</label>
                <select
                  value={requisitionId}
                  onChange={(e) => setRequisitionId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {requisitions.map((req) => (
                    <option key={req.id} value={req.id}>
                      #{req.requisitionNumber} - {req.department} (${req.totalAmount})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Submission Deadline *</label>
                <input
                  type="date"
                  required
                  value={submissionDeadline}
                  onChange={(e) => setSubmissionDeadline(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
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
                  Publish RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
