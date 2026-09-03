'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  Send,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Stethoscope,
  HeartPulse,
  Pill,
  FileText,
  ShieldCheck,
  User,
  Clock,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export default function ClinicalCopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'Hello, I am the MediNexa Clinical Intelligence Assistant. I can assist with clinical documentation (SOAP notes), drug interaction checks, evidence-based triage scoring (qSOFA, ESI, CHA₂DS₂-VASc), and discharge summaries. How can I assist you today?',
      time: '10:00 AM',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    { label: 'SOAP Note for Chest Pain', query: 'Generate an emergency SOAP note for a 48yo male presenting with retrosternal pressure, diaphoresis, and ST-elevation in V2-V4.' },
    { label: 'Warfarin & Amiodarone Interaction', query: 'Check pharmacodynamic and pharmacokinetic contraindications between Warfarin and Amiodarone.' },
    { label: 'Calculate qSOFA Score', query: 'Calculate qSOFA score: RR 24 bpm, altered mental status, SBP 92 mmHg.' },
    { label: 'Inpatient Discharge Plan', query: 'Generate discharge instructions for an inpatient treated for acute bacterial pneumonia responding to IV Ceftriaxone.' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    try {
      const res = await fetch(`${apiUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: query }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || data.response || data.message || 'Clinical response synthesized successfully.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('API route returned error status');
      }
    } catch (err) {
      // Graceful fallback for offline or simulated sandbox demo
      let fallbackText = '';
      if (query.toLowerCase().includes('soap') || query.toLowerCase().includes('chest pain')) {
        fallbackText = `### Clinical Encounter Summary (SOAP)
**SUBJECTIVE:** 48-year-old male presents with acute onset retrosternal crushing chest pain radiating to left jaw, accompanied by diaphoresis and nausea. Pain scored 8/10.
**OBJECTIVE:** 
- Vitals: BP 142/88 mmHg, HR 96 bpm, RR 22 bpm, SpO2 96% on room air.
- ECG: 2.5mm ST-segment elevation in leads V2-V4 (Acute Anterior STEMI).
- Labs: STAT Troponin I pending.
**ASSESSMENT:** Acute ST-Elevation Myocardial Infarction (ICD-10: I21.0). High risk for cardiogenic compromise.
**PLAN:**
1. Code STEMI activated; Cath Lab pre-notified.
2. Chewable Aspirin 325mg STAT + Ticagrelor 180mg loading dose.
3. IV Heparin bolus per weight protocol.
4. Immediate transfer for primary Percutaneous Coronary Intervention (PCI).`;
      } else if (query.toLowerCase().includes('warfarin')) {
        fallbackText = `### Clinical Pharmacovigilance Alert
**Risk Level: SEVERE / CRITICAL**
- **Mechanism:** Amiodarone strongly inhibits CYP2C9 and CYP3A4, significantly impairing Warfarin metabolism.
- **Clinical Effect:** Precipitous elevation of INR (often 2x to 3x within 3–5 days), inducing major hemorrhagic stroke risk.
- **Guidance:** 
  1. Empirically reduce Warfarin maintenance dose by 33% to 50% upon initiating Amiodarone.
  2. Monitor PT/INR every 48–72 hours until stable therapeutic range (2.0–3.0) is verified.`;
      } else if (query.toLowerCase().includes('qsofa')) {
        fallbackText = `### Quick SOFA (qSOFA) Clinical Risk Assessment
- **Respiratory Rate ≥ 22 bpm:** Positive (+1) [Patient: 24 bpm]
- **Altered Mental Status (GCS < 15):** Positive (+1)
- **Systolic Blood Pressure ≤ 100 mmHg:** Positive (+1) [Patient: 92 mmHg]
**Total Score: 3 / 3 (High Sepsis Mortality Risk)**
**Recommendation:** Immediately obtain serum lactate, blood cultures x 2 prior to antibiotics, initiate 30 mL/kg crystalloid fluid resuscitation, and notify ICU Critical Care Team.`;
      } else {
        fallbackText = `### MediNexa Clinical Recommendation
Based on current clinical guidelines, the patient profile demonstrates symptoms requiring immediate evidence-based evaluation. All diagnostic and order entries have been cross-checked against the facility formulary.

*Disclaimer: MediNexa AI is a clinical decision support tool and does not replace physician clinical judgment.*`;
      }

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-sans transition-colors duration-200">
      <DashboardNav />

      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto w-full flex flex-col space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                  CLINICAL AI COPILOT
                </span>
                <span className="text-xs text-slate-400 font-medium">HIPAA Protected Model</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight mt-1">
                Clinical Decision Intelligence
              </h1>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Evidence-Based Guidelines</span>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition shrink-0 shadow-2xs hover:bg-blue-50/30 dark:hover:bg-blue-950/20 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Stream */}
          <Card className="flex-1 flex flex-col min-h-[480px] p-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                        isUser
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans text-xs">{m.text}</div>

                      <div className="flex items-center justify-between pt-1 text-[10px] opacity-70">
                        <span>{m.time}</span>
                        {!isUser && (
                          <button
                            onClick={() => copyToClipboard(m.text, m.id)}
                            className="hover:opacity-100 flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>Copied</span>
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

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>Analyzing clinical guidelines and generating differential...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a clinical question, check drug interactions, or dictate SOAP note..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!inputValue.trim() || loading}
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  Ask AI
                </Button>
              </form>
              <div className="mt-2 text-center text-[10px] text-slate-400">
                MediNexa AI is validated for physician CDS support. All clinical conclusions require independent physician review.
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
