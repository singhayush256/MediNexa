'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Ambulance {
  id: string;
  vehicleNumber: string;
  registrationNumber: string;
  ambulanceType: string;
  status: string;
  currentLatitude?: number;
  currentLongitude?: number;
  facility: { name: string; code: string };
}

interface Driver {
  id: string;
  licenseNumber: string;
  status: string;
  user: { firstName: string; lastName: string; email: string; phone: string };
}

export default function AmbulanceFleetDashboardPage() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const [ambRes, drvRes] = await Promise.all([
        fetch('http://localhost:3001/api/v1/ambulances', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:3001/api/v1/ambulance-drivers', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (ambRes.ok) setAmbulances(await ambRes.json());
      if (drvRes.ok) setDrivers(await drvRes.json());
    } catch (err: any) {
      setError(err.message || 'Error loading fleet data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ambulance Fleet & Drivers</h1>
          <p className="text-gray-600 mt-1">Vehicle Status, Telematics, Equipment, and Assigned Driver Directory</p>
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

      {/* Ambulances Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Ambulance Vehicles</h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
            {ambulances.length} Registered Vehicles
          </span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading ambulance fleet...</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-3">Vehicle #</th>
                <th className="px-6 py-3">Registration</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Facility</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Current Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ambulances.map((amb) => (
                <tr key={amb.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{amb.vehicleNumber}</td>
                  <td className="px-6 py-4 text-gray-700">{amb.registrationNumber}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                      {amb.ambulanceType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{amb.facility.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        amb.status === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800'
                          : amb.status === 'DISPATCHED' || amb.status === 'EN_ROUTE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {amb.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                    {amb.currentLatitude && amb.currentLongitude
                      ? `${amb.currentLatitude.toFixed(4)}, ${amb.currentLongitude.toFixed(4)}`
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Drivers Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Ambulance Drivers</h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-800 rounded-full">
            {drivers.length} Drivers On Record
          </span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading drivers...</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-3">Driver Name</th>
                <th className="px-6 py-3">License #</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.map((drv) => (
                <tr key={drv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {drv.user.firstName} {drv.user.lastName}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{drv.licenseNumber}</td>
                  <td className="px-6 py-4 text-xs">
                    <div>{drv.user.email}</div>
                    <div className="text-gray-500">{drv.user.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                      {drv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
