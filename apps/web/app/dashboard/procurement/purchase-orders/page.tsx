'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [vendorId, setVendorId] = useState('');
  const [itemName, setItemName] = useState('Central Venous Catheter 7 Fr Triple Lumen');
  const [quantity, setQuantity] = useState(100);
  const [unitPrice, setUnitPrice] = useState(85.0);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/procurement/purchase-orders`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/procurement/vendors`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([poData, vData]) => {
      setPurchaseOrders(Array.isArray(poData) ? poData : []);
      const vList = Array.isArray(vData) ? vData : [];
      setVendors(vList);
      if (vList.length > 0) setVendorId(vList[0].id);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/procurement/purchase-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          vendorId,
          lineItems: [{ itemName, quantity: Number(quantity), unitPrice: Number(unitPrice) }],
        }),
      });

      if (res.ok) {
        alert('Purchase Order issued successfully!');
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
          <h1 className="text-2xl font-extrabold text-slate-900">Purchase Orders (PO) Management</h1>
          <p className="text-xs text-slate-500 mt-1">Official binding contracts issued to suppliers with itemized lines and delivery tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
          >
            + Issue Purchase Order
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
              <th className="py-3 px-4">PO Number</th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4">Items Breakdown</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date Issued</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchaseOrders.map((po) => (
              <tr key={po.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{po.poNumber}</td>
                <td className="py-3 px-4 font-bold text-slate-800">{po.vendor?.vendorName || po.vendor?.companyName}</td>
                <td className="py-3 px-4 text-slate-600">
                  {po.lineItems?.map((li: any) => `${li.itemName} (x${li.quantity} @ $${li.unitPrice})`).join(', ') || 'Supplies'}
                </td>
                <td className="py-3 px-4 font-extrabold text-slate-900">${po.totalAmount?.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    po.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {po.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500">{new Date(po.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Issue Purchase Order</h3>
            <form onSubmit={handleCreatePO} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Select Supplier / Vendor *</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vendorName || v.companyName} ({v.vendorCode})
                    </option>
                  ))}
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
                  <label>Unit Price ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between font-extrabold text-xs text-slate-900">
                <span>Calculated PO Total:</span>
                <span>${(quantity * unitPrice).toLocaleString()}</span>
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
                  Create & Send PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
