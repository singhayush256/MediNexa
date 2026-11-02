import React from 'react';
import { Star, Clock, Award, Calendar, CheckCircle } from 'lucide-react';
import { Button } from './Button';

export interface DoctorCardProps {
  id: string;
  name: string;
  specialization: string;
  department?: string;
  rating?: number;
  reviewCount?: number;
  experienceYears?: number;
  availableSlots?: string[];
  consultationFee?: string;
  onBookAppointment?: (doctorId: string) => void;
  className?: string;
}

export function DoctorCard({
  id,
  name,
  specialization,
  department,
  rating = 4.9,
  reviewCount = 128,
  experienceYears = 12,
  availableSlots = ['09:30 AM', '11:00 AM', '02:30 PM'],
  consultationFee = '$75',
  onBookAppointment,
  className = '',
}: DoctorCardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-subtle hover:shadow-card-hover hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Doctor Header */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-blue-500/20">
              {name.replace(/^(Dr\.\s*)/i, '').charAt(0) || 'D'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight">
                {name}
              </h4>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({reviewCount})</span>
              </div>
            </div>

            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
              {specialization}
            </p>
            {department && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {department}
              </p>
            )}
          </div>
        </div>

        {/* Experience and Meta */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <span>{experienceYears}+ Years Exp</span>
          </div>

          <div className="font-bold text-slate-900 dark:text-slate-100">
            {consultationFee} <span className="text-[10px] text-slate-400 font-normal">/ session</span>
          </div>
        </div>

        {/* Available Time Slots */}
        {availableSlots.length > 0 && (
          <div className="mt-3.5">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              <Clock className="w-3 h-3" />
              <span>Next Available Slots</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableSlots.map((slot, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book CTA */}
      <div className="mt-5 pt-3">
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => onBookAppointment && onBookAppointment(id)}
          icon={<Calendar className="w-3.5 h-3.5" />}
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );
}
