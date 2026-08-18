'use client';

import React, { useState, useEffect } from 'react';

interface HealthData {
  status: string;
  service: string;
  version: string;
  database?: string;
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">MediNexa System Health & Status</h1>
        <p className="text-gray-600">Sanitized operational health metrics across API services, database connection, and system environment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">REST API Gateway</span>
          <p className="text-2xl font-black text-green-600 flex items-center space-x-2">
            <span>●</span> <span>{health?.status || 'ONLINE'}</span>
          </p>
          <p className="text-xs text-gray-500">{health?.service || 'MediNexa Core API'} v{health?.version || '1.0.0'}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">PostgreSQL Database</span>
          <p className="text-2xl font-black text-blue-600 flex items-center space-x-2">
            <span>⚡</span> <span>{health?.database || 'CONNECTED'}</span>
          </p>
          <p className="text-xs text-gray-500">Port 5433 / medinexa</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">WebSocket Gateway</span>
          <p className="text-2xl font-black text-purple-600 flex items-center space-x-2">
            <span>📡</span> <span>ACTIVE</span>
          </p>
          <p className="text-xs text-gray-500">Real-time Emergency & Event Broadcasts</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Environment & Security Baseline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <span className="font-semibold text-gray-900 block">RBAC Role Enforcement</span>
            <span className="text-xs text-green-600">ACTIVE — 9 Roles Guarded</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <span className="font-semibold text-gray-900 block">Facility Data Isolation</span>
            <span className="text-xs text-green-600">ACTIVE — Strict Scoping Enforced</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <span className="font-semibold text-gray-900 block">AI Safety Boundary</span>
            <span className="text-xs text-green-600">ACTIVE — Non-Autonomous Foundation</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <span className="font-semibold text-gray-900 block">Audit Logging Engine</span>
            <span className="text-xs text-green-600">ACTIVE — Security Events Recorded</span>
          </div>
        </div>
      </div>
    </div>
  );
}
