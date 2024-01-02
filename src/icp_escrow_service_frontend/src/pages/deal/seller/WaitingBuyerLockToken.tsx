import InitiatingDealProgressBar from "../../../components/InitiatingDealProgressBar";
import { useEffect } from "react";
import { backend } from "../../../../../declarations/backend";
import { useNavigate, useParams } from "react-router-dom";
import { usePrincipal } from "../../../hooks/usePrincipal";
import { useDealData } from "../../../contexts/DealContext";

const WaitingBuyerLockToken = () => {
    const { dealId } = useParams();
    const navigate = useNavigate();
    const { dealData } = useDealData();
    const principal = usePrincipal();


    useEffect(() => {
        if (principal && dealData && dealData.from !== principal) {
            navigate('/dashboard');
        } else {
            const intervalId = setInterval(async () => {
                try {
                    const result = await backend.getDealStatus(BigInt(dealId || 0));
                    if ('ok' in result) {
                        if (result.ok === "InProgress") {
                            clearInterval(intervalId);
                            navigate(`/deal/seller/submit-deliverables/${dealId}`);
                        }
                    }
                } catch (error) {
                    console.error("Failed to get deal status:", error);
                }
            }, 3000);
            return () => clearInterval(intervalId);
        }
    }, [dealData, dealId, navigate]);


    return (
        <div className="card p-5 mx-auto my-5" style={{ width: '75%' }}>
            <div className="card-body text-center">

                <InitiatingDealProgressBar currentStep={2} />

                <div className="mb-4">
                    <img src="/create_deals.png" className="create-deals-image" alt="Image" />
                    <p className="mt-2">Waiting for buyer to lock tokens</p>
                </div>

                <div>
                    <button className="btn return-dashboard-btn">Return to Dashboard</button>
                </div>

            </div>
        </div>
    )
}

export default WaitingBuyerLockToken