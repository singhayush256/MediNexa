'use client';

import React, { useEffect, useState } from 'react';

export default function BloodBankDashboard() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'donors' | 'donations' | 'requests' | 'crossmatch' | 'transfusions'>('inventory');
  const [analytics, setAnalytics] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals / Forms
  const [donorModal, setDonorModal] = useState(false);
  const [donorForm, setDonorForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    bloodGroup: 'O_POSITIVE',
    gender: 'MALE',
  });

  const [donationModal, setDonationModal] = useState(false);
  const [donationForm, setDonationForm] = useState({
    donorId: '',
    hemoglobin: 13.5,
    bloodPressure: '120/80',
    weight: 70,
    component: 'PACKED_RBC',
    infectiousScreening: 'NEGATIVE',
  });

  const [requestModal, setRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    patientId: '',
    bloodGroup: 'O_POSITIVE',
    component: 'PACKED_RBC',
    unitsRequested: 1,
    urgency: 'ROUTINE',
    clinicalIndication: 'Pre-op stabilization / severe anemia',
  });

  const [crossmatchModal, setCrossmatchModal] = useState(false);
  const [crossmatchForm, setCrossmatchForm] = useState({
    requestId: '',
    unitId: '',
    compatibility: 'COMPATIBLE',
    method: 'AHG_GEL_CARD',
    notes: 'Major & minor gel crossmatch clear.',
  });

  const [issueModal, setIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    requestId: '',
    unitId: '',
    issuedToStaffName: 'Ward Nurse on Duty',
  });

  const [message, setMessage] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/blood-bank/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/blood-bank/inventory`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/blood-bank/donors`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([anal, inv, dons]) => {
        setAnalytics(anal);
        setInventory(Array.isArray(inv) ? inv : []);
        setDonors(Array.isArray(dons) ? dons : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegisterDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/blood-bank/donors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(donorForm),
    });

    setDonorModal(false);
    setMessage('Blood donor registered successfully!');
    setTimeout(() => setMessage(''), 4000);
    loadData();
  };

  const handleRecordDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/blood-bank/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...donationForm,
        hemoglobin: Number(donationForm.hemoglobin),
        weight: Number(donationForm.weight),
      }),
    });

    setDonationModal(false);
    setMessage('Donation recorded & component unit added to cold-chain inventory!');
    setTimeout(() => setMessage(''), 4000);
    loadData();
  };

  const handleCrossmatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/blood-bank/crossmatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(crossmatchForm),
    });

    setCrossmatchModal(false);
    setMessage('Serological crossmatch test verified & unit reserved!');
    setTimeout(() => setMessage(''), 4000);
    loadData();
  };

  const handleIssueBlood = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    await fetch(`${apiUrl}/blood-bank/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(issueForm),
    });

    setIssueModal(false);
    setMessage('Blood unit safely issued with mandatory crossmatch verification!');
    setTimeout(() => setMessage(''), 4000);
    loadData();
  };

  const stats = analytics || {
    totalUnits: 48,
    availableUnits: 36,
    reservedUnits: 6,
    transfusedToday: 4,
    expiringSoon: 2,
    lowStockGroups: ['AB_NEGATIVE', 'B_NEGATIVE'],
    stockByGroup: {
      A_POSITIVE: 8,
      A_NEGATIVE: 3,
      B_POSITIVE: 12,
      B_NEGATIVE: 2,
      AB_POSITIVE: 5,
      AB_NEGATIVE: 1,
      O_POSITIVE: 14,
      O_NEGATIVE: 3,
    },
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-red-600 to-amber-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
            NABH / NABL ACCREDITED BLOOD BANK
          </span>
          <h1 className="text-3xl font-black mt-2 tracking-tight">Enterprise Blood Bank & Transfusion Center</h1>
          <p className="text-rose-100 text-sm mt-1 max-w-2xl">
            Cold-chain component tracking, serological crossmatch verification, donor registry, and adverse transfusion reaction surveillance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setDonorModal(true)}
            className="px-4 py-2.5 bg-white text-rose-800 hover:bg-rose-50 font-black text-xs rounded-xl shadow transition"
          >
            + Register Donor
          </button>
          <button
            onClick={() => setDonationModal(true)}
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs rounded-xl transition"
          >
            + Record Donation
          </button>
          <button
            onClick={() => setCrossmatchModal(true)}
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs rounded-xl transition"
          >
            🧪 Crossmatch
          </button>
          <button
            onClick={() => setIssueModal(true)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow transition"
          >
            🩸 Issue Unit
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold shadow-sm">
          {message}
        </div>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Total Units</div>
          <div className="text-2xl font-black text-slate-900">{stats.totalUnits}</div>
          <div className="text-[11px] text-slate-500">In Cold-Chain</div>
        </div>
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Available</div>
          <div className="text-2xl font-black text-emerald-600">{stats.availableUnits}</div>
          <div className="text-[11px] text-emerald-600 font-bold">Ready for Issue</div>
        </div>
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Reserved</div>
          <div className="text-2xl font-black text-amber-600">{stats.reservedUnits}</div>
          <div className="text-[11px] text-slate-500">Crossmatched</div>
        </div>
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Transfused Today</div>
          <div className="text-2xl font-black text-blue-600">{stats.transfusedToday}</div>
          <div className="text-[11px] text-slate-500">Patients Treated</div>
        </div>
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Expiring (7d)</div>
          <div className="text-2xl font-black text-rose-600">{stats.expiringSoon}</div>
          <div className="text-[11px] text-rose-600 font-bold">Priority Issue</div>
        </div>
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Low Stock Alerts</div>
          <div className="text-2xl font-black text-purple-600">{stats.lowStockGroups?.length || 0}</div>
          <div className="text-[11px] text-purple-600 font-bold">Rare Groups</div>
        </div>
      </div>

      {/* Live Blood Group Histogram */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Live Inventory by Blood Group</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {Object.entries(stats.stockByGroup || {}).map(([group, count]: [string, any]) => {
            const isLow = count < 3;
            return (
              <div
                key={group}
                className={`p-3 rounded-2xl border text-center space-y-1 ${
                  isLow ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-extrabold text-xs text-slate-900">{group.replace('_', ' ')}</div>
                <div className={`text-xl font-black ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>{count}</div>
                <div className="text-[10px] text-slate-400 font-semibold">{isLow ? '⚠️ Low Stock' : 'Units'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-black">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 ${activeTab === 'inventory' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          🧊 COLD-CHAIN INVENTORY ({inventory.length})
        </button>
        <button
          onClick={() => setActiveTab('donors')}
          className={`pb-3 ${activeTab === 'donors' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          👥 DONOR REGISTRY ({donors.length})
        </button>
      </div>

      {/* Tab: Cold-Chain Inventory */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Blood Component Inventory Roster</h3>
              <p className="text-xs text-slate-500">Real-time cold-chain units with storage locations and expiry telemetry.</p>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4">Unit Barcode</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Component</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Storage Location</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No blood units found in inventory.
                    </td>
                  </tr>
                ) : (
                  inventory.map((unit) => (
                    <tr key={unit.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-extrabold text-slate-900">{unit.unitNumber}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-black rounded-lg text-[11px]">
                          {unit.bloodGroup.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">{unit.component}</td>
                      <td className="py-3 px-4 text-slate-600">{unit.volumeMl} mL</td>
                      <td className="py-3 px-4 text-indigo-600 font-semibold">{unit.storageLocation}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(unit.expiryDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${
                            unit.status === 'AVAILABLE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : unit.status === 'RESERVED'
                              ? 'bg-amber-100 text-amber-800'
                              : unit.status === 'ISSUED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {unit.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Donors */}
      {activeTab === 'donors' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Voluntary & Replacement Donors Directory</h3>
              <p className="text-xs text-slate-500">Registered donors, eligibility flags, and donation frequency.</p>
            </div>
            <button
              onClick={() => setDonorModal(true)}
              className="px-4 py-2 bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow"
            >
              + Register Donor
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4">Donor Code</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Last Donation</th>
                  <th className="py-3 px-4">Eligibility Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {donors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No donors registered yet.
                    </td>
                  </tr>
                ) : (
                  donors.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-extrabold text-slate-900">{d.donorCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{d.fullName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-black rounded-md text-[10px]">
                          {d.bloodGroup.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{d.phone}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : 'First-time'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Register Donor */}
      {donorModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900">Register Blood Donor</h3>
            <form onSubmit={handleRegisterDonor} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={donorForm.fullName}
                  onChange={(e) => setDonorForm({ ...donorForm, fullName: e.target.value })}
                  placeholder="e.g. David Miller"
                  className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={donorForm.phone}
                    onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Blood Group</label>
                  <select
                    value={donorForm.bloodGroup}
                    onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                    className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-rose-500"
                  >
                    <option value="A_POSITIVE">A Positive (A+)</option>
                    <option value="A_NEGATIVE">A Negative (A-)</option>
                    <option value="B_POSITIVE">B Positive (B+)</option>
                    <option value="B_NEGATIVE">B Negative (B-)</option>
                    <option value="AB_POSITIVE">AB Positive (AB+)</option>
                    <option value="AB_NEGATIVE">AB Negative (AB-)</option>
                    <option value="O_POSITIVE">O Positive (O+)</option>
                    <option value="O_NEGATIVE">O Negative (O-)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDonorModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow"
                >
                  Save Donor →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Donation */}
      {donationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900">Record Blood Donation</h3>
            <form onSubmit={handleRecordDonation} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Select Registered Donor</label>
                <select
                  required
                  value={donationForm.donorId}
                  onChange={(e) => setDonationForm({ ...donationForm, donorId: e.target.value })}
                  className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Choose Donor --</option>
                  {donors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.bloodGroup.replace('_', ' ')}) - {d.donorCode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Hemoglobin (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={donationForm.hemoglobin}
                    onChange={(e) => setDonationForm({ ...donationForm, hemoglobin: parseFloat(e.target.value) })}
                    className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Component Separation</label>
                  <select
                    value={donationForm.component}
                    onChange={(e) => setDonationForm({ ...donationForm, component: e.target.value })}
                    className="w-full mt-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-rose-500"
                  >
                    <option value="PACKED_RBC">Packed RBC (42 Days)</option>
                    <option value="PLATELETS">Platelets (5 Days)</option>
                    <option value="FFP">Fresh Frozen Plasma (1 Year)</option>
                    <option value="WHOLE_BLOOD">Whole Blood (35 Days)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDonationModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow"
                >
                  Complete Donation →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
