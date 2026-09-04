'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings,
  ShieldCheck,
  RefreshCw,
  Phone,
  Radio,
  FileText,
  Layers,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/ui';

export default function SmsGatewayModulePage() {
  const [config, setConfig] = useState<any>({
    provider: 'MSG91',
    senderId: 'MDNEXA',
    apiKey: 'mdnexa_live_msg91_k892j1h482910',
    isActive: true,
    dltEntityId: '1101552390000041289',
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // Test SMS Form state
  const [testPhone, setTestPhone] = useState('+91 98101 23456');
  const [testEvent, setTestEvent] = useState('APPOINTMENT_CONFIRMATION');
  const [testCustomMsg, setTestCustomMsg] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') || localStorage.getItem('token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const [confRes, logsRes, tmplRes] = await Promise.all([
        fetch(`${apiUrl}/notification/sms/config`, { headers }),
        fetch(`${apiUrl}/notification/sms/logs`, { headers }),
        fetch(`${apiUrl}/notification/sms/templates`, { headers }),
      ]);

      if (confRes.ok) setConfig(await confRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
      if (tmplRes.ok) setTemplates(await tmplRes.json());
    } catch (e: any) {
      setError(e.message || 'Failed to load SMS gateway telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/notification/sms/config`, {
        method: 'POST',
        headers,
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save configuration');
      }

      setSuccess('SMS Gateway settings and TRAI DLT headers updated successfully!');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingTest(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('medinexa_token') || localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/notification/sms/send-test`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recipientPhone: testPhone,
          eventType: testEvent,
          message: testCustomMsg || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to trigger test SMS');
      }

      setSuccess(`Test SMS dispatched to ${testPhone} via ${config.provider} (Sender ID: ${config.senderId})`);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error dispatching SMS');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 antialiased overflow-hidden">
      <DashboardSidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardNav />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950/50 via-slate-900 to-blue-950/40 border border-teal-500/30 p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-500/30">
                  <MessageSquare className="h-3.5 w-3.5" /> Indian DLT Compliant SMS Hub
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Hospital SMS Gateway & DLT Telemetry
                </h1>
                <p className="text-slate-300 text-sm mt-2 max-w-2xl">
                  Automated mission-critical messaging service configured with TRAI DLT header <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-300">MDNEXA</code>. Dispatches real-time clinical SMS across 7 critical hospital lifecycle events.
                </p>
              </div>

              <Button
                onClick={loadData}
                variant="outline"
                size="sm"
                className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
              </Button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-sm">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Configuration and Test Trigger Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gateway Provider Settings */}
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-teal-400" />
                  SMS Gateway Configuration
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Select your telecommunication vendor and TRAI Distributed Ledger Technology (DLT) credentials.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">SMS Provider</label>
                      <select
                        value={config.provider}
                        onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:border-teal-500 focus:outline-none"
                      >
                        <option value="MSG91">MSG91 (India DLT Direct)</option>
                        <option value="FAST2SMS">Fast2SMS (Quick Route)</option>
                        <option value="TWILIO">Twilio International</option>
                        <option value="MOCK">Mock In-Memory Gateway</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        TRAI Sender ID (6 Chars)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={config.senderId}
                        onChange={(e) => setConfig({ ...config, senderId: e.target.value.toUpperCase() })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold tracking-widest uppercase focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Gateway Auth API Key</label>
                    <input
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      TRAI Principal Entity ID (DLT Registration)
                    </label>
                    <input
                      type="text"
                      value={config.dltEntityId}
                      onChange={(e) => setConfig({ ...config, dltEntityId: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" disabled={saving} size="sm" className="bg-teal-600 hover:bg-teal-500 text-white font-semibold">
                      {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Test SMS Dispatcher */}
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Send className="h-5 w-5 text-blue-400" />
                  Test Live SMS Dispatcher
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Trigger an instantaneous test SMS to any mobile number with real-time delivery logs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendTestSms} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Recipient Mobile (+91)</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98101 23456"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Hospital Lifecycle Event</label>
                    <select
                      value={testEvent}
                      onChange={(e) => setTestEvent(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:border-blue-500 focus:outline-none"
                    >
                      <option value="APPOINTMENT_CONFIRMATION">1. Appointment Confirmation</option>
                      <option value="APPOINTMENT_REMINDER">2. Appointment Reminder</option>
                      <option value="LAB_RESULTS_READY">3. Lab Diagnostic Results Ready</option>
                      <option value="PRESCRIPTION_DISPENSED">4. Prescription Dispensed (Pharmacy)</option>
                      <option value="DISCHARGE_SUMMARY">5. Inpatient Discharge Summary</option>
                      <option value="BILLING_RECEIPT">6. Billing / GST Payment Receipt</option>
                      <option value="OTP_VERIFICATION">7. Secure Login OTP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Custom Message Override (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Leave blank to use pre-approved TRAI DLT template..."
                      value={testCustomMsg}
                      onChange={(e) => setTestCustomMsg(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={sendingTest}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                    >
                      <Send className={`h-4 w-4 mr-1.5 ${sendingTest ? 'animate-spin' : ''}`} />
                      {sendingTest ? 'Dispatching...' : 'Dispatch Test SMS'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* DLT Templates Accordion */}
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-amber-400" />
                Approved TRAI DLT SMS Templates (7 Lifecycle Events)
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Pre-registered templates with National Telecom Authority.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {templates.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{t.name}</span>
                      <span className="font-mono text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                        DLT: {t.dltTemplateId.slice(-6)}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                      &quot;{t.sample}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Status Logs Table */}
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-teal-400" />
                    SMS Transmission & Delivery Status Logs
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Real-time carrier delivery acknowledgements from telecom gateways.
                  </CardDescription>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {logs.length} Messages Logged
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Message ID</th>
                      <th className="py-3 px-3">Recipient</th>
                      <th className="py-3 px-3">Event Type</th>
                      <th className="py-3 px-3">Message Content</th>
                      <th className="py-3 px-3">Sender ID</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Dispatched Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No SMS logs recorded. Use the Test SMS Dispatcher above to test messages.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-mono font-bold text-teal-400">{log.id}</td>
                          <td className="py-3 px-3 font-mono text-white">{log.recipientPhone}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-slate-800 text-slate-300">
                              {log.eventType}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300 max-w-xs truncate">{log.message}</td>
                          <td className="py-3 px-3 font-mono font-bold text-amber-400">{log.senderId}</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3" /> {log.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {new Date(log.sentAt).toLocaleTimeString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
