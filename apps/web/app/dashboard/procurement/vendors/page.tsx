'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [vendorName, setVendorName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('GSTIN27AABCV1234F1Z8');
  const [panNumber, setPanNumber] = useState('AABCV1234F');
  const [address, setAddress] = useState('Medical Technology Park, Electronic City, Bengaluru');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadVendors = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/procurement/vendors`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setVendors(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/procurement/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          vendorName,
          contactPerson,
          email,
          phone,
          gstNumber,
          panNumber,
          address,
        }),
      });

      if (res.ok) {
        alert('Vendor registered successfully!');
        setShowAddModal(false);
        setVendorName('');
        setContactPerson('');
        setEmail('');
        setPhone('');
        loadVendors();
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
          <h1 className="text-2xl font-extrabold text-slate-900">Hospital Vendor Directory & Scorecards</h1>
          <p className="text-xs text-slate-500 mt-1">Vendor compliance, GST/PAN verification, and delivery performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
          >
            + Register Vendor
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
              <th className="py-3 px-4">Vendor Code</th>
              <th className="py-3 px-4">Vendor Name</th>
              <th className="py-3 px-4">Contact Person</th>
              <th className="py-3 px-4">Email / Phone</th>
              <th className="py-3 px-4">GST / PAN</th>
              <th className="py-3 px-4">Quality Score</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vendors.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">{v.vendorCode}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{v.vendorName || v.companyName}</td>
                <td className="py-3 px-4 text-slate-700">{v.contactPerson || 'N/A'}</td>
                <td className="py-3 px-4 text-slate-600">
                  <div>{v.email}</div>
                  <div className="text-[10px] text-slate-400">{v.phone}</div>
                </td>
                <td className="py-3 px-4 font-mono text-slate-700">
                  <div>{v.gstNumber}</div>
                  <div className="text-[10px] text-slate-400">{v.panNumber}</div>
                </td>
                <td className="py-3 px-4 font-bold text-emerald-600">
                  ⭐ {v.rating || 4.8} / 5.0
                </td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                    {v.vendorStatus || v.status || 'ACTIVE'}
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
            <h3 className="font-black text-lg text-slate-900">Onboard New Supplier / Vendor</h3>
            <form onSubmit={handleCreateVendor} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Company / Vendor Name *</label>
                <input
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Contact Person *</label>
                  <input
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label>Phone *</label>
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div>
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>GSTIN *</label>
                  <input
                    required
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label>PAN Number *</label>
                  <input
                    required
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label>Operating Address *</label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
