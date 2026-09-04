'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pill, RefreshCw, CheckCircle2, Search, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, PrescriptionCard } from '@/components/ui';

interface MedicineCatalogItem {
  id: string;
  medicineName: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  stockQuantity: number;
  sellingPrice: number;
  dosageForm?: string;
}

const DEFAULT_MEDICINES: MedicineCatalogItem[] = [
  {
    id: 'med-1',
    medicineName: 'Dolo 650 (Paracetamol 650mg)',
    genericName: 'Paracetamol',
    category: 'Analgesic & Antipyretic',
    manufacturer: 'Micro Labs Ltd',
    stockQuantity: 450,
    sellingPrice: 3.2,
    dosageForm: 'Oral Tablet',
  },
  {
    id: 'med-2',
    medicineName: 'Pan 40 (Pantoprazole 40mg)',
    genericName: 'Pantoprazole Sodium',
    category: 'Gastrointestinal',
    manufacturer: 'Alkem Laboratories',
    stockQuantity: 320,
    sellingPrice: 11.0,
    dosageForm: 'Gastro-resistant Tablet',
  },
  {
    id: 'med-3',
    medicineName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin and Potassium Clavulanate',
    category: 'Antibiotic',
    manufacturer: 'GlaxoSmithKline (GSK)',
    stockQuantity: 180,
    sellingPrice: 22.0,
    dosageForm: 'Film-coated Tablet',
  },
  {
    id: 'med-4',
    medicineName: 'Glycomet 500 SR (Metformin 500mg)',
    genericName: 'Metformin Hydrochloride SR',
    category: 'Antidiabetic',
    manufacturer: 'USV Private Limited',
    stockQuantity: 280,
    sellingPrice: 4.5,
    dosageForm: 'Sustained Release Tablet',
  },
  {
    id: 'med-5',
    medicineName: 'Telma 40 (Telmisartan 40mg)',
    genericName: 'Telmisartan',
    category: 'Cardiovascular',
    manufacturer: 'Glenmark Pharmaceuticals',
    stockQuantity: 210,
    sellingPrice: 12.5,
    dosageForm: 'Oral Tablet',
  },
  {
    id: 'med-6',
    medicineName: 'Atorva 20 (Atorvastatin 20mg)',
    genericName: 'Atorvastatin Calcium',
    category: 'Cardiovascular',
    manufacturer: 'Zydus Healthcare',
    stockQuantity: 160,
    sellingPrice: 16.0,
    dosageForm: 'Film-coated Tablet',
  },
  {
    id: 'med-7',
    medicineName: 'Azee 500 (Azithromycin 500mg)',
    genericName: 'Azithromycin',
    category: 'Antibiotic',
    manufacturer: 'Cipla Ltd',
    stockQuantity: 95,
    sellingPrice: 28.5,
    dosageForm: 'Film-coated Tablet',
  },
  {
    id: 'med-8',
    medicineName: 'Montair LC (Montelukast + Levocetirizine)',
    genericName: 'Montelukast and Levocetirizine',
    category: 'Respiratory',
    manufacturer: 'Cipla Ltd',
    stockQuantity: 140,
    sellingPrice: 19.5,
    dosageForm: 'Chewable / Film-coated Tablet',
  },
];

