'use client';

import React from 'react';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

export interface Step {
  id: string;
  title: string;
  description?: string;
}

export interface WizardFormProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onSubmit: () => void;
  loading?: boolean;
  children: React.ReactNode;
  canProceed?: boolean;
  submitLabel?: string;
  className?: string;
}

export function WizardForm({
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  loading = false,
  children,
  canProceed = true,
  submitLabel = 'Complete Submission',
  className = '',
}: WizardFormProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-subtle ${className}`}>
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Connecting Line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />

          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => idx <= currentStep && onStepChange(idx)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950/60 shadow-sm shadow-blue-500/30'
                      : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </button>
                <span
                  className={`mt-2 text-[11px] font-bold text-center hidden sm:block ${
                    isCurrent ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Description */}
      <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {steps[currentStep]?.title}
        </h3>
        {steps[currentStep]?.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {steps[currentStep].description}
          </p>
        )}
      </div>

      {/* Form Content */}
      <div className="min-h-[220px]">{children}</div>

      {/* Footer Navigation */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isFirstStep || loading}
          onClick={() => onStepChange(currentStep - 1)}
          icon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Previous
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={loading}
            disabled={!canProceed}
            onClick={onSubmit}
          >
            {submitLabel}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!canProceed}
            onClick={() => onStepChange(currentStep + 1)}
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
