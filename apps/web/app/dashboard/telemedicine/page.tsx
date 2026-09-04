'use client';

import React, { useState } from 'react';
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
  UserCheck,
  Users,
  Monitor,
  Download,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export default function TelemedicineWorkstationPage() {
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<'NOTES' | 'CHAT' | 'VITALS' | 'PRESCRIPTION'>('NOTES');

  // Active Patient
  const [activePatient, setActivePatient] = useState({
    name: 'Arjun Nair',
    uhid: 'UHID-2026-100100',
    age: 34,
    gender: 'Male',
    complaint: 'Post-discharge hypertension review and occasional morning headaches',
  });

  // Waiting Room Queue
  const [waitingQueue, setWaitingQueue] = useState([
    { name: 'Pooja Yadav', uhid: 'UHID-2026-100107', timeInQueue: '6 mins', reason: 'Fever follow-up & lab review' },
    { name: 'Aman Gupta', uhid: 'UHID-2026-100102', timeInQueue: '12 mins', reason: 'Orthopedic joint stiffness consultation' },
    { name: 'Riya Verma', uhid: 'UHID-2026-100109', timeInQueue: '18 mins', reason: 'Dermatological allergic rash' },
  ]);

  // Chat
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'Arjun Nair (Patient)', text: 'Namaste Dr. Deshmukh, I have been monitoring my BP daily.', time: '10:31 AM' },
    { sender: 'Dr. Sanjay Deshmukh', text: 'Good morning Arjun! What were your average readings over the last 3 days?', time: '10:32 AM' },
    { sender: 'Arjun Nair (Patient)', text: 'Consistently around 124/82 mmHg. Pulse 74 bpm.', time: '10:33 AM' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Clinical SOAP Notes
  const [clinicalNotes, setClinicalNotes] = useState(
    'SUBJECTIVE: 34yo male presenting for virtual cardiology follow-up.\nReports systolic BP well regulated (120-128 mmHg), minimal exertion fatigue.\n\nOBJECTIVE: Virtual telemetry review. SpO2 99%, Resting HR 74 bpm.\nHome BP log verified (avg 124/82 mmHg).\n\nASSESSMENT: Essential Hypertension - Stage 1 (Well controlled on Telma 40mg PO).\n\nPLAN: Continue Telma 40mg once daily before breakfast. Routine lipid & KFT panel in 3 months.',
  );
  const [notesSaved, setNotesSaved] = useState(false);

  // In-Call E-Prescription
  const [rxMeds, setRxMeds] = useState([
    { name: 'Telma 40 (Telmisartan 40mg)', dosage: '1 Tab', frequency: '1-0-0 (Morning)', duration: '30 Days' },
    { name: 'Dolo 650 (Paracetamol 650mg)', dosage: '1 Tab', frequency: 'SOS (As needed)', duration: '5 Days' },
  ]);
  const [rxIssued, setRxIssued] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([
      ...chatMessages,
      { sender: 'Dr. Sanjay Deshmukh', text: chatInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setChatInput('');
  };

  const handleSaveNotes = () => {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 3000);
  };

  const handleIssuePrescription = () => {
    setRxIssued(true);
    setTimeout(() => setRxIssued(false), 4000);
  };

  const handleAdmitPatient = (patient: any) => {
    setActivePatient({
      name: patient.name,
      uhid: patient.uhid,
      age: 30,
      gender: 'Patient',
      complaint: patient.reason,
    });
    setWaitingQueue(waitingQueue.filter((p) => p.uhid !== patient.uhid));
    setInCall(true);
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
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-900">
                  CLINICAL TELEHEALTH SUITE • WEBRTC HD
                </span>
                <span className="text-xs text-slate-400 font-medium">Dr. Sanjay Deshmukh • Cardiology</span>
              </div>
              <h1 className="text-2xl font-black text-slate-950 dark:text-slate-50 tracking-tight mt-1">
                Virtual Telemedicine Workstation
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {!inCall ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setInCall(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                  icon={<Video className="w-4 h-4" />}
                >
                  Start Consultation with {activePatient.name.split(' ')[0]}
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => setInCall(false)}
                  icon={<PhoneOff className="w-4 h-4" />}
                >
                  End Consultation
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
                    <span className="text-xs font-bold text-white">
                      Patient: {activePatient.name} ({activePatient.uhid})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {screenSharing && (
                      <span className="text-[11px] font-bold text-blue-400 bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Monitor className="w-3 h-3" /> Screen Sharing Active
                      </span>
                    )}
                    <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
                      12:44
                    </span>
                  </div>
                </div>

                {/* Patient Simulated Feed */}
                <div className="flex flex-col items-center justify-center text-center space-y-3 my-auto z-10">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-xl">
                    {activePatient.name[0]}
                  </div>
                  <h3 className="text-sm font-bold text-white">{activePatient.name} (Patient Feed Connected)</h3>
                  <p className="text-xs text-slate-400 max-w-md">
                    "Doctor, I have had no palpitations this week. The morning vitals were 124 over 82."
                  </p>
                </div>

                {/* Picture-in-Picture Doctor Stream */}
                <div className="absolute bottom-20 right-6 w-36 h-24 rounded-2xl bg-slate-900 border-2 border-slate-700/80 shadow-2xl overflow-hidden flex items-center justify-center z-10">
                  {videoOn ? (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center text-center p-2">
                      <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center mb-1">
                        DR
                      </div>
                      <span className="text-[10px] font-bold text-slate-200">Dr. Sanjay</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <VideoOff className="w-5 h-5 text-slate-500" />
                      <span className="text-[9px] text-slate-500 font-bold">Cam Off</span>
                    </div>
                  )}
                </div>

                {/* Bottom Call Action Bar */}
                <div className="flex items-center justify-center gap-3 z-10">
                  <button
                    onClick={() => setMicOn(!micOn)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-lg ${
                      micOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-500 text-white hover:bg-rose-600'
                    }`}
                  >
                    {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => setVideoOn(!videoOn)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-lg ${
                      videoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-500 text-white hover:bg-rose-600'
                    }`}
                  >
                    {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => setScreenSharing(!screenSharing)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-lg ${
                      screenSharing ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setInCall(false)}
                    className="w-12 h-12 rounded-2xl bg-rose-600 text-white hover:bg-rose-700 flex items-center justify-center transition shadow-lg shadow-rose-600/30 ml-3"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Clinical Documentation & Chat Sidebar */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col h-[520px]">
                {/* Navigation Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-4">
                  <button
                    onClick={() => setActiveSidePanel('NOTES')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                      activeSidePanel === 'NOTES'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    SOAP
                  </button>
                  <button
                    onClick={() => setActiveSidePanel('PRESCRIPTION')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                      activeSidePanel === 'PRESCRIPTION'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Rx
                  </button>
                  <button
                    onClick={() => setActiveSidePanel('CHAT')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                      activeSidePanel === 'CHAT'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveSidePanel('VITALS')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                      activeSidePanel === 'VITALS'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Vitals
                  </button>
                </div>

                {/* Panel Content */}
                {activeSidePanel === 'NOTES' && (
                  <div className="flex-1 flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Consultation SOAP Notes
                      </span>
                      {notesSaved && (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Saved to EHR
                        </span>
                      )}
                    </div>
                    <textarea
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      className="flex-1 w-full p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed"
                    />
                    <Button
                      onClick={handleSaveNotes}
                      variant="primary"
                      size="sm"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold"
                    >
                      Save Clinical Notes to Patient EHR
                    </Button>
                  </div>
                )}

                {activeSidePanel === 'PRESCRIPTION' && (
                  <div className="flex-1 flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Electronic Prescription (In-Call)
                      </span>
                      {rxIssued && (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> E-Prescription Issued
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                      {rxMeds.map((med, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1"
                        >
                          <div className="font-bold text-slate-900 dark:text-white">{med.name}</div>
                          <div className="text-[11px] text-slate-500 flex justify-between">
                            <span>{med.dosage} • {med.frequency}</span>
                            <span className="font-semibold">{med.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={handleIssuePrescription}
                      variant="primary"
                      size="sm"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold"
                    >
                      Issue E-Prescription & Notify Pharmacy
                    </Button>
                  </div>
                )}

                {activeSidePanel === 'CHAT' && (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl text-xs space-y-1 ${
                            msg.sender.includes('Deshmukh')
                              ? 'bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 ml-4'
                              : 'bg-slate-100 dark:bg-slate-800 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                              {msg.sender}
                            </span>
                            <span className="text-[10px] text-slate-400">{msg.time}</span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 text-xs">{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Message patient..."
                        className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="submit"
                        className="p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}

                {activeSidePanel === 'VITALS' && (
                  <div className="flex-1 space-y-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Live Telemetry & Vitals
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold block">BLOOD PRESSURE</span>
                        <span className="text-base font-black text-slate-900 dark:text-white">124/82</span>
                        <span className="text-[10px] text-emerald-600 font-bold ml-1">Normal</span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold block">PULSE RATE</span>
                        <span className="text-base font-black text-slate-900 dark:text-white">74</span>
                        <span className="text-[10px] text-slate-500 ml-1">bpm</span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold block">OXYGEN SAT (SPO2)</span>
                        <span className="text-base font-black text-emerald-600">99%</span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold block">TEMPERATURE</span>
                        <span className="text-base font-black text-slate-900 dark:text-white">98.4°F</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Waiting Room & Session Overview */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ready to Consult Card */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600">
                    <Video className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Next Scheduled Consultation</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Patient is checked in and waiting in the virtual room
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-base font-black text-slate-900 dark:text-white">{activePatient.name}</div>
                      <div className="text-xs text-slate-500">
                        UHID: <span className="font-mono font-bold text-teal-600">{activePatient.uhid}</span> • {activePatient.age} Yrs • {activePatient.gender}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800">
                      Waiting Room (Ready)
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Chief Reason:</span> {activePatient.complaint}
                  </p>
                </div>

                <Button
                  onClick={() => setInCall(true)}
                  variant="primary"
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 text-sm flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Admit {activePatient.name} & Start Video Consultation
                </Button>
              </div>

              {/* Waiting Room Queue */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-600" />
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Waiting Room Queue</h4>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                    {waitingQueue.length} Waiting
                  </span>
                </div>

                <div className="space-y-3">
                  {waitingQueue.map((patient, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{patient.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {patient.timeInQueue}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{patient.reason}</p>
                      <button
                        onClick={() => handleAdmitPatient(patient)}
                        className="w-full py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition"
                      >
                        Call Patient Next
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
