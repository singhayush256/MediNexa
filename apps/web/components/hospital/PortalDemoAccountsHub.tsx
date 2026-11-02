'use client';

import React, { useState } from 'react';
import {
  Building,
  BedDouble,
  UserCheck,
  Stethoscope,
  HeartPulse,
  FlaskConical,
  Pill,
  Ambulance,
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
  Layers,
  MapPin,
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
  const [facilityFilter, setFacilityFilter] = useState<'all' | 'HOSPITAL_A' | 'HOSPITAL_B'>('all');
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
    Building: <Building className="w-4 h-4" />,
    BedDouble: <BedDouble className="w-4 h-4" />,
    UserCheck: <UserCheck className="w-4 h-4" />,
    Stethoscope: <Stethoscope className="w-4 h-4" />,
    HeartPulse: <HeartPulse className="w-4 h-4" />,
    FlaskConical: <FlaskConical className="w-4 h-4" />,
    Pill: <Pill className="w-4 h-4" />,
    Ambulance: <Ambulance className="w-4 h-4" />,
    Receipt: <Receipt className="w-4 h-4" />,
    Crown: <Crown className="w-4 h-4" />,
    User: <User className="w-4 h-4" />,
  };

  const filteredGroups = activeTab === 'all'
    ? PORTALS_DEMO_DATA
    : PORTALS_DEMO_DATA.filter((g) => g.key === activeTab);

  // Core priority roles requested by the user
  const CORE_ROLE_KEYS = ['admin', 'manager', 'reception', 'doctor', 'nurse', 'lab', 'pharmacy', 'ambulance'];

  return (
    <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800" id="demo-credentials-section">
      {/* Vault Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>VERIFIED DEMO CREDENTIALS VAULT</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Demo Accounts for Every Portal <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Hospital A & Hospital B Side-by-Side
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          One side features <strong>Hospital A</strong> and the other side features <strong>Hospital B</strong>.
          Profiles are sequenced in administrative order: <strong>Admin → Manager → Reception → Doctor → Nurse → Lab → Pharmacy → Ambulance</strong>.
        </p>
      </div>

      {/* Facility View Filter & Portal Tabs Bar */}
      <div className="mt-8 space-y-4">
        {/* Facility Comparison Toggle */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
            Display Mode:
          </span>
          <button
            type="button"
            onClick={() => setFacilityFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              facilityFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Hospital A & B (Side-by-Side)</span>
          </button>

          <button
            type="button"
            onClick={() => setFacilityFilter('HOSPITAL_A')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              facilityFilter === 'HOSPITAL_A'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>🏥 Hospital A Only</span>
          </button>

          <button
            type="button"
            onClick={() => setFacilityFilter('HOSPITAL_B')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              facilityFilter === 'HOSPITAL_B'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>🏢 Hospital B Only</span>
          </button>
        </div>

        {/* Portal Role Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Roles (22 Accounts)
          </button>

          {PORTALS_DEMO_DATA.map((group, idx) => {
            const isCore = CORE_ROLE_KEYS.includes(group.key);
            return (
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
                <span>
                  {isCore ? `${idx + 1}. ` : ''}
                  {group.badge}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  {group.accounts.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Dual Hospital Column Header Banner */}
      {facilityFilter === 'all' && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hospital A Header Column */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                A
              </div>
              <div>
                <div className="text-xs font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <span>HOSPITAL A (WEST WING)</span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    50 Beds
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  MediNexa General Hospital • Secondary Care & ICU
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 hidden sm:inline-block">
              FACILITY-A
            </span>
          </div>

          {/* Hospital B Header Column */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-violet-50/50 dark:from-purple-950/40 dark:to-violet-950/20 border-2 border-purple-200 dark:border-purple-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                B
              </div>
              <div>
                <div className="text-xs font-extrabold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <span>HOSPITAL B (EAST WING)</span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    54 Beds
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  MediNexa Super-Specialty Institute • Quaternary Care & Cath Lab
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 hidden sm:inline-block">
              FACILITY-B
            </span>
          </div>
        </div>
      )}

      {/* Portal Groups Display */}
      <div className="mt-8 space-y-10">
        {filteredGroups.map((group, groupIdx) => {
          // Filter accounts based on facilityFilter if set
          const displayAccounts = facilityFilter === 'all'
            ? group.accounts
            : group.accounts.filter(
                (a) => a.hospitalId === facilityFilter || a.hospitalId === 'ALL',
              );

          if (displayAccounts.length === 0) return null;

          const isCore = CORE_ROLE_KEYS.includes(group.key);
          const isRemainingSectionFirst = group.key === 'billing' && activeTab === 'all';

          return (
            <div key={group.key} className="space-y-4">
              {/* Optional Section Divider for Remaining Non-Core Portals */}
              {isRemainingSectionFirst && (
                <div className="pt-6 pb-2 border-t-2 border-dashed border-slate-200 dark:border-slate-800">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-extrabold">
                    <span>ADDITIONAL ENTERPRISE & PATIENT SERVICES</span>
                  </div>
                </div>
              )}

              {/* Group Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                    {iconMap[group.iconName]}
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      {isCore && (
                        <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-[11px] font-mono flex items-center justify-center">
                          {groupIdx + 1}
                        </span>
                      )}
                      <span>{group.title}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {group.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 self-start sm:self-auto">
                  {displayAccounts.length} Demo Profile{displayAccounts.length > 1 ? 's' : ''} Available
                </span>
              </div>

              {/* Accounts Grid (Hospital A on Left, Hospital B on Right) */}
              <div className={`grid gap-4 ${displayAccounts.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                {displayAccounts.map((account) => {
                  const isLaunching = launchingId === account.id;
                  const idCopied = copiedKey === `id-${account.id}`;
                  const passCopied = copiedKey === `pass-${account.id}`;
                  const isHospitalA = account.hospitalId === 'HOSPITAL_A';
                  const isHospitalB = account.hospitalId === 'HOSPITAL_B';

                  return (
                    <div
                      key={account.id}
                      className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-md ${
                        isHospitalA
                          ? 'border-blue-200/90 dark:border-blue-900/60 hover:border-blue-300 dark:hover:border-blue-700'
                          : isHospitalB
                          ? 'border-purple-200/90 dark:border-purple-900/60 hover:border-purple-300 dark:hover:border-purple-700'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div>
                        {/* Top Header: Hospital Identifier, Badge, Avatar */}
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
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isHospitalA
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                      : isHospitalB
                                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {account.hospitalId === 'ALL'
                                    ? 'Cross-Enterprise'
                                    : account.hospitalId === 'HOSPITAL_A'
                                    ? '🏥 Hospital A'
                                    : '🏢 Hospital B'}
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
                            {account.hospitalId === 'ALL'
                              ? 'All Hospitals'
                              : account.hospitalId === 'HOSPITAL_A'
                              ? 'HOSPITAL A'
                              : 'HOSPITAL B'}
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
                                  <span className="flex items-center text-[10px] text-emerald-600 font-bold gap-0.5">
                                    <Check className="w-3.5 h-3.5" /> Copied
                                  </span>
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
                                  <span className="flex items-center text-[10px] text-emerald-600 font-bold gap-0.5">
                                    <Check className="w-3.5 h-3.5" /> Copied
                                  </span>
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
          );
        })}
      </div>
    </section>
  );
}
