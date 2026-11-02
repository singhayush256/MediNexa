'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

interface ActiveDispatch {
  id: string;
  dispatchNumber: string;
  status: string;
  assignedAt: string;
  emergencyRequest: {
    id: string;
    emergencyNumber: string;
    callerName: string;
    callerPhone: string;
    pickupAddress: string;
    emergencyType: string;
    severity: string;
    status: string;
  };
  ambulance: {
    id: string;
    vehicleNumber: string;
    status: string;
  };
}

export default function DriverDashboardPage() {
  const [dispatches, setDispatches] = useState<ActiveDispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // GPS Simulation state
  const [lat, setLat] = useState('40.7128');
  const [lon, setLon] = useState('-74.0060');

  useEffect(() => {
    fetchDispatches();
  }, []);

  const fetchDispatches = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch<any[]>('/emergencies');
      if (!res.ok || !res.data) throw new Error(res.message || 'Failed to fetch assigned dispatches');
      const emergencies = res.data;
      const activeList: ActiveDispatch[] = [];
      emergencies.forEach((e: any) => {
        if (e.dispatches && e.dispatches.length > 0) {
          e.dispatches.forEach((d: any) => {
            activeList.push({
              ...d,
              emergencyRequest: e,
            });
          });
        }
      });
      setDispatches(activeList);
    } catch (err: any) {
      setError(err.message || 'Error loading active dispatches');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (dispatchId: string, action: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await apiFetch(`/dispatches/${dispatchId}/${action}`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error(res.message || `Failed to perform ${action}`);
      }
      setSuccess(`Trip action '${action}' recorded!`);
      fetchDispatches();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLocationUpdate = async (ambulanceId: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await apiFetch(`/ambulances/${ambulanceId}/location`, {
        method: 'POST',
        body: JSON.stringify({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          source: 'DRIVER_TELEMATICS_SIM',
        }),
      });
      if (!res.ok) {
        throw new Error(res.message || 'Failed to update GPS location');
      }
      setSuccess(`GPS Location telemetry recorded: ${lat}, ${lon}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ambulance Driver Operational Console</h1>
          <p className="text-gray-600 mt-1">Assigned Emergency Dispatch Workspace & Live Telemetry Control</p>
        </div>
        <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          Back to Dashboard
        </Link>
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

      {loading ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          Loading assigned trip dispatches...
        </div>
      ) : dispatches.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          No active emergency trip dispatches currently assigned.
        </div>
      ) : (
        <div className="space-y-6">
          {dispatches.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">
                    Dispatch #{d.dispatchNumber}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">
                    {d.emergencyRequest.emergencyType} Incident ({d.emergencyRequest.severity})
                  </h2>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded bg-amber-100 text-amber-800">
                  {d.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Pickup Details</h3>
                  <p className="text-sm font-medium text-gray-900">{d.emergencyRequest.callerName}</p>
                  <p className="text-xs text-gray-600">{d.emergencyRequest.callerPhone}</p>
                  <p className="text-sm text-gray-800 mt-2 bg-gray-50 p-2.5 rounded border border-gray-200">
                    📍 {d.emergencyRequest.pickupAddress}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Vehicle & Trip Controls</h3>
                  <p className="text-sm font-medium text-gray-900">Vehicle: {d.ambulance.vehicleNumber}</p>
                  <p className="text-xs text-gray-500 mb-4">Assigned: {new Date(d.assignedAt).toLocaleTimeString()}</p>

                  {/* GPS Telemetry Simulation Controls */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <h4 className="text-xs font-bold text-blue-900 mb-2">Update Vehicle GPS Coordinates</h4>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        placeholder="Latitude"
                        className="w-1/2 px-2 py-1 text-xs border rounded bg-white"
                      />
                      <input
                        type="text"
                        value={lon}
                        onChange={(e) => setLon(e.target.value)}
                        placeholder="Longitude"
                        className="w-1/2 px-2 py-1 text-xs border rounded bg-white"
                      />
                    </div>
                    <button
                      onClick={() => handleLocationUpdate(d.ambulance.id)}
                      className="w-full py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      📡 Broadcast GPS Telemetry
                    </button>
                  </div>
                </div>
              </div>

              {/* Trip Actions */}
              <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-2 justify-end">
                {d.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleAction(d.id, 'accept')}
                    className="px-4 py-2 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Accept Trip
                  </button>
                )}
                {d.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleAction(d.id, 'arrive')}
                    className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Arrive at Pickup Location
                  </button>
                )}
                {d.status === 'AT_PICKUP' && (
                  <button
                    onClick={() => handleAction(d.id, 'patient-onboard')}
                    className="px-4 py-2 text-xs font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Patient Onboard
                  </button>
                )}
                {d.status === 'PATIENT_ONBOARD' && (
                  <button
                    onClick={() => handleAction(d.id, 'complete')}
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Complete Trip (Arrived at Hospital)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
