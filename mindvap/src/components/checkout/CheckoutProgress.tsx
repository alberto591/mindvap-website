import React from 'react';
import { CheckCircle, Circle, Truck, CreditCard, FileText } from 'lucide-react';

interface CheckoutStep {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'upcoming';
  icon: React.ReactNode;
}

interface CheckoutProgressProps {
  currentStep: string;
  steps: Array<{
    id: string;
    name: string;
    icon: React.ReactNode;
  }>;
}

const CheckoutProgress: React.FC<CheckoutProgressProps> = ({ currentStep, steps }) => {
  const getStepStatus = (stepId: string): 'completed' | 'current' | 'upcoming' => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    const stepIndex = steps.findIndex(step => step.id === stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getStepIcon = (step: any, status: 'completed' | 'current' | 'upcoming') => {
    if (status === 'completed') {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
    if (status === 'current') {
      return <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full" />
      </div>;
    }
    return <Circle className="w-6 h-6 text-gray-300" />;
  };

  const getConnectorClass = (stepId: string): string => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    const stepIndex = steps.findIndex(step => step.id === stepId);
    
    if (stepIndex < currentIndex) {
      return 'bg-green-600'; // Completed connector
    }
    return 'bg-gray-200'; // Inactive connector
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          
          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center mb-2">
                  {getStepIcon(step, status)}
                </div>
                <span className={`text-sm font-medium ${
                  status === 'current' ? 'text-brand' : 
                  status === 'completed' ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
              </div>
              
              {/* Connector */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  getConnectorClass(step.id)
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutProgress;