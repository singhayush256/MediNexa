'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HrmsEmployeesSubPage() {
  const [employees, setEmployees] = useState<any[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('medinexa_token');
    if (!token) return;

    fetch(`${apiUrl}/hrms/employees`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setEmployees(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Hospital Staff & Employee Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Complete register of doctors, nursing staff, clinical technicians, and administrative personnel.</p>
        </div>
        <Link href="/dashboard/hrms" className="px-4 py-2 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl">
          ← Back to HRMS Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase bg-slate-50">
              <th className="py-3 px-4">Emp Code</th>
              <th className="py-3 px-4">Full Name</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Designation</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Net Salary</th>
              <th className="py-3 px-4">Joining Date</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-violet-700">{emp.employeeCode}</td>
                <td className="py-3 px-4 text-slate-900 font-bold">{emp.fullName}</td>
                <td className="py-3 px-4 text-slate-600">{emp.department?.name || 'General Medicine'}</td>
                <td className="py-3 px-4 text-slate-700">{emp.designation}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full">{emp.employmentType}</span>
                </td>
                <td className="py-3 px-4 font-extrabold text-emerald-600">${emp.salaryStructure?.netSalary || 62262.5}</td>
                <td className="py-3 px-4 text-slate-500">{new Date(emp.joiningDate).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
