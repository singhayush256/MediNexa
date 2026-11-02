'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function GoodsReceiptPage() {
  const [grns, setGrns] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [itemName, setItemName] = useState('Central Venous Catheter 7 Fr Triple Lumen');
  const [quantityReceived, setQuantityReceived] = useState(100);
  const [batchNumber, setBatchNumber] = useState('BAT-2026-9041');
  const [expiryDate, setExpiryDate] = useState('2028-06-30');
  const [remarks, setRemarks] = useState('Central warehouse physical count verified. Packaging sterile & intact.');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/procurement/grn`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/procurement/purchase-orders`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([grnData, poData]) => {
      setGrns(Array.isArray(grnData) ? grnData : []);
      const pos = Array.isArray(poData) ? poData : [];
      setPurchaseOrders(pos);
      if (pos.length > 0) setPurchaseOrderId(pos[0].id);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/procurement/grn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          purchaseOrderId,
          remarks,
          lineItems: [
            {
              itemName,
              quantityReceived: Number(quantityReceived),
              batchNumber,
              expiryDate: new Date(expiryDate).toISOString(),
            },
          ],
        }),
      });

      if (res.ok) {
        alert('Goods Receipt Note (GRN) generated successfully!');
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
          <h1 className="text-2xl font-extrabold text-slate-900">Goods Receipt Notes (GRN) & Warehouse Receiving</h1>
          <p className="text-xs text-slate-500 mt-1">Warehouse physical inspection, batch number verification, and inventory intake audit logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
          >
            + Receive Shipment (GRN)
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
              <th className="py-3 px-4">GRN Number</th>
              <th className="py-3 px-4">Purchase Order</th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4">Items Received</th>
              <th className="py-3 px-4">Received By</th>
              <th className="py-3 px-4">Received Date</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {grns.map((grn) => (
              <tr key={grn.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{grn.grnNumber}</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-800">{grn.purchaseOrder?.poNumber}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{grn.purchaseOrder?.vendor?.vendorName || grn.purchaseOrder?.vendor?.companyName}</td>
                <td className="py-3 px-4 text-slate-600">
                  {grn.lineItems?.map((li: any) => `${li.itemName} (x${li.quantityReceived}, Batch: ${li.batchNumber})`).join(', ')}
                </td>
                <td className="py-3 px-4 text-slate-600">{grn.receivedBy?.firstName} {grn.receivedBy?.lastName || 'Store In-Charge'}</td>
                <td className="py-3 px-4 text-slate-500">{new Date(grn.receivedAt).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                    {grn.status || 'RECEIVED'}
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
            <h3 className="font-black text-lg text-slate-900">Log Goods Receipt Note (GRN)</h3>
            <form onSubmit={handleCreateGRN} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Select Purchase Order *</label>
                <select
                  value={purchaseOrderId}
                  onChange={(e) => setPurchaseOrderId(e.target.value)}
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
                <label>Item Received *</label>
                <input
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Quantity Received *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantityReceived}
                    onChange={(e) => setQuantityReceived(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label>Batch / Lot Number *</label>
                  <input
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label>Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Inspector Remarks *</label>
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
                  Accept & Log GRN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
