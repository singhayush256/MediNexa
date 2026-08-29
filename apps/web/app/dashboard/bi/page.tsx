'use client';

import React, { useEffect, useState } from 'react';

export default function BusinessIntelligenceCommandCenter() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [revenueTrends, setRevenueTrends] = useState<any>(null);
  const [bedAnalytics, setBedAnalytics] = useState<any>(null);
  const [doctorProductivity, setDoctorProductivity] = useState<any[]>([]);
  const [patientFlow, setPatientFlow] = useState<any>(null);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/bi/executive-dashboard`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/bi/revenue-trends`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/bi/bed-analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/bi/doctor-productivity`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/bi/patient-flow`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/bi/financial-summary`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/bi/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([dash, rev, beds, doc, flow, fin, anal]) => {
        setDashboard(dash);
        setRevenueTrends(rev);
        setBedAnalytics(beds);
        setDoctorProductivity(Array.isArray(doc) ? doc : []);
        setPatientFlow(flow);
        setFinancialSummary(fin);
        setAnalytics(anal);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const d = dashboard || {
    revenueToday: 18450,
    revenueMonth: 548000,
    opdVisitsToday: 142,
    telemedicineToday: 28,
    admissionsToday: 16,
    dischargesToday: 12,
    bedOccupancyRate: 73.3,
    emergencyPatientsToday: 34,
    pharmacyRevenue: 45200,
    labRevenue: 38900,
    avgLengthOfStay: 4.2,
    patientSatisfaction: 96.8,
  };

  const b = bedAnalytics || {
    totalBeds: 120,
    occupiedBeds: 88,
    availableBeds: 32,
    icuOccupancy: 90.0,
    wardOccupancy: 70.0,
    breakdownByWard: [
      { wardName: 'Intensive Care Unit (ICU)', total: 20, occupied: 18, rate: 90.0 },
      { wardName: 'Cardiac Care Unit (CCU)', total: 15, occupied: 12, rate: 80.0 },
      { wardName: 'General Surgery Ward', total: 40, occupied: 31, rate: 77.5 },
      { wardName: 'Pediatric Inpatient Wing', total: 25, occupied: 15, rate: 60.0 },
      { wardName: 'Orthopedic & Trauma Ward', total: 20, occupied: 10, rate: 50.0 },
    ],
  };

  const a = analytics || {
    hospitalPerformanceScore: 96.4,
    clinicalQualityIndex: 98.2,
    patientSafetyScore: 99.1,
    operationalEfficiencyIndex: 94.7,
    financialHealthScore: 95.8,
    activeAlerts: [
      { id: 'ALT-1', severity: 'WARNING', title: 'ICU Bed Capacity Alert', message: 'ICU occupancy reached 90% (18/20 beds occupied).' },
      { id: 'ALT-2', severity: 'INFO', title: 'Pharmacy Inventory Reorder', message: 'Antibiotic injectable stock reached reorder threshold.' },
      { id: 'ALT-3', severity: 'SUCCESS', title: 'NABH Accreditation Compliance', message: 'Transfusion crossmatch safety compliance at 100%.' },
    ],
  };

  const pFlow = patientFlow || {
    opdCount: 450,
    admissionCount: 78,
    dischargeCount: 64,
    conversionRateOpdToIpd: 17.3,
    averageWaitTimeMin: 14.5,
    averageLosDays: 4.1,
    funnel: [
      { stage: 'OPD Outpatient Consultations', count: 450, percentage: 100 },
      { stage: 'Emergency / Triage Registrations', count: 158, percentage: 35 },
      { stage: 'Inpatient Ward Admissions', count: 78, percentage: 17.3 },
      { stage: 'Discharge Summaries & Clearance', count: 64, percentage: 14.2 },
    ],
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-black uppercase tracking-wider">
              🏥 C-SUITE EXECUTIVE COMMAND CENTER
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
              LIVE TELEMETRY
            </span>
          </div>
          <h1 className="text-3xl font-black mt-2 tracking-tight">Healthcare Business Intelligence & Executive KPI Dashboard</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Real-time operational, clinical, revenue, bed occupancy, doctor productivity, and patient funnel analytics for hospital leadership.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Hospital Performance Score</div>
            <div className="text-2xl font-black text-emerald-400">{a.hospitalPerformanceScore} / 100</div>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* 8 Primary Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Revenue Today</div>
          <div className="text-lg font-black text-emerald-600">${Number(d.revenueToday).toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">↑ Accrual</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Revenue (Month)</div>
          <div className="text-lg font-black text-slate-900">${Number(d.revenueMonth).toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 font-semibold">MTD Total</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">OPD Visits</div>
          <div className="text-lg font-black text-blue-600">{d.opdVisitsToday}</div>
          <div className="text-[10px] text-slate-500 font-semibold">Consultations</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Admissions</div>
          <div className="text-lg font-black text-indigo-600">{d.admissionsToday}</div>
          <div className="text-[10px] text-indigo-600 font-semibold">Inpatients</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Discharges</div>
          <div className="text-lg font-black text-teal-600">{d.dischargesToday}</div>
          <div className="text-[10px] text-teal-600 font-semibold">Clearances</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Bed Occupancy</div>
          <div className="text-lg font-black text-amber-600">{d.bedOccupancyRate}%</div>
          <div className="text-[10px] text-amber-600 font-semibold">Active Inpatients</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Telemedicine</div>
          <div className="text-lg font-black text-purple-600">{d.telemedicineToday}</div>
          <div className="text-[10px] text-purple-600 font-semibold">Virtual Care</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Emergency / ER</div>
          <div className="text-lg font-black text-rose-600">{d.emergencyPatientsToday}</div>
          <div className="text-[10px] text-rose-600 font-semibold">Triage Cases</div>
        </div>
      </div>

      {/* Operational Alerts & Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Real-time Alerts */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              🚨 Active Operational & Clinical Alerts ({a.activeAlerts?.length || 0})
            </h3>
            <span className="text-[11px] font-bold text-slate-400">Automated EMR Engine</span>
          </div>
          <div className="space-y-2">
            {a.activeAlerts?.map((alt: any) => (
              <div
                key={alt.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 ${
                  alt.severity === 'WARNING'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : alt.severity === 'SUCCESS'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <div>
                  <div className="font-black text-xs">{alt.title}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{alt.message}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    alt.severity === 'WARNING'
                      ? 'bg-amber-200 text-amber-900'
                      : alt.severity === 'SUCCESS'
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-blue-200 text-blue-900'
                  }`}
                >
                  {alt.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quality & Safety Radar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Clinical Quality & Safety</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Clinical Quality Index</span>
                <span className="text-indigo-600">{a.clinicalQualityIndex}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${a.clinicalQualityIndex}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Patient Safety Score</span>
                <span className="text-emerald-600">{a.patientSafetyScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${a.patientSafetyScore}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Operational Efficiency</span>
                <span className="text-teal-600">{a.operationalEfficiencyIndex}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: `${a.operationalEfficiencyIndex}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Patient Satisfaction (CSAT)</span>
                <span className="text-purple-600">{d.patientSatisfaction}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${d.patientSatisfaction}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bed Occupancy & Capacity Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Bed Capacity & Ward Occupancy Telemetry</h3>
            <p className="text-xs text-slate-500">Live census monitoring across ICU, CCU, Surgical, and Pediatric wings.</p>
          </div>
          <div className="flex gap-4 text-xs font-bold">
            <span className="px-3 py-1.5 bg-slate-100 rounded-xl">Total Beds: <b className="text-slate-900">{b.totalBeds}</b></span>
            <span className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl">Occupied: <b>{b.occupiedBeds}</b></span>
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl">Available: <b>{b.availableBeds}</b></span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {b.breakdownByWard?.map((w: any) => (
            <div key={w.wardName} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-black text-xs text-slate-900 line-clamp-1">{w.wardName}</div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-800">{w.occupied} / {w.total}</span>
                <span className={`text-xs font-black ${w.rate >= 85 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {w.rate}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${w.rate >= 85 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${w.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Doctor Productivity & Patient Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Doctor Productivity Leaderboard */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Doctor Productivity Leaderboard</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Physician</th>
                  <th className="py-2.5 px-3">Specialty</th>
                  <th className="py-2.5 px-3">Patients</th>
                  <th className="py-2.5 px-3">Telehealth</th>
                  <th className="py-2.5 px-3">Scripts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {doctorProductivity.map((doc, idx) => (
                  <tr key={doc.doctorId || idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-extrabold text-slate-900">{doc.doctorName}</td>
                    <td className="py-2.5 px-3 text-slate-500">{doc.specialty}</td>
                    <td className="py-2.5 px-3 font-black text-indigo-600">{doc.patientsSeen}</td>
                    <td className="py-2.5 px-3 text-purple-600 font-semibold">{doc.telemedicineCount}</td>
                    <td className="py-2.5 px-3 text-slate-700">{doc.prescriptionsIssued}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient Flow Conversion Funnel */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Patient Flow & Admission Funnel</h3>
            <span className="text-xs font-extrabold text-emerald-600">Conv Rate: {pFlow.conversionRateOpdToIpd}%</span>
          </div>
          <div className="space-y-3 pt-2">
            {pFlow.funnel?.map((stage: any) => (
              <div key={stage.stage} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>{stage.stage}</span>
                  <span className="font-black text-indigo-700">{stage.count} ({stage.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(stage.percentage, 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
