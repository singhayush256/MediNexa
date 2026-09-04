'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientFamilyPage() {
  const [family, setFamily] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    relation: 'Spouse',
    phone: '',
    accessLevel: 'FULL',
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/patient-portal/family`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setFamily(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/patient-portal/family`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newMemberForm),
    });

    setNewMemberForm({
      name: '',
      relation: 'Spouse',
      phone: '',
      accessLevel: 'FULL',
    });
    loadData();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-pink-100 text-pink-800 text-xs font-black uppercase rounded-full">
              FAMILY NETWORK
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Family Access Management</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Manage health records, appointments, and care access for your family dependents.</p>
        </div>
        <Link href="/portal" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Portal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Family Roster */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase">Linked Family Dependents</h2>
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading family members...</div>
          ) : family.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="text-3xl">👨‍👩‍👧‍👦</div>
              <h3 className="font-extrabold text-sm text-slate-900">No Family Members Linked</h3>
              <p className="text-xs text-slate-500">Add family members using the form to share care coordination access.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {family.map((m) => (
                <div key={m.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-700 flex items-center justify-center font-bold text-base">
                      👤
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-slate-900">{m.name}</h3>
                      <div className="text-[11px] text-slate-500">
                        {m.relation} {m.phone ? `• ${m.phone}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                    {m.accessLevel || 'FULL ACCESS'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Member Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">➕ Add Family Member</h3>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Full Name</label>
              <input
                type="text"
                required
                value={newMemberForm.name}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Relationship</label>
              <select
                value={newMemberForm.relation}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, relation: e.target.value })}
                className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-pink-500"
              >
                <option value="Spouse">Spouse</option>
                <option value="Child">Child / Dependent</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Phone Number</label>
              <input
                type="text"
                value={newMemberForm.phone}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-pink-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs rounded-xl shadow transition"
            >
              Add Family Member →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
