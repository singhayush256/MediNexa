'use client';

import React, { useState } from 'react';
import {
  Stethoscope,
  HeartPulse,
  Building,
  UserCheck,
  FlaskConical,
  Pill,
  Receipt,
  Crown,
  User,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import {
  PORTALS_DEMO_DATA,
  PortalDemoAccount,
  launchDemoPortalSession,
} from '@/lib/demo-portals';

interface PortalDemoAccountsHubProps {
  onAutoFill: (identifier: string, password: string) => void;
}

export function PortalDemoAccountsHub({ onAutoFill }: PortalDemoAccountsHubProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleDirectLaunch = (account: PortalDemoAccount) => {
    setLaunchingId(account.id);
    setTimeout(() => {
      launchDemoPortalSession(account, true);
    }, 200);
  };

  const iconMap: Record<string, React.ReactNode> = {
    Stethoscope: <Stethoscope className="w-4 h-4" />,
    HeartPulse: <HeartPulse className="w-4 h-4" />,
    Building: <Building className="w-4 h-4" />,
    UserCheck: <UserCheck className="w-4 h-4" />,
    FlaskConical: <FlaskConical className="w-4 h-4" />,
    Pill: <Pill className="w-4 h-4" />,
    Receipt: <Receipt className="w-4 h-4" />,
    Crown: <Crown className="w-4 h-4" />,
    User: <User className="w-4 h-4" />,
  };

  const filteredGroups = activeTab === 'all'
    ? PORTALS_DEMO_DATA
    : PORTALS_DEMO_DATA.filter((g) => g.key === activeTab);

  return (
    <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800" id="demo-credentials-section">
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>VERIFIED DEMO CREDENTIALS VAULT</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Demo Accounts for Every Portal <br />
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            2 Accounts per Portal with Unique ID & Password
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Use the credentials below to log in or click <strong>Auto-Fill</strong> to automatically load the Staff ID and Password into the login form.
        </p>
      </div>

      {/* Portal Tabs Bar */}
      <div className="mt-8 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'all'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Portals (18 Accounts)
        </button>

        {PORTALS_DEMO_DATA.map((group) => (
          <button
            key={group.key}
            onClick={() => setActiveTab(group.key)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === group.key
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>{iconMap[group.iconName] || null}</span>
            <span>{group.badge}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              2
            </span>
          </button>
        ))}
      </div>

      {/* Portal Groups Display */}
      <div className="mt-8 space-y-10">
        {filteredGroups.map((group) => (
          <div key={group.key} className="space-y-4">
            {/* Group Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  {iconMap[group.iconName]}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {group.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {group.subtitle}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 self-start sm:self-auto">
                2 Demo Profiles Available
              </span>
            </div>

            {/* 2 Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.accounts.map((account) => {
                const isLaunching = launchingId === account.id;
                const idCopied = copiedKey === `id-${account.id}`;
                const passCopied = copiedKey === `pass-${account.id}`;

                return (
                  <div
                    key={account.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Header: Badge, Hospital, Avatar */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${account.avatarBg} text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0`}
                          >
                            {account.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {account.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {account.hospitalId === 'ALL' ? 'Cross-Enterprise' : account.hospitalId === 'HOSPITAL_A' ? 'Hospital A' : 'Hospital B'}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                              {account.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {account.department}
                            </div>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${account.badgeColor} shrink-0`}>
                          {account.hospitalId === 'ALL' ? 'All Hospitals' : account.hospitalId.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Credentials Display Box */}
                      <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                        {/* Unique Staff ID */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            Unique {account.roleCode === 'PATIENT' ? 'UHID' : 'Staff ID'}:
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                              {account.staffId}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(account.staffId, `id-${account.id}`)}
                              className="p-1 rounded-md text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer"
                              title="Copy ID"
                            >
                              {idCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Password */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            Password:
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                              {account.password}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(account.password, `pass-${account.id}`)}
                              className="p-1 rounded-md text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer"
                              title="Copy Password"
                            >
                              {passCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                          <span className="text-slate-400">Email:</span>
                          <span className="text-slate-600 dark:text-slate-300 font-mono text-[10px] truncate max-w-[200px]">
                            {account.email}
                          </span>
                        </div>
                      </div>

                      {/* Feature Tags */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {account.keyFeatures.map((feat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions: Auto-Fill & 1-Click Launch */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onAutoFill(account.staffId, account.password)}
                        className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer hover:-translate-y-0.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Auto-Fill Form</span>
                      </button>

                      <button
                        type="button"
                        disabled={isLaunching}
                        onClick={() => handleDirectLaunch(account)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer hover:-translate-y-0.5 disabled:opacity-50"
                      >
                        {isLaunching ? (
                          <span>Opening...</span>
                        ) : (
                          <>
                            <span>1-Click Launch</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
