import { useState } from 'react';
import DealProgress1 from './DealProgress_1';
import DealProgress2 from './DealProgress_2';


const CreateDeal = () => {
    const [currentStep, setCurrentStep] = useState(1);

    const nextStep = () => setCurrentStep(currentStep + 1);

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <DealProgress1 onNext={nextStep} />;
            case 2:
                return <DealProgress2 onNext={nextStep} />;
            default:
                return <div>Unknown step</div>;
        }
    };

    return (
        <div>
            {renderStep()}
        </div>
    );
};

export default CreateDeal;
