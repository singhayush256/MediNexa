'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface SessionData {
  id: string;
  roomName: string;
  roomToken?: string;
  status: string;
  patientId: string;
  doctorId: string;
  patient?: { user?: { firstName: string; lastName: string } };
  doctor?: { user?: { firstName: string; lastName: string } };
  facility?: { id: string; name: string };
  chatMessages?: { id: string; senderName: string; message: string; sentAt: string }[];
}

export default function VirtualConsultationRoomPage({ params }: { params: { sessionId: string } }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Call Controls State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Real-time Chat State
  const [chatMessages, setChatMessages] = useState<{ id: string; senderName: string; message: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Doctor Action Modals State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showLabOrderModal, setShowLabOrderModal] = useState(false);
  const [medicationName, setMedicationName] = useState('Paracetamol 500mg');
  const [dose, setDose] = useState('1 tab TID for 5 days');
  const [labTestName, setLabTestName] = useState('Complete Blood Count (CBC)');
  const [actionSuccess, setActionSuccess] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchSession();
  }, [params.sessionId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session?.status === 'LIVE') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session?.status]);

  const fetchSession = async () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) {
      setErrorMsg('Authentication token missing.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/telemedicine/session/${params.sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load session');

      setSession(data);
      if (Array.isArray(data.chatMessages)) setChatMessages(data.chatMessages);

      // Auto-join room
      await fetch(`${apiUrl}/telemedicine/session/${params.sessionId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async () => {
    const token = localStorage.getItem('medinexa_token');
    try {
      const res = await fetch(`${apiUrl}/telemedicine/session/${params.sessionId}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchSession();
    } catch (err) {
      console.error('Failed to start consultation:', err);
    }
  };

  const handleEndConsultation = async () => {
    const token = localStorage.getItem('medinexa_token');
    try {
      const res = await fetch(`${apiUrl}/telemedicine/session/${params.sessionId}/end`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchSession();
    } catch (err) {
      console.error('Failed to end consultation:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const token = localStorage.getItem('medinexa_token');
    try {
      const res = await fetch(`${apiUrl}/telemedicine/chat`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: params.sessionId, message: chatInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages((prev) => [...prev, data]);
        setChatInput('');
      }
    } catch (err) {
      console.error('Failed to send chat message:', err);
    }
  };

  const handleCreateInSessionPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    try {
      const res = await fetch(`${apiUrl}/prescriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: session?.patientId,
          doctorId: session?.doctorId,
          facilityId: session?.facility?.id,
          medications: [{ medicationName, dosage: dose, frequency: 'TID', duration: '5 days' }],
        }),
      });
      if (res.ok) {
        setShowPrescriptionModal(false);
        setActionSuccess('✓ E-Prescription issued to patient in-session!');
      }
    } catch (err) {
      console.error('Failed to issue prescription:', err);
    }
  };

  const handleCreateInSessionLabOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    try {
      const res = await fetch(`${apiUrl}/lab/orders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: session?.patientId,
          doctorId: session?.doctorId,
          facilityId: session?.facility?.id,
          testNames: [labTestName],
        }),
      });
      if (res.ok) {
        setShowLabOrderModal(false);
        setActionSuccess('✓ Diagnostic Lab Order created in-session!');
      }
    } catch (err) {
      console.error('Failed to create lab order:', err);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Initializing WebRTC video room...</div>;
  }

  if (errorMsg || !session) {
    return (
      <div className="p-12 max-w-lg mx-auto text-center space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-bold text-xs">
          ⚠️ {errorMsg || 'Session not found'}
        </div>
        <Link href="/dashboard/telemedicine" className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl inline-block">
          Return to Telemedicine Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/telemedicine" className="text-slate-400 font-bold text-xs hover:text-slate-700">
            ← Exit Call
          </Link>
          <div>
            <h1 className="text-base font-extrabold text-slate-900">
              Virtual Room: <span className="font-mono text-sky-600">{session.roomName}</span>
            </h1>
            <p className="text-[11px] font-semibold text-slate-500">
              Patient: {session.patient?.user?.firstName} {session.patient?.user?.lastName} | Doctor: Dr. {session.doctor?.user?.firstName} {session.doctor?.user?.lastName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-full flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            <span>RTC CONNECTED HD</span>
          </span>

          {session.status === 'LIVE' && (
            <span className="px-3 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded-xl">
              ⏱️ {formatTimer(timerSeconds)}
            </span>
          )}

          {session.status === 'WAITING' && (
            <button
              onClick={handleStartConsultation}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Start Consultation ▶
            </button>
          )}

          {session.status === 'LIVE' && (
            <button
              onClick={handleEndConsultation}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              End Call 🟥
            </button>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold">
          {actionSuccess}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative bg-slate-900 rounded-3xl overflow-hidden aspect-video flex items-center justify-center shadow-2xl border border-slate-800">
            {/* Simulated Remote Video Feed */}
            {isCamOn ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
                <div className="text-center space-y-3">
                  <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-inner text-3xl">
                    🩺
                  </div>
                  <span className="text-sm font-bold text-slate-200 block">
                    {session.status === 'LIVE' ? 'HD Secure WebRTC Video Stream' : 'Waiting for doctor to begin consultation...'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 font-bold text-xs">Camera Turned Off</div>
            )}

            {/* Self Picture-in-Picture Preview */}
            <div className="absolute bottom-4 right-4 w-36 aspect-video bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg flex items-center justify-center text-[10px] text-slate-400 font-bold">
              Self Preview
            </div>

            {/* In-Call Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-3 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-2.5 rounded-xl font-bold text-xs transition ${isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-600 text-white'}`}
              >
                {isMicOn ? '🎙️ Mic On' : '🔇 Muted'}
              </button>
              <button
                onClick={() => setIsCamOn(!isCamOn)}
                className={`p-2.5 rounded-xl font-bold text-xs transition ${isCamOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-600 text-white'}`}
              >
                {isCamOn ? '📹 Cam On' : '🚫 Cam Off'}
              </button>
            </div>
          </div>

          {/* In-Session Doctor Quick CTAs */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-extrabold text-slate-700 uppercase">In-Session Doctor Workstation CTAs:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPrescriptionModal(true)}
                className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-xl transition"
              >
                💊 E-Prescription
              </button>
              <button
                onClick={() => setShowLabOrderModal(true)}
                className="px-3.5 py-2 bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs rounded-xl transition"
              >
                🔬 Lab Order
              </button>
            </div>
          </div>
        </div>

        {/* Real-Time Chat & Patient Notes Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-900">
            💬 Consultation In-Call Chat
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs font-medium">
            {chatMessages.length === 0 ? (
              <div className="text-center text-slate-400 text-[11px] pt-8">
                No chat messages yet. Type below to send in-session notes.
              </div>
            ) : (
              chatMessages.map((c, i) => (
                <div key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="font-bold text-sky-700 block text-[10px]">{c.senderName}</span>
                  <p className="text-slate-800">{c.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50"
            />
            <button type="submit" className="px-3 py-2 bg-sky-600 text-white font-bold text-xs rounded-xl">
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Issue In-Session E-Prescription</h3>
              <button onClick={() => setShowPrescriptionModal(false)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleCreateInSessionPrescription} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dose & Dosage</label>
                <input
                  type="text"
                  required
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow">
                Issue Prescription ✓
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lab Order Modal */}
      {showLabOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Issue In-Session Diagnostic Lab Order</h3>
              <button onClick={() => setShowLabOrderModal(false)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleCreateInSessionLabOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lab Test Name</label>
                <input
                  type="text"
                  required
                  value={labTestName}
                  onChange={(e) => setLabTestName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-sky-600 text-white font-bold rounded-xl shadow">
                Issue Lab Order ✓
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
