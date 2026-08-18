'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface FacilityCapacity {
  facilityId: string;
  facilityName: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  reservedBeds: number;
  cleaningBeds: number;
  maintenanceBeds: number;
  outOfServiceBeds: number;
  occupancyRate: number;
}

export default function NetworkHospitalsPage() {
  const [capacities, setCapacities] = useState<FacilityCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNetworkCapacity();
  }, []);

  const fetchNetworkCapacity = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/v1/network/facilities/capacity', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch network facility capacity');
      const data = await res.json();
      setCapacities(data);
    } catch (err: any) {
      setError(err.message || 'Error loading capacity data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Network Hospital Capacity</h1>
          <p className="text-gray-600 mt-1">Live Bed Occupancy & Real-Time Capacity Across Healthcare Network</p>
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

      {loading ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          Querying live network capacity...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capacities.map((fac) => (
            <div key={fac.facilityId} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{fac.facilityName}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Authoritative Live Bed Data</p>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                  {fac.occupancyRate}% Occupied
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <div className="text-2xl font-black text-green-700">{fac.availableBeds}</div>
                  <div className="text-xs font-semibold text-green-800 mt-1 uppercase">Available</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                  <div className="text-2xl font-black text-red-700">{fac.occupiedBeds}</div>
                  <div className="text-xs font-semibold text-red-800 mt-1 uppercase">Occupied</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <div className="text-2xl font-black text-amber-700">{fac.reservedBeds}</div>
                  <div className="text-xs font-semibold text-amber-800 mt-1 uppercase">Reserved</div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Total Beds Capacity:</span>
                  <span className="font-semibold text-gray-900">{fac.totalBeds}</span>
                </div>
                <div className="flex justify-between">
                  <span>Beds Under Cleaning / Maintenance:</span>
                  <span className="font-semibold text-gray-900">{fac.cleaningBeds + fac.maintenanceBeds}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
