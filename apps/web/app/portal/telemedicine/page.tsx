'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Video, Mic, ShieldCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export default function PatientTelemedicinePage() {
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [isInCall, setIsInCall] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Virtual Telehealth Suite
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">
            Telemedicine Consultation Room
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Encrypted, peer-to-peer virtual consultation with your attending physician.
          </p>
        </div>

        {isInCall ? (
          /* Active Call View */
          <div className="rounded-3xl bg-slate-950 text-white overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <h3 className="text-sm font-bold">Consultation with Dr. Rajesh Sharma</h3>
                  <p className="text-[11px] text-slate-400">Cardiology Specialist • HD Encrypted Session</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-800 px-3 py-1 rounded-full">
                08:42
              </span>
            </div>

            <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-xl">
                  R
                </div>
                <h4 className="font-bold text-sm">Dr. Rajesh Sharma (Speaking)</h4>
                <p className="text-xs text-slate-400">"Your recovery vitals look stable. Let's discuss your medication titration."</p>
              </div>

              {/* Patient Self-View in corner */}
              <div className="absolute bottom-4 right-4 w-36 sm:w-48 aspect-video rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xs text-slate-400 shadow-lg">
                Self View (Active)
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setMicActive(!micActive)}
                className={`p-3.5 rounded-2xl font-bold text-xs transition cursor-pointer ${
                  micActive ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCamActive(!camActive)}
                className={`p-3.5 rounded-2xl font-bold text-xs transition cursor-pointer ${
                  camActive ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                <Video className="w-5 h-5" />
              </button>
              <Button
                variant="danger"
                size="md"
                onClick={() => setIsInCall(false)}
                className="px-6 rounded-2xl font-bold"
              >
                Leave Session
              </Button>
            </div>
          </div>
        ) : (
          /* Pre-Call Waiting Room */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Virtual Waiting Room Check-In</CardTitle>
                <CardDescription>Test audio and video devices prior to joining</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="aspect-video rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white space-y-3 relative overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-blue-400">
                    <Video className="w-8 h-8" />
                  </div>
                  <div className="text-xs text-slate-400">Camera preview active</div>
                  <div className="absolute bottom-4 flex items-center gap-2">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mic Ready
                    </span>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Camera Ready
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>256-bit WebRTC Encrypted Session</span>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsInCall(true)}
                    icon={<Video className="w-4 h-4" />}
                  >
                    Enter Consultation Room
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Session Details</CardTitle>
                  <CardDescription>Physician info</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Doctor</span>
                    <div className="font-bold text-slate-900 dark:text-slate-100">Dr. Rajesh Sharma</div>
                    <div className="text-blue-600 dark:text-blue-400">Cardiology Specialist</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Scheduled Time</span>
                    <div className="font-semibold text-slate-700 dark:text-slate-300">Today at 10:30 AM</div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Doctor is in consultation</span>
                </div>
                <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-snug">
                  You are next in queue. The consultation will automatically connect once the doctor enters.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
