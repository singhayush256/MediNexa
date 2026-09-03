'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Share2,
  MessageSquare,
  FileText,
  Heart,
  Pill,
  ShieldCheck,
  Send,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';

export default function TelemedicineWorkstationPage() {
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [activeSidePanel, setActiveSidePanel] = useState<'NOTES' | 'CHAT' | 'VITALS'>('NOTES');
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'Jane Doe (Patient)', text: 'Hello Dr. Smith, I have been taking the lisinopril 10mg as prescribed.', time: '10:31 AM' },
    { sender: 'Dr. Sarah Smith', text: 'Good morning Jane! Have you noticed any dizziness or coughing?', time: '10:32 AM' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState(
    'SUBJECTIVE: 36yo female presenting for routine post-hospital hypertension follow-up.\nOBJECTIVE: BP 120/80 mmHg, HR 72 bpm, SpO2 98%. Resting sinus rhythm on ECG.\nASSESSMENT: Essential hypertension well-controlled on current ACE-inhibitor regimen.\nPLAN: Refill Lisinopril 10mg PO Daily x 90 days. Return in 3 months or PRN.',
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([
      ...chatMessages,
      { sender: 'Dr. Sarah Smith', text: chatInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-sans transition-colors duration-200">
      <DashboardNav />

      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900">
                  CLINICAL TELEHEALTH SUITE
                </span>
                <span className="text-xs text-slate-400 font-medium">WebRTC 256-Bit Encrypted</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight mt-1">
                Virtual Consultation Station
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {!inCall ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setInCall(true)}
                  icon={<Video className="w-4 h-4" />}
                >
                  Start Live Session
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => setInCall(false)}
                  icon={<PhoneOff className="w-4 h-4" />}
                >
                  End Active Session
                </Button>
              )}
            </div>
          </div>

          {inCall ? (
            /* Active Video Workstation */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Video Stream Canvas */}
              <div className="lg:col-span-2 rounded-3xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between aspect-[16/10] relative overflow-hidden shadow-2xl">
                {/* Stream Header */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-white">Patient: Jane Doe (MRN-1082)</span>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
                    12:44
                  </span>
                </div>

                {/* Patient Simulated Feed */}
                <div className="flex flex-col items-center justify-center text-center space-y-3 my-auto">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-xl">
                    J
                  </div>
                  <h3 className="text-sm font-bold text-white">Jane Doe (Speaking)</h3>
                  <p className="text-xs text-slate-400">"No shortness of breath. The morning vitals were 120 over 80."</p>
                </div>

                {/* Doctor PiP Self View */}
                <div className="absolute bottom-20 right-6 w-36 sm:w-44 aspect-video rounded-2xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-[11px] text-slate-400 font-semibold shadow-2xl">
                  {videoOn ? 'Doctor Camera Active' : 'Camera Muted'}
                </div>

                {/* Bottom Call Controls */}
                <div className="flex items-center justify-center gap-3 z-10">
                  <button
                    onClick={() => setMicOn(!micOn)}
                    className={`p-3 rounded-2xl transition cursor-pointer ${
                      micOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setVideoOn(!videoOn)}
                    className={`p-3 rounded-2xl transition cursor-pointer ${
                      videoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>
                  <button className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <Button variant="danger" size="sm" onClick={() => setInCall(false)}>
                    Complete & Sign
                  </Button>
                </div>
              </div>

              {/* Side Workstation (Notes, Chat, Vitals) */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-subtle">
                  <button
                    onClick={() => setActiveSidePanel('NOTES')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                      activeSidePanel === 'NOTES' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    SOAP Notes
                  </button>
                  <button
                    onClick={() => setActiveSidePanel('CHAT')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                      activeSidePanel === 'CHAT' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Patient Chat
                  </button>
                  <button
                    onClick={() => setActiveSidePanel('VITALS')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                      activeSidePanel === 'VITALS' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Telemetry
                  </button>
                </div>

                {activeSidePanel === 'NOTES' && (
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>Encounter Documentation</CardTitle>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Ambient AI Capture
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <textarea
                        rows={8}
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button variant="primary" size="sm" className="w-full" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                        Save & Sign Clinical Note
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {activeSidePanel === 'CHAT' && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>In-Consultation Messaging</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="h-64 overflow-y-auto space-y-2 text-xs">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                              <span>{msg.sender}</span>
                              <span>{msg.time}</span>
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 mt-1">{msg.text}</p>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Type message to patient..."
                          className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button type="submit" variant="primary" size="xs">
                          Send
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {activeSidePanel === 'VITALS' && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Real-Time Patient Telemetry</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                        <span className="font-semibold text-slate-500">Blood Pressure</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">120/80 mmHg</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                        <span className="font-semibold text-slate-500">Heart Rate</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">72 bpm</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                        <span className="font-semibold text-slate-500">SpO2 (Pulse Oximetry)</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">98% Room Air</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                        <span className="font-semibold text-slate-500">Core Temp</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">36.8°C</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            /* Queue & Analytics View */
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Telehealth Queue"
                  value="4 Patients"
                  change="Avg wait: 6m"
                  trend="up"
                  icon={<Video className="w-4 h-4 text-purple-500" />}
                />
                <StatCard
                  title="Completed Today"
                  value="8 Sessions"
                  change="100% on-time"
                  trend="up"
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                />
                <StatCard
                  title="Avg Duration"
                  value="16.4 mins"
                  change="-2.1m efficiency"
                  trend="up"
                  icon={<Clock className="w-4 h-4 text-blue-500" />}
                />
                <StatCard
                  title="Patient CSAT"
                  value="4.9 / 5"
                  change="98 reviews"
                  trend="up"
                  icon={<Heart className="w-4 h-4 text-rose-500" />}
                />
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Scheduled Telehealth Consultations</CardTitle>
                    <CardDescription>Patients currently waiting in virtual examination rooms</CardDescription>
                  </div>
                  <Button variant="primary" size="xs" onClick={() => setInCall(true)}>
                    Join Next in Queue
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {[
                      { patient: 'Jane Doe', mrn: 'MRN-1082', time: '10:30 AM', reason: 'Post-op Cardiac Titration', status: 'IN_WAITING_ROOM' },
                      { patient: 'Michael Chang', mrn: 'MRN-2041', time: '11:00 AM', reason: 'Acute Asthma Wheezing', status: 'SCHEDULED' },
                      { patient: 'Robert Johnson', mrn: 'MRN-3312', time: '11:30 AM', reason: 'Type 2 Diabetes Review', status: 'SCHEDULED' },
                    ].map((s, idx) => (
                      <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                            {s.patient.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{s.patient}</span>{' '}
                            <span className="text-[11px] text-slate-400">({s.mrn})</span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{s.reason}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                            {s.time}
                          </span>
                          <Button variant="primary" size="xs" onClick={() => setInCall(true)} icon={<Video className="w-3 h-3" />}>
                            Start Call
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
