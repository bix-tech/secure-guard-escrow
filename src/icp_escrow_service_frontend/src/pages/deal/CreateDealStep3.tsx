import CreateDealProgressBar from "../../components/CreateDealProgressBar"
import { useNavigate } from 'react-router-dom'
import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { DealFlowContext } from "../../contexts/InitiateDealFlowContext";

const CreateDealSuccessful = () => {
    const context = useContext(DealFlowContext);
    const { dealId } = useParams(); 
    const navigate = useNavigate();

    useEffect(() => {
        if (!context || !context.stepCompleted.step2) {
            navigate('/createDealStep1');
        }
    }, [context, navigate]);

    const handleDashboard = () => {
        navigate('/dashboard');
    }

    const handleDealOverview = () => {
        navigate(`/deal-overview/${dealId}`);
    }
    return (
        <div className="card p-5 mx-auto my-5" style={{width: '75%'}}>
        <div className="card-body text-center">
            
            <CreateDealProgressBar currentStep={3} />

            <div className="mb-4">
                <img src="/create_deals.png" className="create-deals-image" alt="Image"/>
                <p className="mt-2">You’ve Successfully Created a Deal !</p>
            </div>

            <div>
                <button className="btn me-2 view-details-btn" onClick={handleDealOverview}>View Details</button>
                <button className="btn return-dashboard-btn" onClick={handleDashboard}>Return to Dashboard</button>
            </div>

        </div>
    </div>
    )
}

export default CreateDealSuccessful