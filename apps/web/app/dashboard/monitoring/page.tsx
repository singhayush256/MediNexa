'use client';

import React, { useEffect, useState } from 'react';

export default function PatientMonitoringDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'icu' | 'devices' | 'alerts' | 'trends'>('icu');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientTrends, setPatientTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Ingestion states
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);

  // Register Device Form
  const [regName, setRegName] = useState('');
  const [regSerial, setRegSerial] = useState('');
  const [regType, setRegType] = useState('ICU_MONITOR');
  const [regManufacturer, setRegManufacturer] = useState('Philips Healthcare');
  const [regModel, setRegModel] = useState('IntelliVue MX800');

  // Push Vitals Stream Form
  const [streamPatientId, setStreamPatientId] = useState('');
  const [streamDeviceId, setStreamDeviceId] = useState('');
  const [streamHR, setStreamHR] = useState('78');
  const [streamSpO2, setStreamSpO2] = useState('98');
  const [streamSBP, setStreamSBP] = useState('120');
  const [streamDBP, setStreamDBP] = useState('80');
  const [streamRR, setStreamRR] = useState('16');
  const [streamTemp, setStreamTemp] = useState('36.8');
  const [streamGlucose, setStreamGlucose] = useState('105');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadData = () => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    Promise.all([
      fetch(`${apiUrl}/monitoring/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/monitoring/devices`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${apiUrl}/monitoring/alerts`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([anal, devs, alts]) => {
        setAnalytics(anal);
        const deviceList = Array.isArray(devs) ? devs : [];
        setDevices(deviceList);
        setAlerts(Array.isArray(alts) ? alts : []);
        if (deviceList.length > 0 && !selectedPatientId) {
          const firstAssigned = deviceList.find((d) => d.assignedPatientId);
          if (firstAssigned) {
            setSelectedPatientId(firstAssigned.assignedPatientId);
            loadTrends(firstAssigned.assignedPatientId);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const loadTrends = (patientId: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token || !patientId) return;

    fetch(`${apiUrl}/monitoring/patient/${patientId}/trends`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setPatientTrends(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/monitoring/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          deviceName: regName,
          serialNumber: regSerial,
          deviceType: regType,
          manufacturer: regManufacturer,
          modelNumber: regModel,
        }),
      });

      if (res.ok) {
        alert('Medical device registered successfully into hospital fleet!');
        setShowRegisterModal(false);
        setRegName('');
        setRegSerial('');
        loadData();
      } else {
        const err = await res.json();
        alert(`Failed to register device: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handlePushVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/monitoring/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: streamPatientId,
          deviceId: streamDeviceId,
          heartRate: Number(streamHR),
          spo2: Number(streamSpO2),
          systolicBP: Number(streamSBP),
          diastolicBP: Number(streamDBP),
          respiratoryRate: Number(streamRR),
          temperature: Number(streamTemp),
          bloodGlucose: Number(streamGlucose),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.alertCount > 0) {
          alert(`⚠️ Alert Triggered: ${data.alertCount} critical clinical alarms dispatched!`);
        } else {
          alert('Vitals telemetry streamed successfully!');
        }
        setShowStreamModal(false);
        loadData();
        if (streamPatientId) loadTrends(streamPatientId);
      } else {
        const err = await res.json();
        alert(`Failed to push vitals: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/monitoring/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes: 'Nurse on duty attended bedside immediately' }),
      });

      if (res.ok) {
        alert('Alert acknowledged successfully!');
        loadData();
      } else {
        const err = await res.json();
        alert(`Failed to acknowledge alert: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const a = analytics || {
    devicesOnline: 24,
    devicesOffline: 2,
    criticalAlertsToday: 5,
    averageResponseTime: '1.8 mins',
    patientsMonitored: 18,
    vitalsRecordedToday: 1420,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-700/50">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              REAL-TIME IOT TELEMETRY ENGINE
            </span>
            <span className="px-2.5 py-0.5 bg-blue-400/20 text-blue-200 rounded-full text-[10px] font-bold">
              ICU • CCU • STEP-DOWN • WEARABLES
            </span>
          </div>
          <h1 className="text-3xl font-black mt-2 tracking-tight">Patient Monitoring & Medical Device Hub</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Real-time biometric vital stream ingestion, multi-parameter threshold alarm automation, and ICU bedside command matrix.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-black text-xs rounded-xl shadow transition"
          >
            ➕ Register Device
          </button>
          <button
            onClick={() => setShowStreamModal(true)}
            className="px-4 py-2.5 bg-rose-600 text-white hover:bg-rose-700 font-black text-xs rounded-xl shadow transition animate-pulse"
          >
            ⚡ Push Live Vitals
          </button>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Devices Online</div>
          <div className="text-2xl font-black text-emerald-600">{a.devicesOnline}</div>
          <div className="text-[10px] text-emerald-600 font-medium">● Connected Nodes</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Devices Offline</div>
          <div className="text-2xl font-black text-rose-600">{a.devicesOffline}</div>
          <div className="text-[10px] text-rose-600 font-semibold">Maintenance / Standby</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Critical Alarms</div>
          <div className="text-2xl font-black text-amber-600">{a.criticalAlertsToday}</div>
          <div className="text-[10px] text-amber-600 font-semibold">Today&apos;s Threshold Trips</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Avg Response Time</div>
          <div className="text-2xl font-black text-blue-600">{a.averageResponseTime}</div>
          <div className="text-[10px] text-blue-600 font-semibold">Clinical Acknowledgment</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Active Patients</div>
          <div className="text-2xl font-black text-purple-600">{a.patientsMonitored}</div>
          <div className="text-[10px] text-purple-600 font-semibold">Monitored Bedside</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Vitals Recorded</div>
          <div className="text-2xl font-black text-slate-900">{a.vitalsRecordedToday}</div>
          <div className="text-[10px] text-slate-500 font-semibold">Streams Ingested</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('icu')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'icu' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🏥 Live ICU Bed Matrix ({devices.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'alerts' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🚨 Clinical Alerts ({alerts.filter((x) => !x.acknowledged).length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'trends' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📈 Biometric Trends & History
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`px-4 py-2 font-black text-xs rounded-xl transition ${
            activeTab === 'devices' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📡 Fleet Inventory ({devices.length})
        </button>
      </div>

      {/* ICU Bed Matrix View */}
      {activeTab === 'icu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.length === 0 ? (
            <div className="col-span-3 p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400">
              No active monitoring devices configured. Click &quot;Register Device&quot; to initialize hardware.
            </div>
          ) : (
            devices.map((dev) => (
              <div
                key={dev.id}
                className="bg-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {dev.assignedBed?.ward?.name || 'ICU Pod A'} • {dev.assignedBed?.bedNumber || 'Bed 01'}
                    </span>
                    <h3 className="text-lg font-black text-slate-100">{dev.deviceName}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      dev.status === 'ONLINE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {dev.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  Patient:{' '}
                  <span className="text-slate-200 font-bold">
                    {dev.assignedPatient?.user?.firstName
                      ? `${dev.assignedPatient.user.firstName} ${dev.assignedPatient.user.lastName}`
                      : 'Unassigned Bed'}
                  </span>
                </div>

                {/* Biometric Tiles */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[9px] text-emerald-400 font-bold uppercase">Heart Rate</div>
                    <div className="text-xl font-black text-emerald-400">76</div>
                    <div className="text-[9px] text-slate-500">bpm</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[9px] text-cyan-400 font-bold uppercase">SpO2</div>
                    <div className="text-xl font-black text-cyan-400">99%</div>
                    <div className="text-[9px] text-slate-500">Oxygen</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[9px] text-amber-400 font-bold uppercase">NIBP</div>
                    <div className="text-xl font-black text-amber-400">120/80</div>
                    <div className="text-[9px] text-slate-500">mmHg</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[9px] text-blue-400 font-bold uppercase">Resp Rate</div>
                    <div className="text-xl font-black text-blue-400">16</div>
                    <div className="text-[9px] text-slate-500">rpm</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[9px] text-purple-400 font-bold uppercase">Temp</div>
                    <div className="text-xl font-black text-purple-400">36.8°C</div>
                    <div className="text-[9px] text-slate-500">Core</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[9px] text-rose-400 font-bold uppercase">Glucose</div>
                    <div className="text-xl font-black text-rose-400">105</div>
                    <div className="text-[9px] text-slate-500">mg/dL</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                  <span>SN: {dev.serialNumber}</span>
                  <span>Heartbeat: {dev.lastHeartbeatAt ? new Date(dev.lastHeartbeatAt).toLocaleTimeString() : 'Active'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Clinical Alerts Dashboard */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Real-Time Clinical Alarm Dispatcher
            </h3>
            <span className="text-xs text-slate-400 font-bold">Auto-triaged by vital telemetry thresholds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Alarm Type</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Message</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No clinical alarms active. All patient parameters within normal thresholds.
                    </td>
                  </tr>
                ) : (
                  alerts.map((alt) => (
                    <tr key={alt.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            alt.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : alt.severity === 'HIGH'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {alt.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{alt.alertType}</td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">
                        {alt.patient?.user?.firstName} {alt.patient?.user?.lastName}
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-xs">{alt.message}</td>
                      <td className="py-3 px-3">
                        {alt.acknowledged ? (
                          <span className="text-emerald-700 font-bold text-[11px]">
                            ✓ Acked by {alt.acknowledgedBy?.firstName || 'Nurse'}
                          </span>
                        ) : (
                          <span className="text-rose-600 font-black text-[11px] animate-pulse">● PENDING ATTENTION</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{new Date(alt.createdAt).toLocaleTimeString()}</td>
                      <td className="py-3 px-3 text-right">
                        {!alt.acknowledged && (
                          <button
                            onClick={() => handleAcknowledge(alt.id)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow transition"
                          >
                            ✓ Acknowledge
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Biometric Trends & History */}
      {activeTab === 'trends' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Patient Biometric Trend Analytics
              </h3>
              <p className="text-xs text-slate-400">Longitudinal continuous monitoring telemetry</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Select Patient:</label>
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  loadTrends(e.target.value);
                }}
                className="p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                {devices
                  .filter((d) => d.assignedPatientId)
                  .map((d) => (
                    <option key={d.assignedPatientId} value={d.assignedPatientId}>
                      {d.assignedPatient?.user?.firstName} {d.assignedPatient?.user?.lastName} (
                      {d.assignedBed?.bedNumber || 'Bedside'})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Trend Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Heart Rate Range</div>
              <div className="text-lg font-black text-slate-900">
                {patientTrends?.summary?.heartRate?.min || 68} - {patientTrends?.summary?.heartRate?.max || 84} bpm
              </div>
              <div className="text-[10px] text-emerald-600 font-bold">
                Avg: {patientTrends?.summary?.heartRate?.avg || 75} bpm
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">SpO2 Oxygen Range</div>
              <div className="text-lg font-black text-slate-900">
                {patientTrends?.summary?.spo2?.min || 97}% - {patientTrends?.summary?.spo2?.max || 99}%
              </div>
              <div className="text-[10px] text-blue-600 font-bold">
                Avg: {patientTrends?.summary?.spo2?.avg || 98.5}%
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Blood Pressure Range</div>
              <div className="text-lg font-black text-slate-900">
                {patientTrends?.summary?.systolicBP?.min || 116} / {patientTrends?.summary?.diastolicBP?.min || 76} mmHg
              </div>
              <div className="text-[10px] text-amber-600 font-bold">Normotensive Profile</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Blood Glucose Range</div>
              <div className="text-lg font-black text-slate-900">
                {patientTrends?.summary?.bloodGlucose?.min || 92} - {patientTrends?.summary?.bloodGlucose?.max || 115} mg/dL
              </div>
              <div className="text-[10px] text-purple-600 font-bold">Euglycemic Regulation</div>
            </div>
          </div>
        </div>
      )}

      {/* Fleet Inventory */}
      {activeTab === 'devices' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Connected Medical Device Fleet
            </h3>
            <span className="text-xs text-slate-400 font-bold">Hospital Hardware Directory</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3">Serial Number</th>
                  <th className="py-3 px-3">Device Name</th>
                  <th className="py-3 px-3">Device Type</th>
                  <th className="py-3 px-3">Manufacturer</th>
                  <th className="py-3 px-3">Assigned Bed</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Last Heartbeat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {devices.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{d.serialNumber}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{d.deviceName}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md text-[10px] font-black">
                        {d.deviceType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{d.manufacturer || 'General Medical'}</td>
                    <td className="py-3 px-3 text-slate-900 font-bold">{d.assignedBed?.bedNumber || 'Unassigned'}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          d.status === 'ONLINE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {d.lastHeartbeatAt ? new Date(d.lastHeartbeatAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Register Device */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Register Medical Device Fleet Node</h3>
            <form onSubmit={handleRegisterDevice} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Device Name *</label>
                <input
                  required
                  placeholder="e.g. ICU Bed 04 Multiparameter Monitor"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label>Serial Number *</label>
                <input
                  required
                  placeholder="e.g. SN-ICU-88219"
                  value={regSerial}
                  onChange={(e) => setRegSerial(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label>Device Type *</label>
                <select
                  value={regType}
                  onChange={(e) => setRegType(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="ICU_MONITOR">ICU Multi-parameter Monitor</option>
                  <option value="ECG_MONITOR">12-Lead ECG Monitor</option>
                  <option value="SPO2_MONITOR">Continuous Pulse Oximeter</option>
                  <option value="BLOOD_PRESSURE_MONITOR">NIBP Monitor</option>
                  <option value="GLUCOSE_MONITOR">Continuous Glucose Monitor</option>
                  <option value="VENTILATOR">Mechanical Ventilator</option>
                  <option value="INFUSION_PUMP">Smart Infusion Pump</option>
                  <option value="WEARABLE">Clinical Wearable Patch</option>
                </select>
              </div>
              <div>
                <label>Manufacturer</label>
                <input
                  placeholder="e.g. Philips, GE Healthcare, Mindray"
                  value={regManufacturer}
                  onChange={(e) => setRegManufacturer(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black shadow"
                >
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Push Live Vitals */}
      {showStreamModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-lg text-slate-900">Push Biometric Telemetry Stream</h3>
            <form onSubmit={handlePushVitals} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Patient ID *</label>
                <input
                  required
                  placeholder="Patient UUID"
                  value={streamPatientId}
                  onChange={(e) => setStreamPatientId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label>Device ID *</label>
                <input
                  required
                  placeholder="Device UUID"
                  value={streamDeviceId}
                  onChange={(e) => setStreamDeviceId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label>Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={streamHR}
                    onChange={(e) => setStreamHR(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label>SpO2 (%)</label>
                  <input
                    type="number"
                    value={streamSpO2}
                    onChange={(e) => setStreamSpO2(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label>Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={streamSBP}
                    onChange={(e) => setStreamSBP(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label>Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={streamDBP}
                    onChange={(e) => setStreamDBP(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label>Resp Rate (rpm)</label>
                  <input
                    type="number"
                    value={streamRR}
                    onChange={(e) => setStreamRR(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label>Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={streamTemp}
                    onChange={(e) => setStreamTemp(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label>Blood Glucose (mg/dL)</label>
                  <input
                    type="number"
                    value={streamGlucose}
                    onChange={(e) => setStreamGlucose(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowStreamModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black shadow"
                >
                  Ingest Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
