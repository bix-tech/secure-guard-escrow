import { useNavigate } from 'react-router-dom'
import { useParams } from "react-router-dom";

const CreateDealSuccessful = () => {
    const { dealId } = useParams(); 
    const navigate = useNavigate();

    const handleDashboard = () => {
        navigate('/dashboard');
    }

    const handleDealOverview = () => {
        navigate(`/deal-overview/${dealId}`);
    }
    return (
        <div className="card p-5 mx-auto my-5" style={{width: '75%'}}>
        <div className="card-body text-center">
            
            <div className="mb-4">
                <img src="/create_deals.png" className="create-deals-image" alt="Image"/>
                <p className="mt-2">You’ve Successfully submitted deliverables to a deal, wait for buyer to confirm deal to receive token.</p>
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