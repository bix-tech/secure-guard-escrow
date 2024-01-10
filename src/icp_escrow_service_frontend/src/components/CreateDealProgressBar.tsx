import React from 'react';
import '../App.css';

interface CreateDealProgressBarProps {
    currentStep: number;
}

const CreateDealProgressBar: React.FC<CreateDealProgressBarProps> = ({ currentStep }) => {
    return (
        <div className="mb-4 mobile-font-size-8px">
            <div className="d-flex justify-content-between align-items-center">
                <div className={`state-bar d-flex flex-column align-items-center ${currentStep === 1 ? 'active' : ''}`} style={{ width: '20%' }}>
                    <div className="avatar state-avatar">
                        <img src="/create_deal_icon.png" alt="State Avatar 1" />
                    </div>
                    <div className="mt-2">Create Deal</div>
                </div>

                <div className={`horizontal-divider ${currentStep >= 2 ? 'active' : ''}`} style={{ width: '20%', borderBottom: '2px solid', borderColor: currentStep >= 2 ? 'green' : 'gray' }} />

                <div className={`state-bar d-flex flex-column align-items-center ${currentStep === 2 ? 'active' : ''}`} style={{ width: '20%' }}>
                    <div className="avatar state-avatar">
                    <img src={currentStep >= 2 ? "/deal-details-icon.png" : "/deal-details-icon-2.png"} alt="State Avatar 2" />
                    </div>
                    <div className="mt-2">Deal Details</div>
                </div>

                <div className={`horizontal-divider ${currentStep >= 3 ? 'active' : ''}`} style={{ width: '20%', borderBottom: '2px solid', borderColor: currentStep >= 3 ? 'green' : 'gray' }} />

                <div className={`state-bar d-flex flex-column align-items-center ${currentStep >= 3 ? 'active' : ''}`} style={{ width: '20%' }}>
                    <div className="avatar state-avatar">
                        <img src={currentStep >= 3 ? "/verify.png" : "/verify-2.png"} alt="State Avatar 3" />
                    </div>
                    <div className="mt-2">Deal Submitted</div>
                </div>
            </div>
        </div>
    )
}

export default CreateDealProgressBar;