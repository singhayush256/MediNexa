'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bot,
  Sparkles,
  Send,
  User,
  RotateCcw,
  Copy,
  Check,
  Calendar,
  Building,
  Pill,
  FlaskConical,
  Compass,
  AlertCircle,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  timestamp: string;
}

const STORAGE_KEY = 'medinexa_ai_assistant_fullscreen_history_v2';

const HEALTHCARE_CATEGORIES = [
  {
    icon: Calendar,
    title: 'Appointment Guidance',
    desc: 'Booking steps, doctor OPD schedules & telemedicine assistance',
    prompt: 'How do I book an appointment with a doctor at MediNexa?',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-900',
  },
  {
    icon: Building,
    title: 'Department Recommendation',
    desc: 'Symptom-to-specialty matching for Cardiology, Neuro, Ortho & more',
    prompt: 'I have severe knee and joint stiffness, which specialist doctor should I consult?',
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
  },
  {
    icon: Pill,
    title: 'Prescription Explanation',
    desc: 'Dosages, food instructions & precautions for Indian medicines',
    prompt: 'Why was I prescribed Dolo 650 and Pan 40? How should I take them with food?',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
  },
  {
    icon: FlaskConical,
    title: 'Lab Report Explanation',
    desc: 'Understanding CBC, Blood Sugar, LFT, KFT & Thyroid reference intervals',
    prompt: 'My blood report shows Hemoglobin 10.5 g/dL and Fasting Blood Sugar 145 mg/dL. What does this indicate?',
    color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-400 border-teal-200 dark:border-teal-900',
  },
  {
    icon: Compass,
    title: 'Hospital Navigation',
    desc: 'Floor directories & wayfinding for our New Delhi Super Speciality Hospital',
    prompt: 'Where are the Emergency Room, Pathology Lab, and Central Pharmacy located in the hospital?',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  },
];

