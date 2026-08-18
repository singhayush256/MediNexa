'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface EmergencyRequest {
  id: string;
  emergencyNumber: string;
  callerName: string;
  callerPhone: string;
  pickupAddress: string;
  emergencyType: string;
  severity: string;
  status: string;
  requestedAt: string;
  patient?: { user: { firstName: string; lastName: string } };
  dispatches?: any[];
}

export default function EmergencyDashboardPage() {
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create Form State
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [emergencyType, setEmergencyType] = useState('MEDICAL');
  const [severity, setSeverity] = useState('MODERATE');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/v1/emergencies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch emergencies');
      const data = await res.json();
      setEmergencies(data);
    } catch (err: any) {
      setError(err.message || 'Error loading emergency incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/v1/emergencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          callerName,
          callerPhone,
          pickupAddress,
          emergencyType,
          severity,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create emergency request');
      }
      setSuccess('Emergency request logged successfully!');
      setShowModal(false);
      setCallerName('');
      setCallerPhone('');
      setPickupAddress('');
      fetchEmergencies();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/v1/emergencies/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update status');
      }
      setSuccess(`Emergency status updated to ${status}`);
      fetchEmergencies();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Emergency Response Center</h1>
          <p className="text-gray-600 mt-1">Live Emergency Incidents, Triage, and Dispatch Coordination</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Back to Dashboard
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm"
          >
            + Report New Emergency
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Incidents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Active Emergency Incidents</h2>
          <button onClick={fetchEmergencies} className="text-sm text-blue-600 hover:underline">
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading emergency incidents...</div>
        ) : emergencies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No active emergency incidents logged.</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-3">Emergency #</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Caller & Address</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Requested At</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {emergencies.map((emg) => (
                <tr key={emg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{emg.emergencyNumber}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      {emg.emergencyType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        emg.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : emg.severity === 'HIGH'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {emg.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{emg.callerName} ({emg.callerPhone})</div>
                    <div className="text-xs text-gray-500">{emg.pickupAddress}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                      {emg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(emg.requestedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {emg.status === 'REPORTED' && (
                      <button
                        onClick={() => handleStatusUpdate(emg.id, 'TRIAGED')}
                        className="px-2.5 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Triage
                      </button>
                    )}
                    {(emg.status === 'REPORTED' || emg.status === 'TRIAGED') && (
                      <button
                        onClick={() => handleStatusUpdate(emg.id, 'DISPATCH_REQUESTED')}
                        className="px-2.5 py-1 text-xs font-medium bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Request Dispatch
                      </button>
                    )}
                    {emg.status !== 'CLOSED' && emg.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleStatusUpdate(emg.id, 'CANCELLED')}
                        className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Report Emergency Incident</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Caller Name</label>
                <input
                  type="text"
                  required
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. John Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Caller Phone</label>
                <input
                  type="text"
                  required
                  value={callerPhone}
                  onChange={(e) => setCallerPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. +1-800-555-9111"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pickup Address</label>
                <textarea
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Street address or location details"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Emergency Type</label>
                  <select
                    value={emergencyType}
                    onChange={(e) => setEmergencyType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MEDICAL">MEDICAL</option>
                    <option value="TRAUMA">TRAUMA</option>
                    <option value="ACCIDENT">ACCIDENT</option>
                    <option value="CARDIAC">CARDIAC</option>
                    <option value="STROKE">STROKE</option>
                    <option value="RESPIRATORY">RESPIRATORY</option>
                    <option value="MATERNITY">MATERNITY</option>
                    <option value="PEDIATRIC">PEDIATRIC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
