import InitiatingDealProgressBar from "../../../components/InitiatingDealProgressBar";
import { useEffect } from "react";
import { backend } from "../../../../../declarations/backend";
import { useNavigate, useParams } from "react-router-dom";
import { usePrincipal } from "../../../hooks/usePrincipal";
import { useDealData } from "../../../contexts/DealContext";
import { Principal } from "@dfinity/principal"

const WaitingBuyerLockToken = () => {
    const { dealId } = useParams();
    const navigate = useNavigate();
    const { dealData, setDealData } = useDealData();
    const { principal, isLoading: isPrincipalLoading } = usePrincipal();

    useEffect(() => {
        if (!isPrincipalLoading) {
            const intervalId = setInterval(async () => {
                try {
                    const result = await backend.getDeal(BigInt(dealId || 0));
                    if ('ok' in result) {
                        const deal = result.ok;

                        setDealData(prevDealData => ({
                            ...prevDealData,
                            to: deal.to.toString(),
                            from: deal.from.toString(),
                        }));

                        if (dealData && dealData.from && Principal.from(dealData.from).toText() != principal) {
                            clearInterval(intervalId);
                            navigate('/dashboard');
                        } else {
                            if (deal.status === "In Progress") {
                                clearInterval(intervalId);
                                navigate(`/deal/seller/submit-deliverables/${dealId}`);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Failed to get deal data:", error);
                }
            }, 3000);
            return () => clearInterval(intervalId);
        }
    }, [dealData, dealId, navigate, principal, isPrincipalLoading]);


    const handleDashboardClick = () => {
        navigate('/dashboard');
    }


    if (!dealId) {
        return (
            <div>
                error
            </div>
        )
    }


    return (
        <div className="card p-5 mx-auto my-5" style={{ width: '75%' }}>
            <div className="card-body text-center">

                <InitiatingDealProgressBar currentStep={2} />

                <div className="mb-4">
                    <img src="/create_deals.png" className="create-deals-image" alt="Image" />
                    <p className="mt-2">Waiting for buyer to lock tokens</p>
                </div>

                <div>
                    <button className="btn return-dashboard-btn" onClick={handleDashboardClick}>Return to Dashboard</button>
                </div>

            </div>
        </div>
    )
}

export default WaitingBuyerLockToken