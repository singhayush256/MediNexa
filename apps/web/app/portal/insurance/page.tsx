'use client';

import React from 'react';
import { TpaInsuranceEasyView } from '@/components/insurance/TpaInsuranceEasyView';

export default function PatientPortalInsurancePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <TpaInsuranceEasyView />
    </div>
  );
}
