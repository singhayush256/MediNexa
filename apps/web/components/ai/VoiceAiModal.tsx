'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Compass,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Clock,
  Building2,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui';

interface VoiceAiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INDIAN_CLINICAL_FAQS = [
  {
    keywords: ['fee', 'charges', 'cost', 'consultation fee', 'rate'],
    answer: 'At MediNexa Sector 62 Noida, OPD Specialist Consultation fees range from ₹800 to ₹1,200 depending on the specialty. Every consultation includes one free follow-up review within 7 calendar days.',
  },
  {
    keywords: ['timing', 'hours', 'opd time', 'open', 'schedule'],
    answer: 'MediNexa OPD clinics operate from 9:00 AM to 8:00 PM, Monday through Saturday. The Emergency Department, ICU Triage, and Central Pharmacy remain open 24 hours a day, 7 days a week.',
  },
  {
    keywords: ['emergency', 'casualty', 'admission', 'urgent'],
    answer: 'For emergency admission, please proceed directly to Ground Floor Gate 2. Our Emergency Triage team provides immediate resuscitation and stabilization with zero pre-deposit requirements under clinical guidelines.',
  },
  {
    keywords: ['ayushman', 'pm-jay', 'pmjay', 'cashless', 'tpa', 'insurance'],
    answer: 'MediNexa is fully empanelled with Ayushman Bharat PM-JAY offering cashless hospitalization up to ₹5,00,000 per family. We also support leading TPAs including Star Health, HDFC ERGO, ICICI Lombard, and Care Health.',
  },
  {
    keywords: ['fasting', 'lab', 'blood test', 'preparation', 'lipid'],
    answer: 'Fasting Blood Sugar (FBS) and Fasting Lipid Profiles require 10 to 12 hours of overnight fasting. Only plain water is permitted. Routine CBC, Thyroid Profile, and Kidney Function Tests do not require fasting.',
  },
  {
    keywords: ['pharmacy', 'medicine', 'chemist', 'drugs'],
    answer: 'MediNexa Central Pharmacy on Ground Floor is open 24 hours daily with 100% genuine barcoded medicines and cold-chain insulin storage. Home delivery is available across Noida and Greater Noida.',
  },
];

