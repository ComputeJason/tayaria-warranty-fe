
import React from 'react';
import { Check } from 'lucide-react';

interface StepProps {
  currentStep: number;
}

const RegistrationSteps = ({ currentStep }: StepProps) => {
  const steps = [
    { id: 1, name: 'Add Tyres' },
    { id: 2, name: 'Purchase Info' },
    { id: 3, name: 'Select Retailer' }
  ];
  
  return (
    <div className="flex justify-between items-center px-4 pt-2 pb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center mb-1
              ${currentStep > step.id ? 'step-circle-completed' : 
                currentStep === step.id ? 'step-circle-active' : 'step-circle-inactive'}
            `}>
              {currentStep > step.id ? (
                <Check className="h-5 w-5" />
              ) : (
                step.id
              )}
            </div>
            <span className={`text-xs ${currentStep === step.id ? 'step-active' : 'step-inactive'}`}>
              {step.name}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div className="flex-grow h-px bg-tayaria-gray mx-1 relative top-[-8px]">
              <div 
                className="h-full bg-tayaria-yellow" 
                style={{ 
                  width: `${currentStep > step.id + 1 ? '100%' : currentStep > step.id ? '50%' : '0%'}` 
                }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default RegistrationSteps;
