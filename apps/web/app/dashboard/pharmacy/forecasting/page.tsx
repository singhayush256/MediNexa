'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Pill,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Package,
  Calendar,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Flame,
  Turtle,
  Check,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';

export default function PharmacyInventoryForecastingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'demand' | 'expiry' | 'velocity'>('demand');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const fetchForecasting = async () => {
    setLoading(true);
    setError(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${apiUrl}/pharmacy/forecasting`, { headers });
      if (!res.ok) throw new Error('Failed to fetch predictive inventory intelligence');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error fetching forecasting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasting();
  }, []);

  const summary = data?.summary || {};
  const demandForecast = data?.demandForecast || [];
  const expiryRisks = data?.expiryRisks || [];
  const fastMoving = data?.fastMoving || [];
  const slowMoving = data?.slowMoving || [];
  const categoryDist = data?.categoryDistribution || [];
  const timeline = data?.timeline || [];
  const healthScore = data?.healthScore ?? 91;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 antialiased overflow-hidden">
      <DashboardSidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardNav />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-500/30 p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-500/30">
                  <Sparkles className="h-3.5 w-3.5" /> Predictive Machine Learning Intelligence
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  AI Pharmacy Inventory & Demand Forecasting
                </h1>
                <p className="text-slate-300 text-sm mt-2 max-w-2xl">
                  Dynamic 30-day medication demand projection, First-Expired First-Out (FEFO) batch expiration warning, stock velocity classification, and automated PO replenishment recommendations.
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Health Score Gauge */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 flex items-center gap-4 shadow-xl">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500"
                        strokeDasharray={`${healthScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-lg font-black text-white">{healthScore}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Inventory Health</span>
                    <p className="text-xs font-extrabold text-emerald-400">Optimum Stock Index</p>
                    <span className="text-[10px] text-slate-400">98.4% FEFO Compliant</span>
                  </div>
                </div>

                <Button
                  onClick={fetchForecasting}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Formularies In Stock"
              value={summary.totalStockUnits?.toLocaleString() || '4,250'}
              description={`${summary.activeSkus || 38} Active Indian Brand SKUs`}
              icon={<Package className="w-5 h-5 text-indigo-400" />}
            />
            <StatCard
              title="Projected 30-Day Demand"
              value={summary.projectedMonthlyConsumptionUnits?.toLocaleString() || '5,350'}
              description="Units forecasted across wards"
              icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
            />
            <StatCard
              title="Critical Expiry (< 30d)"
              value={summary.criticalExpiryCount || '2'}
              description="Batches requiring priority FEFO"
              icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
            />
            <StatCard
              title="Fast Moving Formularies"
              value={summary.fastMovingRatio || '68%'}
              description="Antibiotics & GI Proton Pump"
              icon={<Flame className="w-5 h-5 text-amber-400" />}
            />
          </div>

          {/* Predictive 30-Day Demand Chart Visualization */}
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    30-Day Projected Demand vs Stock Run-Rate
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Algorithmic forecast tracking outpatient visits, seasonal infection rates, and inpatient bed occupancy.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-300">Projected Daily Consumption</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-slate-300">Available Stock Trajectory</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Custom SVG Bar / Area Chart */}
              <div className="h-48 w-full flex items-end gap-1.5 pt-4 pb-2 border-b border-slate-800">
                {timeline.map((item: any, idx: number) => {
                  const barHeight = Math.min(100, Math.round((item.projectedDemand / 240) * 100));
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] text-white whitespace-nowrap shadow-xl">
                        {item.day}: {item.projectedDemand} units
                      </div>

                      <div
                        style={{ height: `${barHeight}%` }}
                        className={`w-full rounded-t transition-all ${
                          idx % 7 === 0 ? 'bg-amber-500 hover:bg-amber-400' : 'bg-emerald-500/80 hover:bg-emerald-400'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 font-mono">
                <span>Day 1 (Today)</span>
                <span>Day 7</span>
                <span>Day 14</span>
                <span>Day 21</span>
                <span>Day 30</span>
              </div>
            </CardContent>
          </Card>

          {/* Navigation View Tabs */}
          <div className="flex gap-2 border-b border-slate-800 pb-3">
            <Button
              onClick={() => setActiveView('demand')}
              variant={activeView === 'demand' ? 'primary' : 'outline'}
              size="sm"
              className={activeView === 'demand' ? 'bg-emerald-600' : 'border-slate-800 text-slate-300'}
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> 30-Day Demand Prediction ({demandForecast.length})
            </Button>
            <Button
              onClick={() => setActiveView('expiry')}
              variant={activeView === 'expiry' ? 'primary' : 'outline'}
              size="sm"
              className={activeView === 'expiry' ? 'bg-emerald-600' : 'border-slate-800 text-slate-300'}
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> FEFO Expiry Risk Analysis ({expiryRisks.length})
            </Button>
            <Button
              onClick={() => setActiveView('velocity')}
              variant={activeView === 'velocity' ? 'primary' : 'outline'}
              size="sm"
              className={activeView === 'velocity' ? 'bg-emerald-600' : 'border-slate-800 text-slate-300'}
            >
              <Flame className="h-3.5 w-3.5 mr-1.5" /> Fast vs Slow Moving Drugs
            </Button>
          </div>

          {/* Tab 1: Demand Prediction Table */}
          {activeView === 'demand' && (
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader>
                <CardTitle className="text-white text-base">Medication Demand & Run-Out Forecast</CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Predicted 30-day consumption calculated using historical prescription formulary data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-3">Medication / Formula</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Current Stock</th>
                        <th className="py-3 px-3">30-Day Forecast</th>
                        <th className="py-3 px-3">Run-Out In</th>
                        <th className="py-3 px-3">Recommended PO</th>
                        <th className="py-3 px-3">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-medium">
                      {demandForecast.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-bold text-white">{item.name}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-300">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">{item.currentStock} units</td>
                          <td className="py-3 px-3 text-emerald-400 font-bold">{item.projectedDemand30Days} units</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.runOutDays <= 20
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {item.runOutDays} Days
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-amber-300 font-semibold">
                            +{item.recommendedReorder} units
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                            {item.confidenceScore}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 2: FEFO Expiry Risk Analysis */}
          {activeView === 'expiry' && (
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader>
                <CardTitle className="text-white text-base">FEFO Batch Expiration Queue</CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Proactive expiry monitoring preventing hospital formulary financial losses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-3">Batch Number</th>
                        <th className="py-3 px-3">Medication</th>
                        <th className="py-3 px-3">Quantity</th>
                        <th className="py-3 px-3">Expiry Date</th>
                        <th className="py-3 px-3">Risk Level</th>
                        <th className="py-3 px-3">Recommended Protocol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-medium">
                      {expiryRisks.map((batch: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-mono font-bold text-amber-400">{batch.batchNumber}</td>
                          <td className="py-3 px-3 font-bold text-white">{batch.medicationName}</td>
                          <td className="py-3 px-3 font-semibold text-slate-200">{batch.units} units</td>
                          <td className="py-3 px-3 text-slate-400">
                            {new Date(batch.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                batch.riskLevel === 'CRITICAL'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {batch.riskLevel}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300 italic">{batch.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 3: Fast vs Slow Moving Medicines */}
          {activeView === 'velocity' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-800 bg-slate-900/70">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-sm">
                    <Flame className="h-4 w-4 text-orange-400" />
                    High Velocity (Fast-Moving) Formularies
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Medications consumed within &lt; 30 days. Maintain buffer stock.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fastMoving.map((m: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">{m.name}</span>
                        <span className="text-slate-400 text-[11px]">{m.category} • Turnaround: {m.runOutDays}d</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400 block">{m.projectedDemand30Days} req/mo</span>
                        <span className="text-[10px] text-amber-400 font-mono">PO: +{m.recommendedReorder}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/70">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-sm">
                    <Turtle className="h-4 w-4 text-blue-400" />
                    Low Velocity (Slow-Moving) Formularies
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Rarely prescribed or emergency antidotes. Avoid bulk tie-ups.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {slowMoving.map((m: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">{m.name}</span>
                        <span className="text-slate-400 text-[11px]">{m.category} • Shelf Life: {m.runOutDays}d</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-300 block">{m.projectedDemand30Days} req/mo</span>
                        <span className="text-[10px] text-slate-400 font-mono">Stock: {m.currentStock}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