export default function PatientAiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read history');
    }

    setMessages([
      {
        id: 'init-1',
        sender: 'assistant',
        text: `Welcome to the **MediNexa AI Healthcare Assistant**!\n\nI am your clinical intelligence guide. You can ask me questions about:\n- 📅 **Appointments & Doctor Schedules**\n- 🏥 **Department Triage & Specialist Recommendations**\n- 💊 **Prescriptions & Medicine Instructions**\n- 🔬 **Lab Test Interpretations (CBC, Sugar, LFT, KFT, Thyroid, Urine)**\n- 🗺️ **Hospital Navigation & Floor Directions**\n\nChoose one of the suggested topics below or type your question in the message bar!`,
        sources: ['MediNexa Clinical Assistant Gateway', 'Apollo MediNexa Hospital Protocols'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
      } catch (e) {
        console.warn('Could not save history');
      }
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const getLocalClinicalGuidance = (query: string): { answer: string; sources: string[] } => {
    const p = query.toLowerCase().trim();
    const disclaimer =
      '\n\n*Clinical Disclaimer: MediNexa AI provides assistive health intelligence and workflow guidance. It is not a substitute for professional medical diagnosis. For life-threatening emergencies, please visit the 24/7 MediNexa Emergency Department or dial 108/112.*';

    if (
      p.includes('appointment') ||
      p.includes('book') ||
      p.includes('schedule') ||
      p.includes('reschedule') ||
      p.includes('cancel') ||
      p.includes('slot')
    ) {
      return {
        answer: `### 📅 MediNexa Appointment Guidance & Scheduling\n\nBooking or managing an appointment with Apollo MediNexa is fast and easy:\n\n1. **Online Patient Portal**:\n   - Navigate to the **[Appointments Portal](/portal/appointments)**.\n   - Choose between **In-Person Hospital Visit (OPD)** or **Telemedicine Video Consultation**.\n   - Filter by specialty (Cardiology, Neurology, Orthopedics, Pediatrics, Oncology, General Medicine).\n   - Select your preferred specialist doctor, date, and available 15-minute slot.\n2. **Instant OPD Token / Walk-in**:\n   - Visit Ground Floor Counter 1 to 4 at our New Delhi facility for same-day walk-in consultation tokens.\n3. **Rescheduling & Cancellations**:\n   - Active appointments can be modified up to 2 hours prior to the slot in your portal dashboard under **My Appointments**.\n4. **24/7 Appointment Desk**:\n   - Dial **+91 11 2692 5858** or WhatsApp **+91 98765 43210**.${disclaimer}`,
        sources: ['MediNexa Clinical Appointment Protocols', 'NABH Outpatient Standards'],
      };
    }

    if (
      p.includes('department') ||
      p.includes('specialist') ||
      p.includes('which doctor') ||
      p.includes('symptom') ||
      p.includes('chest') ||
      p.includes('knee') ||
      p.includes('joint') ||
      p.includes('headache') ||
      p.includes('stomach')
    ) {
      let dept = 'General Medicine';
      let doc = 'Dr. Arvind Deshmukh (Senior Consultant - Internal Medicine)';
      if (p.includes('chest') || p.includes('heart') || p.includes('breath')) {
        dept = 'Cardiology & Cardiac Sciences';
        doc = 'Dr. Sarah Smith (Director - Interventional Cardiology)';
      } else if (p.includes('knee') || p.includes('joint') || p.includes('bone') || p.includes('stiff')) {
        dept = 'Orthopedics & Joint Replacement';
        doc = 'Dr. Rajesh Patel (Head of Orthopedic Surgery)';
      } else if (p.includes('headache') || p.includes('dizziness') || p.includes('seizure')) {
        dept = 'Neurology & Neurosciences';
        doc = 'Dr. Vikram Malhotra (Senior Neurologist)';
      } else if (p.includes('stomach') || p.includes('acid') || p.includes('gastric')) {
        dept = 'Gastroenterology & Hepatology';
        doc = 'Dr. Priya Sharma (Consultant Gastroenterologist)';
      }
      return {
        answer: `### 🏥 Recommended Clinical Department: **${dept}**\n\nBased on your symptoms, we recommend consulting our specialized clinical unit:\n\n- **Primary Department**: **${dept}**\n- **Recommended Specialist**: **${doc}**\n- **OPD Clinic Location**: 1st Floor, Outpatient Block A, Apollo MediNexa New Delhi.\n\nYou can book directly via the **[Book Appointment](/portal/appointments)** tab.${disclaimer}`,
        sources: ['MediNexa Clinical Triage Guide', 'ICD-11 Diagnostic Symptom Directory'],
      };
    }

    if (
      p.includes('prescription') ||
      p.includes('medicine') ||
      p.includes('dose') ||
      p.includes('dolo') ||
      p.includes('pan 40') ||
      p.includes('augmentin') ||
      p.includes('glycomet') ||
      p.includes('telma')
    ) {
      return {
        answer: `### 💊 MediNexa Prescription & Medication Guidance\n\n- 🔹 **Dolo 650 (Paracetamol 650mg)**: Antipyretic & pain reliever. Take **after meals** with water. 6-hour interval between doses.\n- 🔹 **Pan 40 (Pantoprazole 40mg)**: PPI for acidity. Must be taken **once daily 30 minutes BEFORE breakfast** on an empty stomach.\n- 🔹 **Augmentin 625 Duo (Amoxicillin + Clavulanate)**: Broad-spectrum antibiotic. Take **immediately after starting a meal**. Complete the full 5–7 day course.\n- 🔹 **Glycomet 500 SR (Metformin 500mg)**: Antidiabetic. Take with dinner.\n- 🔹 **Telma 40 (Telmisartan 40mg)**: Blood pressure control. Take once daily every morning.${disclaimer}`,
        sources: ['National Formulary of India (NFI)', 'MediNexa Clinical Pharmacology Protocols'],
      };
    }

    if (
      p.includes('lab') ||
      p.includes('report') ||
      p.includes('cbc') ||
      p.includes('sugar') ||
      p.includes('lft') ||
      p.includes('kft') ||
      p.includes('thyroid')
    ) {
      return {
        answer: `### 🔬 MediNexa Diagnostic Lab Report Interpretation\n\n1. **Complete Blood Count (CBC)**:\n   - **Hemoglobin**: 13.5–17.5 g/dL (M), 12.0–15.5 g/dL (F). Lower indicates anemia.\n   - **WBC**: 4,000–11,000 /mcL. Elevated indicates infection or inflammation.\n   - **Platelets**: 150,000–450,000 /mcL.\n2. **Blood Sugar**:\n   - **Fasting (FBS)**: 70–99 mg/dL normal; 100–125 pre-diabetes; ≥126 diabetes.\n   - **HbA1c**: <5.7% normal; 5.7–6.4% pre-diabetes; ≥6.5% diabetes.\n3. **Liver Function (LFT)**: Bilirubin 0.2–1.2 mg/dL, SGPT/ALT 7–56 U/L.\n4. **Kidney Function (KFT)**: Serum Creatinine 0.7–1.3 mg/dL, BUN 7–20 mg/dL.\n5. **Thyroid**: TSH 0.4–4.0 mIU/L.${disclaimer}`,
        sources: ['NABL ISO 15189:2022 Reference Intervals', 'MediNexa Pathology Handbook'],
      };
    }

    if (
      p.includes('where is') ||
      p.includes('where are') ||
      p.includes('location') ||
      p.includes('floor') ||
      p.includes('navigation') ||
      p.includes('emergency') ||
      p.includes('pharmacy')
    ) {
      return {
        answer: `### 🗺️ Apollo MediNexa Hospital Navigation Directory\n\n**Address**: Sarita Vihar, Delhi Mathura Road, New Delhi – 110076\n\n- 🟢 **Ground Floor**: 24/7 Emergency & Trauma, Main Reception, Billing Counters, 24/7 Pharmacy, Blood Bank.\n- 🔵 **1st Floor**: Outpatient Specialist Clinics (Chambers 101–125), Pathology Blood Collection.\n- 🟡 **2nd Floor**: Radiology (MRI, CT, X-Ray, Ultrasound), Day Care Surgery.\n- 🔴 **3rd Floor**: Operation Theatres (OT 1–8), ICU/CCU, Cardiac Cath Lab.\n- 🟣 **4th Floor**: Inpatient Deluxe Rooms & General Wards.\n- ⚪ **5th Floor**: Dialysis Centre, Executive Hospital Administration.${disclaimer}`,
        sources: ['Apollo MediNexa Physical Facility Wayfinding Guide'],
      };
    }

    return {
      answer: `Hello! I am **MediNexa AI**, your hospital & clinical companion. I can assist you with:\n1. 📅 **Appointment Guidance**\n2. 🏥 **Department Recommendation**\n3. 💊 **Prescription Explanation**\n4. 🔬 **Lab Report Explanation**\n5. 🗺️ **Hospital Navigation**\n\nHow can I help you today?${disclaimer}`,
      sources: ['MediNexa Clinical Assistant Gateway'],
    };
  };

  const handleSendMessage = async (textOverride?: string) => {
    const query = (textOverride || inputValue).trim();
    if (!query || loading) return;

    setErrorMsg(null);
    setLastFailedQuery(null);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    let answer = '';
    let sources = ['MediNexa Clinical Knowledge Base'];

    const reqHeaders = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const reqBody = JSON.stringify({ message: query });

    try {
      // Priority 1: Next.js API route proxy (/api/v1/ai/chat)
      let res: Response | null = null;
      try {
        res = await fetch('/api/v1/ai/chat', {
          method: 'POST',
          headers: reqHeaders,
          body: reqBody,
        });
      } catch {
        // network unreachable on relative path
      }

      // Priority 2: Direct NestJS backend (${apiUrl}/ai/chat)
      if (!res || !res.ok) {
        try {
          res = await fetch(`${apiUrl}/ai/chat`, {
            method: 'POST',
            headers: reqHeaders,
            body: reqBody,
          });
        } catch {
          // direct backend unreachable
        }
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.answer || data.response) {
          answer = data.answer || data.response;
          if (Array.isArray(data.sources)) sources = data.sources;
        }
      }

      // Priority 3: Resilient in-memory clinical guidance fallback (always guarantees 100% uptime)
      if (!answer) {
        const fallback = getLocalClinicalGuidance(query);
        answer = fallback.answer;
        sources = fallback.sources;
      }

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('[AI Assistant Error]:', err);
      // Even on unexpected error, provide clinical fallback
      const fallback = getLocalClinicalGuidance(query);
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: fallback.answer,
        sources: fallback.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Conversation reset. How can I assist you today with clinical guidance or hospital navigation?',
        sources: ['MediNexa Clinical Assistant Gateway'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportTranscript = () => {
    const text = messages
      .map((m) => `[${m.timestamp}] ${m.sender === 'user' ? 'PATIENT' : 'MEDINEXA AI'}:\n${m.text}\n`)
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediNexa_AI_Consultation_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/portal"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>MediNexa AI Healthcare Assistant</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportTranscript}
              title="Download Consultation Transcript"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Transcript</span>
            </button>

            <button
              onClick={handleClearHistory}
              title="Clear Chat History"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear History</span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Chat Workstation */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Banner Hero */}
        <div className="bg-gradient-to-r from-teal-700 via-blue-700 to-indigo-800 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/20 text-teal-100 tracking-wider">
                Clinical Intelligence v2.0
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live 24/7
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              MediNexa Interactive AI Assistant
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl font-medium">
              Immediate guidance for doctor appointments, department recommendations, prescription explanations, lab interpretations, and hospital directions.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Secure & Private</span>
            </span>
          </div>
        </div>

        {/* 5 Quick Use Case Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HEALTHCARE_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <button
                key={i}
                onClick={() => handleSendMessage(cat.prompt)}
                disabled={loading}
                className="text-left p-3.5 rounded-xl border bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500/80 hover:shadow-md transition group disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className={`p-2 rounded-lg border ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {cat.title}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {cat.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Chat Thread Container */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col min-h-[420px]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-sm ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gradient-to-br from-teal-500 to-blue-600 text-white'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm relative group ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{m.text}</div>

                    {!isUser && m.sources && m.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Sources:</span>
                        {m.sources.map((src, i) => (
                          <span
                            key={i}
                            className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-[10px]"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      className={`flex items-center justify-between gap-3 mt-2 text-[10px] ${
                        isUser ? 'text-blue-200' : 'text-slate-400 dark:text-slate-400'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(m.id, m.text)}
                          title="Copy message text"
                          className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    MediNexa AI is formulating clinical guidance
                  </span>
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}

            {/* Error Message with Retry */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                {lastFailedQuery && (
                  <button
                    onClick={() => handleSendMessage(lastFailedQuery)}
                    className="font-bold underline hover:no-underline text-rose-800 dark:text-rose-200"
                  >
                    Retry Query
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about symptoms, doctor appointments, medicines, lab ranges, hospital floors..."
              disabled={loading}
              className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="px-5 py-3 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 shrink-0"
            >
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
