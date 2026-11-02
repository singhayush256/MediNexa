'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  Shield,
  Filter,
  Send,
  Download,
  Building2,
  X,
} from 'lucide-react';

interface TpaClaimItem {
  id: string;
  claimId: string;
  provider: string;
  patientName: string;
  policyNumber: string;
  patientUhid: string;
  admissionDate: string;
  amount: number;
  status: 'Approved' | 'Cashless Settled' | 'Under Adjudication' | 'Query Raised';
  procedure?: string;
  approvedAmount?: number;
}

const initialClaims: TpaClaimItem[] = [
  {
    id: '1',
    claimId: 'SH-2026-9012',
    provider: 'Star Health Insurance',
    patientName: 'Rajesh Kumar',
    policyNumber: 'PL-88123456',
    patientUhid: 'MH-UHID-9001',
    admissionDate: '15 Oct 2026',
    amount: 280000,
    approvedAmount: 280000,
    status: 'Approved',
    procedure: 'Coronary Angioplasty with Drug-Eluting Stent',
  },
  {
    id: '2',
    claimId: 'HE-2026-4410',
    provider: 'HDFC ERGO General Insurance',
    patientName: 'Priya Singh',
    policyNumber: 'PL-99234567',
    patientUhid: 'MH-UHID-9002',
    admissionDate: '16 Oct 2026',
    amount: 195000,
    approvedAmount: 195000,
    status: 'Cashless Settled',
    procedure: 'Laparoscopic Cholecystectomy',
  },
  {
    id: '3',
    claimId: 'IL-2026-1120',
    provider: 'ICICI Lombard Health',
    patientName: 'Amit Sharma',
    policyNumber: 'PL-77345678',
    patientUhid: 'MH-UHID-9003',
    admissionDate: '17 Oct 2026',
    amount: 315000,
    approvedAmount: 290000,
    status: 'Under Adjudication',
    procedure: 'Total Knee Replacement (Unilateral)',
  },
  {
    id: '4',
    claimId: 'CH-2026-3355',
    provider: 'Care Health Insurance',
    patientName: 'Sunita Devi',
    policyNumber: 'PL-66456789',
    patientUhid: 'MH-UHID-9004',
    admissionDate: '18 Oct 2026',
    amount: 240000,
    approvedAmount: 240000,
    status: 'Approved',
    procedure: 'Spinal Decompression & Microdiscectomy',
  },
  {
    id: '5',
    claimId: 'NI-2026-2001',
    provider: 'New India Assurance',
    patientName: 'Suresh Patel',
    policyNumber: 'PL-55567890',
    patientUhid: 'MH-UHID-9005',
    admissionDate: '19 Oct 2026',
    amount: 110000,
    approvedAmount: 85000,
    status: 'Query Raised',
    procedure: 'Cataract Phacoemulsification with Foldable IOL',
  },
];

export function TpaInsuranceEasyView() {
  const [claimsList, setClaimsList] = useState<TpaClaimItem[]>(initialClaims);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClaim, setSelectedClaim] = useState<TpaClaimItem | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleSubmitEAuth = (claim: TpaClaimItem) => {
    setSuccessToast(`E-Auth for claim ${claim.claimId} submitted directly to ${claim.provider}!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const filteredClaims = claimsList.filter((c) => {
    const matchesFilter = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      c.claimId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientUhid.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: TpaClaimItem['status']) => {
    if (status === 'Approved') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          Approved
        </span>
      );
    }
    if (status === 'Cashless Settled') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">
          Cashless Settled
        </span>
      );
    }
    if (status === 'Under Adjudication') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          Under Adjudication
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
        Query Raised
      </span>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span className="text-xs font-bold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="p-1 text-emerald-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              TPA NETWORK
            </span>
            <span className="text-xs text-slate-500">Hospital Operations Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            TPA Claims Pre-Authorization Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cashless processing, instant eligibility verification, and digital E-Auth submission with 15+ TPAs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Claim ID, UHID, Patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Top 3 KPI Cards Grid matching Screenshot 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Active Claims */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Active Claims
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              ₹48,20,000
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">164 claims across 15 insurers</p>
          </div>
        </div>

        {/* Card 2: Cashless Approved */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cashless Approved
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              94.2%
            </div>
            <p className="text-[11px] text-teal-600 font-semibold mt-0.5">Instant desk pre-authorization</p>
          </div>
        </div>

        {/* Card 3: Average Adjudication Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Average Adjudication Time
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              4.2 hrs
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">IRDAI compliant turnaround</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-500">Filter Status:</span>
            {['ALL', 'Approved', 'Cashless Settled', 'Under Adjudication', 'Query Raised'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterStatus === s
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-900 dark:text-white">{filteredClaims.length}</strong> claims
          </div>
        </div>

        {/* Clean Claims Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Claim ID</th>
                <th className="py-3.5 px-4">Provider</th>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Policy Number</th>
                <th className="py-3.5 px-4">Patient UHID</th>
                <th className="py-3.5 px-4">Admission Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {claim.claimId}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {claim.provider}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {claim.patientName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {claim.policyNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {claim.patientUhid}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {claim.admissionDate}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                    ₹{claim.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(claim.status)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedClaim(claim)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition cursor-pointer shrink-0"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleSubmitEAuth(claim)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs cursor-pointer shrink-0"
                      >
                        Submit E-Auth
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  CLAIM FILE #{selectedClaim.claimId}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Pre-Authorization Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Patient & Policy</div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">{selectedClaim.patientName} ({selectedClaim.patientUhid})</div>
                <div className="text-slate-600 dark:text-slate-300">Policy: <span className="font-mono font-bold">{selectedClaim.policyNumber}</span> • {selectedClaim.provider}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Clinical Procedure</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{selectedClaim.procedure}</div>
                <div className="text-slate-500">Admission Date: {selectedClaim.admissionDate}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Claim Amount</div>
                  <div className="font-black text-base text-slate-900 dark:text-white mt-0.5">
                    ₹{selectedClaim.amount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Approved Amount</div>
                  <div className="font-black text-base text-emerald-600 mt-0.5">
                    ₹{(selectedClaim.approvedAmount || selectedClaim.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSubmitEAuth(selectedClaim);
                  setSelectedClaim(null);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
              >
                Transmit E-Auth
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
