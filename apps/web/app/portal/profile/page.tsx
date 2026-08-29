'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    phone: '',
    address: '',
    bloodGroup: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Family',
  });
  const [message, setMessage] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/patient-portal/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setEditForm({
          phone: data.phone || data.user?.phone || '',
          address: data.address || '',
          bloodGroup: data.bloodGroup || 'O_POSITIVE',
          allergies: data.allergies || 'Penicillin',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelation: 'Family',
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/patient-portal/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editForm),
    });

    setMessage('Profile demographics updated successfully!');
    setTimeout(() => setMessage(''), 4000);
    loadData();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase rounded-full">
              PATIENT IDENTITY
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Personal Health Profile</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Verified patient demographics, contact details, emergency contacts, and active insurance.</p>
        </div>
        <Link href="/portal" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Back to Portal
        </Link>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading health profile...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 md:col-span-1">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-2xl">
              {profile?.user?.firstName?.[0] || 'J'}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{profile?.user?.firstName} {profile?.user?.lastName}</h2>
              <div className="text-xs text-slate-500">{profile?.user?.email}</div>
              <div className="text-xs text-slate-500 mt-1">Phone: {profile?.phone || profile?.user?.phone || 'N/A'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Blood Group</div>
              <div className="font-extrabold text-rose-600">{profile?.bloodGroup || 'O+'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Allergies & Alerts</div>
              <div className="font-bold text-slate-700">{profile?.allergies || 'Penicillin (Mild)'}</div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-2 space-y-6">
            <h3 className="font-extrabold text-sm text-slate-900">✏️ Update Demographics & Emergency Contacts</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Blood Group</label>
                  <input
                    type="text"
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Residential Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Street, City, State, ZIP"
                  className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="text-xs font-bold text-slate-900">Add Emergency Contact</div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={editForm.emergencyContactName}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                    placeholder="Contact Name (e.g. Spouse)"
                    className="p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={editForm.emergencyContactPhone}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                    placeholder="Contact Phone"
                    className="p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition"
              >
                Save Health Demographics →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
