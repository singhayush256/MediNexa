import React from 'react';
import {
  Calendar,
  FlaskConical,
  Stethoscope,
  AlertTriangle,
  Pill,
  CheckCircle,
  Building2,
  ChevronRight,
  Activity,
  BedDouble,
} from 'lucide-react';

export interface PrescribedMedicineItem {
  name: string;
  dosage: string;
  route: string; // 'Oral Tablet' | 'IV Injection' | 'IM Injection' | 'Infusion' | 'Subcutaneous'
  frequency: string;
  timing?: string[];
  isInjection?: boolean;
  instructions?: string;
  isLabMedicine?: boolean;
  labReportRef?: string;
  purchaseStatus?: 'NOT_BOUGHT' | 'BOUGHT';
}

export interface DiagnosticReportItem {
  testName: string;
  category?: string;
  modality?: 'PATHOLOGY' | 'XRAY' | 'CT_SCAN' | 'MRI' | 'ULTRASOUND' | 'ECG' | 'ECHO';
  resultValue: string;
  referenceRange?: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL' | 'VERIFIED';
  findings?: string;
  scanFilmImage?: string;
  scanFilmTitle?: string;
  technicianName?: string;
  verifiedAt?: string;
}

export interface VitalsItem {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  spO2?: string;
  respiratoryRate?: string;
  weight?: string;
}

export interface StaffNotesItem {
  doctorNotes?: string;
  nurseNotes?: string;
  receptionNotes?: string;
  pharmacistNotes?: string;
}

export interface AdmissionDetailsItem {
  admittedAt: string;
  dischargedAt?: string;
  durationDays: number;
  durationNights?: number;
  reason: string;
  wardName: string;
  bedNumber: string;
  inchargeNurse?: string;
  conditionOnDischarge?: string;
  injectionsAdministered?: string[];
  dischargeAdvice?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'ENCOUNTER' | 'LAB' | 'PRESCRIPTION' | 'ADMISSION' | 'SURGERY' | 'ALERT';
  title: string;
  provider?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  hospitalName?: string;
  facilityDepartment?: string;
  summary: string;
  badge?: string;
  medicines?: PrescribedMedicineItem[];
  diagnosticReports?: DiagnosticReportItem[];
  vitals?: VitalsItem;
  staffNotes?: StaffNotesItem;
  admissionDetails?: AdmissionDetailsItem;
}

export interface MedicalTimelineProps {
  events: TimelineEvent[];
  className?: string;
  onSelectEvent?: (event: TimelineEvent) => void;
}

export function MedicalTimeline({ events, className = '', onSelectEvent }: MedicalTimelineProps) {
  const iconByType = {
    ENCOUNTER: <Stethoscope className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
    LAB: <FlaskConical className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />,
    PRESCRIPTION: <Pill className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
    ADMISSION: <BedDouble className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
    SURGERY: <CheckCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
    ALERT: <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
  };

  const bgByType = {
    ENCOUNTER: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
    LAB: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-900',
    PRESCRIPTION: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900',
    ADMISSION: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900',
    SURGERY: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900',
    ALERT: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900',
  };

  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 ${className}`}>
      {events.map((event) => {
        const displayDoc = event.doctorName || event.provider || 'Attending Physician';
        const displayHosp = event.hospitalName || 'Apollo MediNexa Super Specialty Hospital';

        return (
          <div key={event.id} className="relative group">
            {/* Node Icon */}
            <div
              className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${
                bgByType[event.type]
              }`}
            >
              {iconByType[event.type]}
            </div>

            {/* Event Interactive Card */}
            <div
              onClick={() => onSelectEvent?.(event)}
              className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-teal-500 dark:hover:border-teal-500 transition-all active:scale-[0.995]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectEvent?.(event);
                }
              }}
            >
              {/* Top Row: Date & Badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    {event.date}
                  </span>
                  {event.admissionDetails && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                      <BedDouble className="w-3 h-3" />
                      {event.admissionDetails.durationDays} Days Inpatient Stay
                    </span>
                  )}
                </div>

                {event.badge && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {event.badge}
                  </span>
                )}
              </div>

              {/* Primary Focus: Doctor Name & Hospital/Clinic Name */}
              <div className="mt-2.5 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <Stethoscope className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {displayDoc}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pl-6">
                  <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {displayHosp}
                  </span>
                </div>
              </div>

              {/* Event Subtitle / Quick Summary */}
              {event.summary && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 pl-6 leading-relaxed">
                  {event.summary}
                </p>
              )}

              {/* Quick Metrics Tags */}
              <div className="mt-3.5 pl-6 flex flex-wrap items-center gap-2">
                {event.medicines && event.medicines.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <Pill className="w-3 h-3" />
                    {event.medicines.length} Medicines & Injections
                  </span>
                )}

                {event.diagnosticReports && event.diagnosticReports.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                    <FlaskConical className="w-3 h-3" />
                    {event.diagnosticReports.length} Labs / Imaging
                  </span>
                )}

                {event.vitals && event.vitals.bloodPressure && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <Activity className="w-3 h-3" />
                    BP: {event.vitals.bloodPressure}
                  </span>
                )}
              </div>

              {/* Tap to View Affordance */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition pl-6">
                <span className="flex items-center gap-1">
                  Tap to view full day dossier (Medicines, Injections, Labs & Notes)
                </span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