export function VoiceAiModal({ isOpen, onClose }: VoiceAiModalProps) {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState(
    'Namaste! I am your MediNexa Voice AI Assistant. You can speak to me naturally: ask about hospital timings, consultation fees, Ayushman Bharat cashless eligibility, or say "Take me to appointments" or "Book appointment".'
  );
  const [bookingStep, setBookingStep] = useState<number>(0);
  const [bookingData, setBookingData] = useState({ department: '', doctor: '', slot: '' });

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          processVoiceQuery(text);
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by this browser. Please use Google Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    }
  };

  const processVoiceQuery = (query: string) => {
    const q = query.toLowerCase().trim();

    // 1. Voice Navigation
    if (q.includes('go to appointment') || q.includes('show appointment') || q.includes('open appointment') || q.includes('appointments')) {
      const msg = 'Navigating to Appointment Bookings right now.';
      setAssistantReply(msg);
      speakText(msg);
      setTimeout(() => {
        onClose();
        router.push('/dashboard/appointments');
      }, 1500);
      return;
    }

    if (q.includes('lab') || q.includes('test report') || q.includes('diagnostic')) {
      const msg = 'Opening Hospital Lab Diagnostics and NABL Reports.';
      setAssistantReply(msg);
      speakText(msg);
      setTimeout(() => {
        onClose();
        router.push('/dashboard/lab');
      }, 1500);
      return;
    }

    if (q.includes('billing') || q.includes('bills') || q.includes('receipt') || q.includes('payment')) {
      const msg = 'Navigating to Hospital Revenue and GST Billing Invoices.';
      setAssistantReply(msg);
      speakText(msg);
      setTimeout(() => {
        onClose();
        router.push('/dashboard/billing');
      }, 1500);
      return;
    }

    if (q.includes('profile') || q.includes('abha') || q.includes('ayushman')) {
      const msg = 'Opening your personal health profile and Ayushman Bharat ABHA card.';
      setAssistantReply(msg);
      speakText(msg);
      setTimeout(() => {
        onClose();
        router.push('/portal/profile');
      }, 1500);
      return;
    }

    // 2. Guided Appointment Booking Flow
    if (q.includes('book appointment') || q.includes('need an appointment') || bookingStep > 0) {
      handleGuidedBooking(q);
      return;
    }

    // 3. Indian Clinical FAQs
    for (const faq of INDIAN_CLINICAL_FAQS) {
      if (faq.keywords.some((kw) => q.includes(kw))) {
        setAssistantReply(faq.answer);
        speakText(faq.answer);
        return;
      }
    }

    // Default intelligent clinical response
    const defaultResponse = `I heard: "${query}". MediNexa Hospital Sector 62 is open with specialist clinics in Cardiology, Orthopedics, Neurology, Pediatrics, and Dermatology. How may I assist you further?`;
    setAssistantReply(defaultResponse);
    speakText(defaultResponse);
  };

  const handleGuidedBooking = (q: string) => {
    if (bookingStep === 0) {
      setBookingStep(1);
      const msg = 'I would be happy to guide your booking. Which clinical specialty do you require? We have Cardiology, Orthopedics, General Medicine, Dermatology, and Pediatrics.';
      setAssistantReply(msg);
      speakText(msg);
    } else if (bookingStep === 1) {
      setBookingData((prev) => ({ ...prev, department: q }));
      setBookingStep(2);
      const msg = `Noted: ${q}. Dr. Rajesh Sharma and Dr. Priya Mehta are available today. Would you like a Morning slot or Afternoon slot?`;
      setAssistantReply(msg);
      speakText(msg);
    } else if (bookingStep === 2) {
      setBookingData((prev) => ({ ...prev, slot: q }));
      setBookingStep(3);
      const msg = `Confirmed! Your consultation for ${bookingData.department} has been reserved for tomorrow ${q}. An SMS notification from MDNEXA has been scheduled.`;
      setAssistantReply(msg);
      speakText(msg);
      setTimeout(() => {
        setBookingStep(0);
      }, 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 shadow-2xl p-6 text-slate-100 font-sans overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                MediNexa Voice AI Assistant
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">STT Speech Recognition • Indian Healthcare FAQs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Mute voice"
              >
                <VolumeX className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Central Voice Wave / Animation */}
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Pulsing Ripple Rings */}
            {isListening && (
              <>
                <div className="absolute w-28 h-28 rounded-full bg-blue-500/20 animate-ping duration-1000" />
                <div className="absolute w-24 h-24 rounded-full bg-blue-500/30 animate-pulse" />
              </>
            )}
            {isSpeaking && (
              <>
                <div className="absolute w-28 h-28 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
                <div className="absolute w-24 h-24 rounded-full bg-emerald-500/30 animate-pulse" />
              </>
            )}

            <button
              onClick={toggleListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
                isListening
                  ? 'bg-rose-600 text-white scale-110 shadow-rose-600/50 ring-4 ring-rose-500/30'
                  : isSpeaking
                  ? 'bg-emerald-600 text-white scale-105 shadow-emerald-600/50'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/40 hover:scale-105'
              }`}
            >
              {isListening ? (
                <Mic className="h-9 w-9 animate-bounce" />
              ) : isSpeaking ? (
                <Volume2 className="h-9 w-9 animate-pulse" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isListening ? (
                <span className="text-rose-400 font-bold">Listening... Speak now</span>
              ) : isSpeaking ? (
                <span className="text-emerald-400 font-bold">Speaking reply...</span>
              ) : (
                'Tap microphone to speak'
              )}
            </span>
            {transcript && (
              <p className="text-xs font-medium text-slate-300 italic max-w-sm mx-auto">
                &quot;{transcript}&quot;
              </p>
            )}
          </div>
        </div>

        {/* Assistant Response Box */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Sparkles className="h-3.5 w-3.5" /> MediNexa Voice Response
            </span>
            <button
              onClick={() => speakText(assistantReply)}
              className="hover:text-white flex items-center gap-1 text-[10px]"
            >
              <Volume2 className="h-3 w-3" /> Replay
            </button>
          </div>
          <p className="text-slate-200 font-medium">{assistantReply}</p>
        </div>

        {/* Suggested Voice Prompts */}
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Suggested Voice Inquiries
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              'What are the OPD timings?',
              'How much is consultation fee?',
              'Is Ayushman Bharat accepted?',
              'Book an appointment',
              'Open my lab reports',
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(p);
                  processVoiceQuery(p);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition"
              >
                &quot;{p}&quot;
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
