'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [department, setDepartment] = useState('Critical Care & ICU');
  const [itemName, setItemName] = useState('Disposable Arterial Blood Line Sets');
  const [quantity, setQuantity] = useState(50);
  const [estimatedCost, setEstimatedCost] = useState(120.0);
  const [remarks, setRemarks] = useState('Monthly ICU catheter and arterial line consumable replenishment.');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadRequisitions = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/procurement/requisitions`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setRequisitions(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    loadRequisitions();
  }, []);

  const handleCreateRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/procurement/requisitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          department,
          remarks,
          items: [{ itemName, quantity: Number(quantity), estimatedCost: Number(estimatedCost) }],
        }),
      });

      if (res.ok) {
        alert('Requisition filed successfully!');
        setShowAddModal(false);
        loadRequisitions();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleApprove = async (id: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/procurement/requisitions/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('Requisition approved!');
        loadRequisitions();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Purchase Requisitions & Department Requests</h1>
          <p className="text-xs text-slate-500 mt-1">Departmental supply requisitions, budget verification, and management approvals.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
          >
            + Create Requisition
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
              <th className="py-3 px-4">Req Number</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Line Items</th>
              <th className="py-3 px-4">Estimated Total</th>
              <th className="py-3 px-4">Requested By</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requisitions.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{req.requisitionNumber}</td>
                <td className="py-3 px-4 font-bold text-slate-800">{req.department}</td>
                <td className="py-3 px-4 text-slate-600">
                  {req.requisitionItems?.map((i: any) => `${i.itemName} (x${i.quantity})`).join(', ') || req.items || 'Consumables'}
                </td>
                <td className="py-3 px-4 font-extrabold text-slate-900">${req.totalAmount?.toLocaleString()}</td>
                <td className="py-3 px-4 text-slate-600">{req.requestedBy?.firstName} {req.requestedBy?.lastName || 'Staff'}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {req.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[10px] rounded-lg border border-emerald-200"
                    >
                      Approve
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
            <h3 className="font-black text-lg text-slate-900">New Department Purchase Requisition</h3>
            <form onSubmit={handleCreateRequisition} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Requesting Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Critical Care & ICU">Critical Care & ICU</option>
                  <option value="Pharmacy & Therapeutics">Pharmacy & Therapeutics</option>
                  <option value="Radiology & PACS">Radiology & PACS</option>
                  <option value="Emergency Department">Emergency Department</option>
                  <option value="Operating Theatre">Operating Theatre</option>
                  <option value="Laboratory & Pathology">Laboratory & Pathology</option>
                </select>
              </div>
              <div>
                <label>Item Name *</label>
                <input
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label>Estimated Unit Cost ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div>
                <label>Clinical Justification / Remarks *</label>
                <textarea
                  rows={2}
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
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
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
