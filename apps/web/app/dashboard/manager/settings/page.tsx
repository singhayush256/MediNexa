'use client';

import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Sliders,
  CheckCircle2,
  Shield,
  Save,
} from 'lucide-react';

export default function ManagerSettingsPage() {
  const [opdWaitThreshold, setOpdWaitThreshold] = useState('30');
  const [bedOccupancyAlertThreshold, setBedOccupancyAlertThreshold] = useState('85');
  const [enableSoundAlerts, setEnableSoundAlerts] = useState(true);
  const [enableTelegramAlerts, setEnableTelegramAlerts] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Operational Preferences</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Manager Control Preferences
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure operational alert trigger thresholds, notification channels, and telemetry sensitivity.
          </p>
        </div>
      </div>

      {savedNotice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Operational settings saved and applied to local command station.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 max-w-2xl text-xs">
        <div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Threshold Parameters</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                OPD Queue Wait Escalation Threshold (Minutes)
              </label>
              <input
                type="number"
                value={opdWaitThreshold}
                onChange={(e) => setOpdWaitThreshold(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[10px] text-slate-400">
                Triggers Decision Center alert when clinic wait time exceeds this value.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bed Capacity Warning Threshold (%)
              </label>
              <input
                type="number"
                value={bedOccupancyAlertThreshold}
                onChange={(e) => setBedOccupancyAlertThreshold(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[10px] text-slate-400">
                Warns manager when ward occupancy percentage exceeds this threshold.
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-600" />
            <span>Audible & External Alerts</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableSoundAlerts}
                onChange={(e) => setEnableSoundAlerts(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Audible alarm chime for Level 1 Emergency Trauma alerts
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableTelegramAlerts}
                onChange={(e) => setEnableTelegramAlerts(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Forward critical shift staffing gap alerts to Operations SMS dispatch
              </span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
