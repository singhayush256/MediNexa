'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Minimize2,
  Calendar,
  Building,
  Pill,
  FlaskConical,
  Compass,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  timestamp: string;
}

const STORAGE_KEY = 'medinexa_ai_chat_history_v2';

const QUICK_PROMPTS = [
  {
    icon: Calendar,
    label: 'Book Appointment',
    query: 'How do I book an appointment with a doctor?',
  },
  {
    icon: Building,
    label: 'Which Department?',
    query: 'I have severe knee and joint stiffness, which doctor should I see?',
  },
  {
    icon: Pill,
    label: 'Explain Medicines',
    query: 'Why was I prescribed Dolo 650 and Pan 40? How should I take them?',
  },
  {
    icon: FlaskConical,
    label: 'Lab Report Help',
    query: 'My report shows Hemoglobin 10.5 g/dL and Fasting Blood Sugar 145 mg/dL. What does this mean?',
  },
  {
    icon: Compass,
    label: 'Hospital Navigation',
    query: 'Where is the pathology lab and the emergency room located in the hospital?',
  },
];

export function MediNexaChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history from localStorage
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
    } catch (err) {
      console.warn('Could not read chat history from localStorage');
    }

    // Default welcome message
    setMessages([
      {
        id: 'welcome-1',
        sender: 'assistant',
        text: `Hello! I am **MediNexa AI**, your 24/7 hospital clinical companion.\n\nI can assist you with:\n- 📅 **Appointment Guidance** & scheduling\n- 🏥 **Department Recommendations** based on symptoms\n- 💊 **Prescription Explanations** & dosage instructions\n- 🔬 **Lab Report Explanations** (CBC, Blood Sugar, LFT, KFT, Thyroid)\n- 🗺️ **Hospital Navigation** (Floor directory & directions)\n\nHow can I help you today?`,
        sources: ['MediNexa Clinical Assistant Gateway'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
      } catch (err) {
        console.warn('Could not save chat history to localStorage');
      }
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textOverride?: string) => {
    const query = (textOverride || inputValue).trim();
    if (!query || loading) return;

    setErrorMsg(null);
    setLastFailedQuery(null);

    const userMsg: ChatMessage = {
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

    let botReply = '';
    let sources = ['MediNexa Clinical Assistant Gateway'];

    const reqHeaders = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const reqBody = JSON.stringify({ message: query });

    try {
      let res: Response | null = null;
      try {
        res = await fetch('/api/v1/ai/chat', {
          method: 'POST',
          headers: reqHeaders,
          body: reqBody,
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`${apiUrl}/ai/chat`, {
            method: 'POST',
            headers: reqHeaders,
            body: reqBody,
          });
        } catch {}
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.answer || data.response) {
          botReply = data.answer || data.response;
          if (Array.isArray(data.sources)) sources = data.sources;
        }
      }

      if (!botReply) {
        // Clinical engine fallback
        const p = query.toLowerCase();
        if (p.includes('appointment') || p.includes('book')) {
          botReply = `### 📅 Appointment Guidance\nYou can book an appointment via the **[Appointments Portal](/portal/appointments)** or call our 24/7 central desk at **+91 11 2692 5858**.`;
        } else if (p.includes('department') || p.includes('chest') || p.includes('doctor')) {
          botReply = `### 🏥 Department Recommendation\nBased on your query, we recommend our specialized departments (Cardiology, Orthopedics, Neurology, Internal Medicine). Visit **1st Floor Outpatient Block** or book online.`;
        } else if (p.includes('prescription') || p.includes('medicine') || p.includes('dolo') || p.includes('pan 40')) {
          botReply = `### 💊 Prescription Guidance\n- **Dolo 650**: Take after meals for fever/pain.\n- **Pan 40**: Take 30 mins before breakfast on empty stomach.\n- **Augmentin 625**: Take after food; finish complete 5-day course.`;
        } else if (p.includes('lab') || p.includes('report') || p.includes('cbc') || p.includes('sugar')) {
          botReply = `### 🔬 Lab Report Interpretation\n- **CBC**: Hb normal 12-17 g/dL, Platelets 150k-450k.\n- **Fasting Sugar**: 70-99 mg/dL normal, >126 mg/dL diabetic.\n- **LFT/KFT**: Total Bilirubin 0.2-1.2 mg/dL, Creatinine 0.7-1.3 mg/dL.`;
        } else if (p.includes('where') || p.includes('floor') || p.includes('location')) {
          botReply = `### 🗺️ Hospital Navigation\n- **Ground Floor**: Emergency, Pharmacy, Reception, Billing.\n- **1st Floor**: OPD Chambers, Lab Collection.\n- **2nd Floor**: Radiology (MRI, CT, X-Ray).\n- **3rd Floor**: Operation Theatres & ICU.`;
        } else {
          botReply = `Hello! I am **MediNexa AI**. I can assist with Appointment Guidance, Department Recommendations, Prescriptions, Lab Reports, and Hospital Navigation. How can I help you?`;
        }
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: botReply,
        sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('[AI Chat Error]:', err);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: `### 🏥 MediNexa AI Assistance\nI am available to assist you with Appointment Guidance, Department Recommendations, Prescription Explanations, Lab Results, and Hospital Directions. Please ask your question.`,
        sources: ['MediNexa Clinical Gateway'],
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
        text: `Chat history cleared. How can I assist you with clinical workflows, appointments, medicines, or diagnostics today?`,
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

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Collapsed Trigger Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open MediNexa AI Assistant"
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
          </div>
          <span className="text-xs font-bold tracking-wide pr-1">MediNexa AI</span>
          <span className="bg-white/20 text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            Online
          </span>
        </button>
      )}

      {/* Expanded Interactive Chat Modal Window */}
      {isOpen && (
        <div className="flex flex-col w-[380px] sm:w-[440px] h-[600px] max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight">MediNexa AI</h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                </div>
                <p className="text-[11px] text-blue-100/90 font-medium">Healthcare Assistant • 24/7 Active</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips Carousel */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {QUICK_PROMPTS.map((qp, idx) => {
              const Icon = qp.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.query)}
                  disabled={loading}
                  className="whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition text-[11px] font-medium shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Icon className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  <span>{qp.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gradient-to-br from-teal-500 to-blue-600 text-white shadow-sm'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm relative group ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{m.text}</div>

                    {/* Sources Badge */}
                    {!isUser && m.sources && m.sources.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap gap-1 text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Sources:</span>
                        {m.sources.map((s, i) => (
                          <span key={i} className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[9px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer Time & Copy Action */}
                    <div
                      className={`flex items-center justify-between gap-2 mt-1 text-[10px] ${
                        isUser ? 'text-blue-200' : 'text-slate-400 dark:text-slate-400'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(m.id, m.text)}
                          title="Copy Answer"
                          className="opacity-0 group-hover:opacity-100 transition hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading State: Animated Typing Dots */}
            {loading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1.5">
                    MediNexa AI is thinking
                  </span>
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}

            {/* Error State Banner with Retry */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
                {lastFailedQuery && (
                  <button
                    onClick={() => handleSendMessage(lastFailedQuery)}
                    className="shrink-0 font-bold underline hover:no-underline text-rose-800 dark:text-rose-200"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about symptoms, medicines, lab tests..."
              disabled={loading}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="p-2.5 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
              title="Send Query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
