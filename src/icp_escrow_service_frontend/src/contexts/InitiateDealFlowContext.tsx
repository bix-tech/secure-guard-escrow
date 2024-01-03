import React, { createContext, useState, ReactNode } from 'react';

type DealFlowContextType = {
  stepCompleted: { [key: string]: boolean };
  completeStep: (step: string) => void;
};

export const DealFlowContext = createContext<DealFlowContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const DealFlowProvider: React.FC<Props> = ({ children }) => {
  const [stepCompleted, setStepCompleted] = useState<{ [key: string]: boolean }>({ step1: false, step2: false, step3: false });

  const completeStep = (step: string) => {
    const updatedSteps = { ...stepCompleted };
    updatedSteps[step] = true;

    if(step === 'step1' && !updatedSteps['step2']) {
      updatedSteps['step2'] = true; 
    } else if(step === 'step2' && !updatedSteps['step3']) {
      updatedSteps['step3'] = true; 
    }

    setStepCompleted(updatedSteps);
  };

  return (
    <DealFlowContext.Provider value={{ stepCompleted, completeStep }}>
      {children}
    </DealFlowContext.Provider>
  );
};
