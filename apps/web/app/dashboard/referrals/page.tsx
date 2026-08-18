'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

interface Referral {
  id: string;
  referralNumber: string;
  patientId: string;
  reason: string;
  clinicalSummary: string;
  urgency: string;
  status: string;
  requestedAt: string;
  patient: { id: string; user: { firstName: string; lastName: string } };
  sourceFacility: { name: string; code: string };
  destinationFacility: { name: string; code: string };
  referringDoctor: { user: { firstName: string; lastName: string } };
  crossFacilityTransfers?: any[];
  recordAuthorizations?: any[];
}

export default function ReferralDashboardPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [patientId, setPatientId] = useState('');
  const [sourceFacilityId, setSourceFacilityId] = useState('');
  const [destinationFacilityId, setDestinationFacilityId] = useState('');
  const [reason, setReason] = useState('');
  const [clinicalSummary, setClinicalSummary] = useState('');
  const [urgency, setUrgency] = useState('ROUTINE');

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch<Referral[]>('/referrals');
      if (!res.ok || !res.data) throw new Error(res.message || 'Failed to fetch referrals');
      setReferrals(res.data);
    } catch (err: any) {
      setError(err.message || 'Error loading referrals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await apiFetch('/referrals', {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          sourceFacilityId,
          destinationFacilityId,
          reason,
          clinicalSummary,
          urgency,
        }),
      });
      if (!res.ok) {
        throw new Error(res.message || 'Failed to create referral');
      }
      setSuccess('Hospital referral request submitted successfully!');
      setShowModal(false);
      fetchReferrals();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAccept = async (referralId: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await apiFetch(`/referrals/${referralId}/accept`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        throw new Error(res.message || 'Failed to accept referral');
      }
      setSuccess('Referral accepted!');
      fetchReferrals();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAuthorizeRecord = async (referralId: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await apiFetch(`/referrals/${referralId}/record-access-authorize`, {
        method: 'POST',
        body: JSON.stringify({
          authorizationType: 'ENCOUNTER_SUMMARY',
          expiresInDays: 7,
        }),
      });
      if (!res.ok) {
        throw new Error(res.message || 'Failed to authorize record transfer');
      }
      setSuccess('Medical Record Transfer Authorization granted!');
      fetchReferrals();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStartTransfer = async (referralId: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await apiFetch(`/referrals/${referralId}/start-transfer`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        throw new Error(res.message || 'Failed to start cross-facility transfer');
      }
      setSuccess('Cross-facility transfer initiated (IN_TRANSIT)!');
      fetchReferrals();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Referral Management</h1>
          <p className="text-gray-600 mt-1">Inter-Hospital Referrals, Bed Reservations, and Cross-Facility Patient Transfers</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Back to Dashboard
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            + Create Hospital Referral
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

      {/* Referrals Directory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Referral Requests</h2>
          <button onClick={fetchReferrals} className="text-sm text-blue-600 hover:underline">
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading referral requests...</div>
        ) : referrals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No inter-hospital referrals recorded.</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-3">Referral #</th>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Source → Destination</th>
                <th className="px-6 py-3">Urgency</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {referrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{ref.referralNumber}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {ref.patient?.user ? `${ref.patient.user.firstName} ${ref.patient.user.lastName}` : ref.patientId}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-800">
                    {ref.sourceFacility.name} ➔ {ref.destinationFacility.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-amber-100 text-amber-800">
                      {ref.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {ref.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {ref.status === 'REQUESTED' && (
                      <button
                        onClick={() => handleAccept(ref.id)}
                        className="px-2.5 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Accept
                      </button>
                    )}
                    {ref.status === 'ACCEPTED' && (
                      <>
                        <button
                          onClick={() => handleAuthorizeRecord(ref.id)}
                          className="px-2.5 py-1 text-xs font-medium bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          Authorize Records
                        </button>
                        <button
                          onClick={() => handleStartTransfer(ref.id)}
                          className="px-2.5 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Start Transfer
                        </button>
                      </>
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Inter-Hospital Referral</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Patient ID</label>
                <input
                  type="text"
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Patient UUID"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Source Facility ID</label>
                <input
                  type="text"
                  required
                  value={sourceFacilityId}
                  onChange={(e) => setSourceFacilityId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Source Facility UUID"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Destination Facility ID</label>
                <input
                  type="text"
                  required
                  value={destinationFacilityId}
                  onChange={(e) => setDestinationFacilityId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Destination Facility UUID"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Referral</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Specialized ICU Care Required"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Clinical Summary</label>
                <textarea
                  required
                  value={clinicalSummary}
                  onChange={(e) => setClinicalSummary(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Patient status summary..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Urgency</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ROUTINE">ROUTINE</option>
                  <option value="URGENT">URGENT</option>
                  <option value="EMERGENCY">EMERGENCY</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
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
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
