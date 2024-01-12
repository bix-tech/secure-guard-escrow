import CreateDealProgressBar from "../../components/CreateDealProgressBar"
import { useNavigate } from 'react-router-dom'
import { useContext, useEffect } from "react";
import { DealFlowContext } from "../../contexts/InitiateDealFlowContext";
import { useDealData } from "../../contexts/DealContext";

interface SidebarProps {
    isSidebarActive: boolean;
};

const CreateDealSuccessful : React.FC<SidebarProps> = ({ isSidebarActive }) => {
    const context = useContext(DealFlowContext);
    const { dealData } = useDealData();
    const navigate = useNavigate();
    const dealId = dealData.id;

    useEffect(() => {
        if (!context || !context.stepCompleted.step2) {
            navigate('/createDealStep1');
        }
    }, [context, navigate]);

    const handleDashboard = () => {
        navigate('/dashboard');
    }

    const handleDealOverview = () => {
        navigate(`/deal-overview/${BigInt(dealId || 0)}`);
    }

    return (
        <div className="container-fluid mt-1 d-flex flex-column">
            <div className={`card create-deal-step-3-card p-5 margin-y-5 mobile-font-size-8px ${isSidebarActive ? 'not-full-width' : 'full-width'}`}>
                <div className="card-body text-center">

                    <CreateDealProgressBar currentStep={3} />

                    <div className="mb-4">
                        <img src="/create_deals.png" className="create-deals-image" alt="Image" />
                        <p className="mt-2">You’ve Successfully Created a Deal !</p>
                    </div>

                    <div>
                        <button className="btn me-2 view-details-btn mobile-font-size-8px" onClick={handleDealOverview}>View Details</button>
                        <button className="btn return-dashboard-btn mobile-font-size-8px" onClick={handleDashboard}>Return to Dashboard</button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default CreateDealSuccessful