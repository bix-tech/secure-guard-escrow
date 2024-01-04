import { useState, useEffect } from "react";
import { backend } from "../../../../../declarations/backend";
import { useNavigate, useParams } from "react-router-dom";
import InitiatingDealProgressBar from "../../../components/InitiatingDealProgressBar";
import { Principal } from "@dfinity/principal";
import { usePrincipal } from "../../../hooks/usePrincipal";
import { useDealData } from "../../../contexts/DealContext";

const LockToken = () => {
    const { dealData } = useDealData();
    const [amount, setAmount] = useState<bigint>(BigInt(0));
    const { dealId } = useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { principal, isLoading: isPrincipalLoading } = usePrincipal();


    useEffect(() => {
        if (!isPrincipalLoading) {
            const fetchDealDetails = async () => {
                try {
                    console.log("Deal data:", dealData);
                    console.log("Deal to:", dealData.to);
                    console.log(principal);
                    const result = await backend.getDeal(BigInt(dealId || 0));
                    if ('ok' in result) {
                        if (result.ok.status === "Pending") {
                            setAmount(BigInt(result.ok.amount));

                            if (dealData.to && Principal.from(dealData.to).toText() !== principal) {
                                console.log("Deal data:", dealData);
                                console.log("Deal to:", dealData.to);
                                console.log(principal);
                                navigate('/dashboard');
                            }
                        }
                    } else {
                        console.error("Failed to fetch deal details:", result.err);
                    }
                } catch (error) {
                    console.error("Error fetching deal details:", error);
                }
            };

            fetchDealDetails();
        }
    }, [dealData, principal, navigate, isPrincipalLoading]);


    const handleSubmit = async (event: any) => {
        event.preventDefault();
        const lockTokenResult = await backend.lockToken(Principal.fromText(principal || ''), BigInt(amount), BigInt(dealId || 0));
        console.log("Lock token result:", lockTokenResult);
        console.log("Lock token result:", principal, amount, dealId)
        if ('TokenLocked' in lockTokenResult) {
            navigate(`/deal/buyer/lock-successfully/${dealId}`);
        } else {
            console.error("Failed to lock token:", lockTokenResult);
            setErrorMessage("Failed to lock token: Insufficient Balance");
        }
    };

    return (
        <div className="card p-5 mx-auto my-5" style={{ width: '75%' }}>
            <div className="card-body text-center">

                <InitiatingDealProgressBar currentStep={2} />
                {errorMessage && <span className="badge bg-danger">{errorMessage}</span>}

                <form className="mt-5" onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <div className="form-row col-md-9 text-start mx-auto">
                            <label htmlFor="tokenAmount" className="form-label text-start">Lock Token</label>
                            <input
                                type="number"
                                className="form-control form-control-lg lock-token-text"
                                id="tokenAmount"
                                placeholder="Token Number"
                                value={amount.toString()}
                                onChange={(e) => setAmount(BigInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn mx-auto col-md-9 submit-deal-btn mt-3">Lock Token</button>
                </form>

            </div>
        </div>
    )
}

export default LockToken;
