import { useEffect, useState } from 'react'
import { backend } from '../../../../declarations/backend';
import { usePrincipal } from '../../hooks/usePrincipal';
import { Principal } from '@dfinity/principal';
import { Deal } from '../../../../declarations/backend/backend.did';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const MyDeal = () => {
    const { principal, isLoading: isPrincipalLoading } = usePrincipal();
    const [deal, setDeal] = useState<Deal[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const handleViewDealDetails = (dealId: bigint) => {
        navigate(`/deal-overview/${dealId}`);
    };

    useEffect(() => {
        const fetchDealData = async () => {
            setIsLoading(true);
            if (!isPrincipalLoading) {
                try {
                    const result = await backend.getAllDealsForUser(Principal.fromText(principal!.toString()));
                    if ('ok' in result) {
                        const deal = result.ok as Deal[];
                        setDeal(deal);
                        console.log(result.ok)
                        setIsLoading(false);
                    }
                } catch (err) {
                    console.log(err);
                    setIsLoading(false);
                }
            }
        }
        fetchDealData();
    }, [principal, isPrincipalLoading]);

    return (
        <div className="container-fluid mt-1">
            <div className="row">
                <Sidebar />
                <div className="col-9">
                    <h1>MyDeal</h1>
                    {isLoading ? (
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : (
                        deal && deal.length > 0 ? (
                            deal.map((d, index) => (
                                <div key={index} className="card p-3 my-2">
                                    <div className="row">
                                        <div className="col d-flex justify-content-between align-center">
                                            {d.name}
                                            <button className="btn btn-confirm btn-primary" onClick={() => handleViewDealDetails(d.id)}>View Deal Details</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="card p-3 my-2">
                                No Deal Found...
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
export default MyDeal