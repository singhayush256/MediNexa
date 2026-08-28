'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface OpdTokenItem {
  id: string;
  tokenNumber: string;
  queueNumber: number;
  patientName: string;
  status: string;
  priority: string;
  doctor?: { user?: { firstName: string; lastName: string }; department?: { name: string } };
  department?: { name: string; code: string };
  facility?: { id: string; name: string };
}

interface LiveBoardData {
  facilityId?: string;
  nowServing: OpdTokenItem[];
  waitingQueue: OpdTokenItem[];
  totalActiveQueue: number;
  updatedAt: string;
}

export default function PublicWaitingRoomDisplayPage() {
  const [boardData, setBoardData] = useState<LiveBoardData | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchLiveBoard();
    const interval = setInterval(fetchLiveBoard, 5000); // 5s Auto Refresh
    return () => clearInterval(interval);
  }, []);

  const fetchLiveBoard = async () => {
    try {
      const res = await fetch(`${apiUrl}/opd/live-board`);
      const data = await res.json();
      setBoardData(data);
    } catch (err) {
      console.error('Failed to fetch OPD live board:', err);
    } finally {
      setLoading(false);
    }
  };

  const topServing = boardData?.nowServing?.[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans p-6 sm:p-10 space-y-8">
      {/* Display Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg">
            M
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">MediNexa OPD Live Waiting Board</h1>
            <p className="text-xs text-sky-400 font-semibold mt-0.5">
              Outpatient Department Digital Display System • Real-Time Live Sync
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400 font-mono">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping mr-2"></span>
          Auto-Refreshing Live • {boardData?.updatedAt ? new Date(boardData.updatedAt).toLocaleTimeString() : ''}
        </div>
      </header>

      {/* Main Display Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-500 font-bold text-lg animate-pulse">
          Loading digital waiting room display...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          {/* Main Hero Box — NOW SERVING */}
          <div className="lg:col-span-2 bg-gradient-to-br from-sky-900 via-indigo-900 to-slate-900 border border-sky-600/30 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col justify-between space-y-8">
            <div className="flex justify-between items-start">
              <span className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-full shadow-md">
                NOW SERVING
              </span>
              <span className="text-xs text-sky-300 font-bold">
                {boardData?.totalActiveQueue || 0} Patients In Queue
              </span>
            </div>

            {topServing ? (
              <div className="space-y-6 text-center py-6">
                <div className="text-6xl sm:text-8xl font-black tracking-widest text-amber-400 font-mono drop-shadow-lg">
                  {topServing.tokenNumber}
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{topServing.patientName}</h2>
                  <p className="text-lg text-sky-300 font-bold">
                    Dr. {topServing.doctor?.user?.firstName} {topServing.doctor?.user?.lastName} • {topServing.department?.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center space-y-3 text-slate-400">
                <p className="text-2xl font-bold">All OPD Consultation Counters Clear</p>
                <p className="text-xs">Next token will be displayed here as soon as called by attending doctor.</p>
              </div>
            )}

            {/* Roster of Other Now Serving Tokens */}
            {boardData?.nowServing && boardData.nowServing.length > 1 && (
              <div className="border-t border-sky-800/50 pt-6">
                <span className="text-xs font-bold text-sky-300 uppercase block mb-3">Other Active Counters</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {boardData.nowServing.slice(1).map((s) => (
                    <div key={s.id} className="p-3 bg-slate-900/80 rounded-2xl border border-sky-700/30 text-center">
                      <span className="text-lg font-black font-mono text-amber-400">{s.tokenNumber}</span>
                      <span className="text-xs block text-slate-300 font-semibold truncate">{s.patientName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Side Panel — NEXT 10 TOKENS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col">
            <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-white">Upcoming Queue</h3>
              <span className="text-xs font-mono text-sky-400">NEXT 10 TOKENS</span>
            </div>

            {boardData?.waitingQueue.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-medium">
                No patients waiting in queue.
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                {boardData?.waitingQueue.map((t, idx) => (
                  <div
                    key={t.id}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="font-mono font-extrabold text-sky-400 text-sm block">{t.tokenNumber}</span>
                        <span className="text-slate-300 font-semibold">{t.patientName}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.priority === 'EMERGENCY' ? 'bg-red-900 text-red-200' : 'bg-slate-800 text-slate-400'}`}>
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 pt-4 text-center text-xs text-slate-500">
        MediNexa Outpatient Management Network • Please listen for your token number announcement.
      </footer>
    </div>
  );
}
