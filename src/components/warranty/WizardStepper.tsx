import React from 'react';
import { Check } from 'lucide-react';
import { COLORS } from './appleTheme';

interface WizardStepperProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

/**
 * Minimal numbered-circle stepper for the Apple-minimal registration wizard.
 * Desktop shows circles + connecting lines; mobile collapses to a quiet
 * "Step X of N" caption with a thin progress bar, keeping the small-screen
 * footprint tight.
 */
export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  const total = steps.length;

  return (
    <div className="mb-8">
      {/* Desktop / tablet */}
      <div className="hidden items-start sm:flex">
        {steps.map((label, i) => {
          const isCompleted = i < currentStep;
          const isActive = i === currentStep;
          return (
            <React.Fragment key={label}>
              <div className="flex w-20 shrink-0 flex-col items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300"
                  style={
                    isCompleted || isActive
                      ? { borderColor: COLORS.red, backgroundColor: COLORS.red, color: '#fff' }
                      : { borderColor: '#E5E7EB', backgroundColor: '#fff', color: '#9CA3AF' }
                  }
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </div>
                <span
                  className="text-center text-[11px] font-medium leading-tight transition-colors duration-300"
                  style={{ color: isActive ? COLORS.ink : isCompleted ? COLORS.red : '#9CA3AF' }}
                >
                  {label}
                </span>
              </div>
              {i < total - 1 && (
                <div className="mx-1 mt-4 h-px flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: i < currentStep ? '100%' : '0%', backgroundColor: COLORS.red }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: COLORS.red }}>
            Step {currentStep + 1} of {total}
          </span>
          <span className="text-xs font-medium text-gray-400">{steps[currentStep]}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / total) * 100}%`, backgroundColor: COLORS.red }}
          />
        </div>
      </div>
    </div>
  );
}