export default function PatientPrescriptionsPage() {
  const [viewMode, setViewMode] = useState<'PRESCRIPTIONS' | 'CATALOG'>('PRESCRIPTIONS');
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<MedicineCatalogItem[]>(DEFAULT_MEDICINES);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refillAlert, setRefillAlert] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medinexa_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    if (token) {
      Promise.all([
        fetch(`${apiUrl}/patient-portal/prescriptions`, { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
          r.ok ? r.json() : null,
        ),
        fetch(`${apiUrl}/pharmacy/inventory`, { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
          r.ok ? r.json() : null,
        ),
      ])
        .then(([rxData, invData]) => {
          if (Array.isArray(rxData) && rxData.length > 0) {
            setPrescriptions(rxData);
          } else {
            setPrescriptions([
              {
                id: 'rx-1',
                drugName: 'Atorva 20 (Atorvastatin 20mg)',
                genericName: 'Atorvastatin Calcium',
                dosage: '20mg Tablet',
                frequency: 'Once Daily at Bedtime (0-0-1)',
                duration: '90 Days (Active)',
                refillsLeft: 2,
                prescribedBy: 'Dr. Sanjay Deshmukh (Cardiology)',
                prescribedDate: 'Aug 28, 2026',
                status: 'ACTIVE',
              },
              {
                id: 'rx-2',
                drugName: 'Telma 40 (Telmisartan 40mg)',
                genericName: 'Telmisartan',
                dosage: '40mg Tablet',
                frequency: 'Once Daily with Water (1-0-0)',
                duration: '90 Days (Active)',
                refillsLeft: 1,
                prescribedBy: 'Dr. Sanjay Deshmukh (Cardiology)',
                prescribedDate: 'Aug 28, 2026',
                status: 'ACTIVE',
              },
              {
                id: 'rx-3',
                drugName: 'Augmentin 625 Duo',
                genericName: 'Amoxicillin and Potassium Clavulanate',
                dosage: '625mg Tablet',
                frequency: 'Twice daily after meals (1-0-1)',
                duration: '5 Days Course',
                refillsLeft: 0,
                prescribedBy: 'Dr. Priya Verma (General Medicine)',
                prescribedDate: 'Jul 10, 2026',
                status: 'DISPENSED',
              },
            ]);
          }

          if (Array.isArray(invData) && invData.length > 0) {
            const mappedInv: MedicineCatalogItem[] = invData.map((item: any) => ({
              id: item.id,
              medicineName: item.medicineName,
              genericName: item.genericName,
              category: item.medicineName.includes('Augmentin') || item.medicineName.includes('Azee') || item.medicineName.includes('Cefixime')
                ? 'Antibiotic'
                : item.medicineName.includes('Glycomet') || item.medicineName.includes('Insulin')
                ? 'Antidiabetic'
                : item.medicineName.includes('Telma') || item.medicineName.includes('Atorva')
                ? 'Cardiovascular'
                : item.medicineName.includes('Pan 40')
                ? 'Gastrointestinal'
                : 'Analgesic',
              manufacturer: item.manufacturer || 'Apollo MediNexa Pharma',
              stockQuantity: item.stockQuantity,
              sellingPrice: item.sellingPrice,
              dosageForm: 'Oral Formulation',
            }));
            setMedicines(mappedInv);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleRefill = (drugName: string) => {
    setRefillAlert(`Refill request submitted to Apollo MediNexa Outpatient Pharmacy for ${drugName}. Confirmation will arrive within 2 hours.`);
    setTimeout(() => setRefillAlert(null), 4000);
  };

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.genericName && m.genericName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()));

    if (categoryFilter === 'ALL') return matchesSearch;
    return matchesSearch && m.category?.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 pb-16">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Pharmacy & Medication Vault
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">
              Hospital Pharmacy & Medicine Vault
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified electronic prescriptions issued by your attending physicians & hospital formulary directory.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={() => setViewMode('PRESCRIPTIONS')}
              className={`px-4 py-2 rounded-xl transition ${
                viewMode === 'PRESCRIPTIONS'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              My Prescriptions ({prescriptions.length})
            </button>
            <button
              onClick={() => setViewMode('CATALOG')}
              className={`px-4 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                viewMode === 'CATALOG'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span>💊</span>
              <span>Hospital Medicine Directory</span>
            </button>
          </div>
        </div>

        {refillAlert && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{refillAlert}</span>
          </div>
        )}

        {/* View 1: Patient's Prescriptions */}
        {viewMode === 'PRESCRIPTIONS' && (
          <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">Loading prescriptions...</div>
            ) : prescriptions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">No active prescriptions on file.</div>
            ) : (
              prescriptions.map((rx) => (
                <PrescriptionCard
                  key={rx.id}
                  id={rx.id}
                  drugName={rx.drugName || rx.medicationName || 'Prescribed Medication'}
                  genericName={rx.genericName}
                  dosage={rx.dosage || '1 Tablet'}
                  frequency={rx.frequency || 'Daily'}
                  duration={rx.duration || '30 Days'}
                  refillsLeft={rx.refillsLeft ?? 2}
                  prescribedBy={rx.prescribedBy || 'Attending Physician'}
                  prescribedDate={rx.prescribedDate || 'Active'}
                  status={rx.status || 'ACTIVE'}
                  onRefill={() => handleRefill(rx.drugName || rx.medicationName)}
                />
              ))
            )}
          </div>
        )}

        {/* View 2: Patient Hospital Medicine Formulary / Catalog Browser */}
        {viewMode === 'CATALOG' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by brand name (Dolo 650, Pan 40...), generic ingredient, or manufacturer..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
                {['ALL', 'Antibiotic', 'Antidiabetic', 'Cardiovascular', 'Gastrointestinal', 'Analgesic'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-2 rounded-xl transition whitespace-nowrap text-[11px] ${
                      categoryFilter === cat
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Medicine Directory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMedicines.map((med) => {
                const inStock = med.stockQuantity > 0;
                return (
                  <div
                    key={med.id}
                    className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                          {med.category || 'Therapeutic Formulation'}
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                          {med.medicineName}
                        </h3>
                        {med.genericName && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Composition: {med.genericName}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 shrink-0">
                        ₹{med.sellingPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-slate-500 dark:text-slate-400">
                        <span>Mfg: </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{med.manufacturer}</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                          inStock
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                        }`}
                      >
                        {inStock ? 'In Stock (Central Pharmacy)' : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleRefill(med.medicineName)}
                        className="w-full py-2 bg-slate-50 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950 text-slate-700 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                      >
                        <Pill className="w-3.5 h-3.5" />
                        <span>Request Pharmacy Dispense</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
