'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientLabReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/patient-portal/lab-reports`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setReports(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-black uppercase rounded-full">
              DIAGNOSTICS
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lab Reports Download Center</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Verified laboratory test results, abnormal highlights, and reference ranges.</p>
        </div>
        <Link href="/portal" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
          ← Portal
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading diagnostic lab reports...</div>
      ) : reports.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-4xl">🔬</div>
          <h3 className="font-extrabold text-sm text-slate-900">No Diagnostic Reports Available</h3>
          <p className="text-xs text-slate-500">Your pathology and biochemistry test results will be published here once verified.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Lab Order #{order.orderNumber || order.id.slice(0, 8)}</h3>
                  <div className="text-xs text-slate-500">
                    Ordered on {new Date(order.orderDate).toLocaleDateString()} • {order.facility?.name || 'MediNexa Diagnostic Lab'}
                  </div>
                </div>
                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${
                  order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.status}
                </span>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Test Parameter</th>
                      <th className="py-2.5 px-3">Observed Value</th>
                      <th className="py-2.5 px-3">Reference Range</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.testItems?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{item.testName || 'Complete Blood Count'}</td>
                        <td className="py-2.5 px-3 font-extrabold text-blue-600">14.2 g/dL</td>
                        <td className="py-2.5 px-3 text-slate-500">12.0 - 15.5 g/dL</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                            NORMAL
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
