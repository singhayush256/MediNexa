'use client';

import React, { useEffect, useState } from 'react';

export default function RevenueCycleManagementPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [receivables, setReceivables] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'receivables' | 'collections' | 'contracts' | 'invoices' | 'forecast'>('receivables');

  // Modals
  const [showCreateReceivableModal, setShowCreateReceivableModal] = useState(false);
  const [showCreateContractModal, setShowCreateContractModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showLogActivityModal, setShowLogActivityModal] = useState(false);
  const [showPayInvoiceModal, setShowPayInvoiceModal] = useState(false);
  const [showForecastModal, setShowForecastModal] = useState(false);

  // Form states
  const [selectedReceivableId, setSelectedReceivableId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');

  // Receivable form
  const [recType, setRecType] = useState('PATIENT');
  const [recAmount, setRecAmount] = useState(1500);
  const [recDueDate, setRecDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Contract form
  const [compName, setCompName] = useState('Tata Consultancy Services (TCS Corporate Health)');
  const [contNumber, setContNumber] = useState(`CORP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [contactPerson, setContactPerson] = useState('Rajesh Sharma');
  const [contactEmail, setContactEmail] = useState('healthcare@tcs.com');
  const [contactPhone, setContactPhone] = useState('+91-9876543210');
  const [creditLimit, setCreditLimit] = useState(500000);
  const [paymentTerms, setPaymentTerms] = useState(45);

  // Corporate invoice form
  const [invoiceContractId, setInvoiceContractId] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState(45000);
  const [invoiceDueDate, setInvoiceDueDate] = useState(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);

  // Collection activity form
  const [actType, setActType] = useState('CALL');
  const [actNotes, setActNotes] = useState('Patient contacted regarding copay balance. Promised to clear via UPI in 3 days.');

  // Pay invoice form
  const [payAmount, setPayAmount] = useState(20000);
  const [payRef, setPayRef] = useState(`TXN-BANK-${Date.now().toString().slice(-6)}`);

  // Forecast form
  const [forecastMonth, setForecastMonth] = useState('2026-09');
  const [projRevenue, setProjRevenue] = useState(420000);
  const [projCollections, setProjCollections] = useState(380000);
  const [projOutstanding, setProjOutstanding] = useState(40000);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/revenue/dashboard`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/revenue/receivables`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/revenue/contracts`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/revenue/invoices`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/revenue/collections`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/revenue/forecast`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([dash, rec, cont, inv, act, fore]) => {
        setDashboard(dash);
        setReceivables(Array.isArray(rec) ? rec : []);
        setContracts(Array.isArray(cont) ? cont : []);
        setInvoices(Array.isArray(inv) ? inv : []);
        setActivities(Array.isArray(act) ? act : []);
        setForecasts(Array.isArray(fore) ? fore : []);
        if (Array.isArray(cont) && cont.length > 0) setInvoiceContractId(cont[0].id);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateReceivable = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/revenue/receivables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          receivableType: recType,
          totalAmount: Number(recAmount),
          dueDate: recDueDate,
        }),
      });

      if (res.ok) {
        alert('Accounts Receivable recorded!');
        setShowCreateReceivableModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/revenue/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          companyName: compName,
          contractNumber: contNumber,
          contactPerson,
          email: contactEmail,
          phone: contactPhone,
          creditLimit: Number(creditLimit),
          paymentTermsDays: Number(paymentTerms),
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        }),
      });

      if (res.ok) {
        alert('Corporate Contract registered!');
        setShowCreateContractModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/revenue/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          contractId: invoiceContractId,
          amount: Number(invoiceAmount),
          dueDate: invoiceDueDate,
        }),
      });

      if (res.ok) {
        alert('Corporate Invoice generated & posted to AR!');
        setShowCreateInvoiceModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/revenue/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          receivableId: selectedReceivableId,
          activityType: actType,
          notes: actNotes,
        }),
      });

      if (res.ok) {
        alert('Recovery activity logged!');
        setShowLogActivityModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handlePayInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/revenue/invoices/${selectedInvoiceId}/pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          paidAmount: Number(payAmount),
          paymentReference: payRef,
        }),
      });

      if (res.ok) {
        alert('Payment settled on Corporate Invoice & AR balance updated!');
        setShowPayInvoiceModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/revenue/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          forecastMonth,
          projectedRevenue: Number(projRevenue),
          projectedCollections: Number(projCollections),
          projectedOutstanding: Number(projOutstanding),
        }),
      });

      if (res.ok) {
        alert('Revenue Forecast created!');
        setShowForecastModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const d = dashboard || {
    revenueToday: 18500,
    revenueMonth: 345000,
    collectionsMonth: 305000,
    outstandingAR: 40000,
    insuranceReceivables: 22000,
    corporateReceivables: 12000,
    patientReceivables: 6000,
    collectionRate: 88.5,
    badDebtPercentage: 1.8,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-500/30">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-black uppercase tracking-wider">
              💰 ENTERPRISE RCM & AR PLATFORM
            </span>
            <span className="px-2.5 py-0.5 bg-sky-400/20 text-sky-300 rounded-full text-[10px] font-bold">
              ACCOUNTS RECEIVABLE • CORPORATE BILLING • FORECASTING
            </span>
          </div>
          <h1 className="text-3xl font-black mt-2 tracking-tight">Revenue Cycle & AR Recovery Platform</h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
            Hospital financial backbone: end-to-end receivables tracking, multi-party payment allocation, corporate contracts, collections workflow, and forward revenue forecasting.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowCreateReceivableModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition"
          >
            ➕ Post AR Receivable
          </button>
          <button
            onClick={() => setShowCreateContractModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition"
          >
            🏢 New Corporate Contract
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Revenue Month</div>
          <div className="text-2xl font-black text-slate-900">${d.revenueMonth?.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">+8.4% vs target</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Collections</div>
          <div className="text-2xl font-black text-emerald-600">${d.collectionsMonth?.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">{d.collectionRate}% Recovered</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Total AR</div>
          <div className="text-2xl font-black text-rose-600">${d.outstandingAR?.toLocaleString()}</div>
          <div className="text-[10px] text-rose-600 font-semibold">Active Outstanding</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Insurance AR</div>
          <div className="text-2xl font-black text-sky-600">${d.insuranceReceivables?.toLocaleString()}</div>
          <div className="text-[10px] text-sky-600 font-semibold">TPA Pending Claims</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Corporate AR</div>
          <div className="text-2xl font-black text-indigo-600">${d.corporateReceivables?.toLocaleString()}</div>
          <div className="text-[10px] text-indigo-600 font-semibold">Credit Partnerships</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Bad Debt %</div>
          <div className="text-2xl font-black text-amber-600">{d.badDebtPercentage}%</div>
          <div className="text-[10px] text-emerald-600 font-semibold">Low Default Risk</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-3 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('receivables')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'receivables' ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📋 Accounts Receivable ({receivables.length})
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'collections' ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📞 Collections Workstation ({activities.length})
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'contracts' ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🏢 Corporate Contracts ({contracts.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'invoices' ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🧾 Corporate Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'forecast' ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📈 Revenue Forecasts ({forecasts.length})
        </button>
      </div>

      {/* Tab 1: Accounts Receivable */}
      {activeTab === 'receivables' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Accounts Receivable Aging Roster
            </h3>
            <span className="text-xs text-slate-400 font-bold">Automated 0-30, 31-60, 61-90, 91-120, 120+ Aging</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3">AR Number</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Total Amount</th>
                  <th className="py-3 px-3">Outstanding</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Aging (Days)</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {receivables.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{rec.receivableNumber}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px] font-bold">
                        {rec.receivableType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold">${rec.totalAmount?.toLocaleString()}</td>
                    <td className="py-3 px-3 font-bold text-rose-600">${rec.outstandingAmount?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-[10px] text-slate-400">{new Date(rec.dueDate).toLocaleDateString()}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        rec.agingDays > 90 ? 'bg-rose-100 text-rose-800' :
                        rec.agingDays > 30 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {rec.agingDays} Days
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded text-[10px] font-black">
                        {rec.collectionStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedReceivableId(rec.id);
                          setShowLogActivityModal(true);
                        }}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-lg shadow"
                      >
                        📞 Log Recovery
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Collections Workstation */}
      {activeTab === 'collections' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              📞 Collections & Recovery Intervention Timeline
            </h3>
            <span className="text-xs text-slate-400 font-bold">Calls, Legal Notices, Promises to Pay</span>
          </div>

          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white font-black text-[10px] rounded">
                      {act.activityType}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      Receivable #{act.receivable?.receivableNumber || 'AR-REC'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700">{act.notes}</p>
                <div className="text-[10px] text-slate-500 font-bold">
                  Logged by: {act.performedBy?.firstName} {act.performedBy?.lastName || 'Agent'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Corporate Contracts */}
      {activeTab === 'contracts' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              🏢 Corporate Healthcare Partnerships & Credit Caps
            </h3>
            <button
              onClick={() => setShowCreateContractModal(true)}
              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow"
            >
              ➕ Register Contract
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contracts.map((c) => (
              <div key={c.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-indigo-900">{c.contractNumber}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[10px]">
                    ACTIVE
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">{c.companyName}</h4>
                <div className="text-xs text-slate-600 font-medium space-y-1">
                  <p><strong>Contact:</strong> {c.contactPerson} ({c.phone})</p>
                  <p><strong>Credit Cap:</strong> ${c.creditLimit?.toLocaleString()}</p>
                  <p><strong>Payment Terms:</strong> Net {c.paymentTermsDays} Days</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Corporate Invoices */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              🧾 Corporate Invoices & Credit Settlements
            </h3>
            <button
              onClick={() => setShowCreateInvoiceModal(true)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow"
            >
              ➕ Generate Corporate Invoice
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3">Invoice Number</th>
                  <th className="py-3 px-3">Company</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Paid</th>
                  <th className="py-3 px-3">Balance</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 font-bold text-indigo-950">{inv.contract?.companyName || 'Corporate Partner'}</td>
                    <td className="py-3 px-3 font-bold">${inv.amount?.toLocaleString()}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">${inv.paidAmount?.toLocaleString()}</td>
                    <td className="py-3 px-3 font-bold text-rose-600">${inv.balanceAmount?.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      {inv.status !== 'PAID' && (
                        <button
                          onClick={() => {
                            setSelectedInvoiceId(inv.id);
                            setPayAmount(inv.balanceAmount);
                            setShowPayInvoiceModal(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-lg shadow"
                        >
                          💳 Settle Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Revenue Forecasts */}
      {activeTab === 'forecast' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              📈 Forward Financial Pipeline & Projected Cash Flows
            </h3>
            <button
              onClick={() => setShowForecastModal(true)}
              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow"
            >
              ➕ Create Forecast
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecasts.map((f) => (
              <div key={f.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-slate-900">{f.forecastMonth}</span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-black text-[10px]">
                    FORECAST
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-medium space-y-1">
                  <div className="flex justify-between"><span>Projected Revenue:</span><strong className="text-emerald-700">${f.projectedRevenue?.toLocaleString()}</strong></div>
                  <div className="flex justify-between"><span>Projected Collections:</span><strong>${f.projectedCollections?.toLocaleString()}</strong></div>
                  <div className="flex justify-between"><span>Projected AR Pipeline:</span><strong className="text-rose-600">${f.projectedOutstanding?.toLocaleString()}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create Receivable */}
      {showCreateReceivableModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Post Accounts Receivable</h3>
            <form onSubmit={handleCreateReceivable} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Receivable Type *</label>
                <select
                  value={recType}
                  onChange={(e) => setRecType(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="PATIENT">Patient Copay / Self-Pay</option>
                  <option value="INSURANCE">Insurance TPA Settlement</option>
                  <option value="CORPORATE">Corporate Partner Bill</option>
                </select>
              </div>
              <div>
                <label>Total Amount ($) *</label>
                <input
                  type="number"
                  required
                  value={recAmount}
                  onChange={(e) => setRecAmount(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Due Date *</label>
                <input
                  type="date"
                  required
                  value={recDueDate}
                  onChange={(e) => setRecDueDate(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateReceivableModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black shadow"
                >
                  Post Receivable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Corporate Contract */}
      {showCreateContractModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Register Corporate Contract</h3>
            <form onSubmit={handleCreateContract} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Company Name *</label>
                <input
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Contract Number *</label>
                <input
                  required
                  value={contNumber}
                  onChange={(e) => setContNumber(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
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
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div>
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Credit Limit ($) *</label>
                  <input
                    type="number"
                    required
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label>Payment Terms (Days) *</label>
                  <input
                    type="number"
                    required
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateContractModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-black shadow"
                >
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Corporate Invoice */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Generate Corporate Invoice</h3>
            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Select Corporate Contract *</label>
                <select
                  value={invoiceContractId}
                  onChange={(e) => setInvoiceContractId(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contractNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Invoice Amount ($) *</label>
                <input
                  type="number"
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
                  value={invoiceDueDate}
                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black shadow"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Activity */}
      {showLogActivityModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Log Recovery Activity</h3>
            <form onSubmit={handleLogActivity} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Activity Channel *</label>
                <select
                  value={actType}
                  onChange={(e) => setActType(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="CALL">Phone Call</option>
                  <option value="EMAIL">Formal Email Reminder</option>
                  <option value="SMS">SMS Notice</option>
                  <option value="LEGAL_NOTICE">Legal Demand Notice</option>
                  <option value="VISIT">In-Person Visit</option>
                </select>
              </div>
              <div>
                <label>Recovery Notes *</label>
                <textarea
                  rows={3}
                  required
                  value={actNotes}
                  onChange={(e) => setActNotes(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLogActivityModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black shadow"
                >
                  Log Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pay Invoice */}
      {showPayInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Settle Corporate Invoice Payment</h3>
            <form onSubmit={handlePayInvoice} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Payment Amount ($) *</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Payment Reference Number *</label>
                <input
                  required
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPayInvoiceModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black shadow"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Forecast */}
      {showForecastModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Create Revenue Forecast</h3>
            <form onSubmit={handleCreateForecast} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Forecast Month (YYYY-MM) *</label>
                <input
                  required
                  value={forecastMonth}
                  onChange={(e) => setForecastMonth(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label>Projected Revenue ($) *</label>
                <input
                  type="number"
                  required
                  value={projRevenue}
                  onChange={(e) => setProjRevenue(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Projected Collections ($) *</label>
                <input
                  type="number"
                  required
                  value={projCollections}
                  onChange={(e) => setProjCollections(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Projected AR Pipeline ($) *</label>
                <input
                  type="number"
                  required
                  value={projOutstanding}
                  onChange={(e) => setProjOutstanding(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForecastModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-black shadow"
                >
                  Save Forecast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
