import { useState, useEffect } from "react";
import { backend } from "../../../../../declarations/backend";
import { useNavigate, useParams } from "react-router-dom";
import InitiatingDealProgressBar from "../../../components/InitiatingDealProgressBar";
import { Principal } from "@dfinity/principal";
import { usePrincipal } from "../../../hooks/usePrincipal";
import { useDealData } from "../../../contexts/DealContext";

interface SidebarProps {
    isSidebarActive: boolean;
};

const LockToken : React.FC<SidebarProps> = ( {isSidebarActive} ) => {
    const { dealData, setDealData } = useDealData();
    const [isLoading, setIsLoading] = useState(true);
    const [amount, setAmount] = useState<bigint>(BigInt(0));
    const { dealId } = useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { principal, isLoading: isPrincipalLoading } = usePrincipal();


    useEffect(() => {
        setIsLoading(true);
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
                            setDealData(prevDealData => ({
                                ...prevDealData,
                                to: result.ok.to.toString(),
                                from: result.ok.from.toString(),
                            }));
                            setIsLoading(false);

                            if (dealData && dealData.to && Principal.from(dealData.to).toText() !== principal) {
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
    }, [principal, navigate, isPrincipalLoading]);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        const lockTokenResult = await backend.lockToken(Principal.fromText(principal || ''), BigInt(amount), BigInt(dealId || 0));
        console.log("Lock token result:", lockTokenResult);
        console.log("Lock token result:", principal, amount, dealId)
        if ('TokenLocked' in lockTokenResult) {
            navigate(`/deal/buyer/lock-successfully/${dealId}`);
            setIsLoading(false);
        } else {
            console.error("Failed to lock token:", lockTokenResult);
            setErrorMessage("Failed to lock token: Insufficient Balance");
            setIsLoading(false);
        }
    };

    return (
        isLoading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-grow text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        ) : (
            <div className="container-fluid d-flex flex-column p-5">
            <div className={`card p-5 my-5 ${isSidebarActive ? 'not-full-width' : 'full-width'}`}>
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
        </div>
        )
    )
}

export default LockToken;
