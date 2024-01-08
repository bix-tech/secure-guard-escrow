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

    const handleActionDetail = async (dealId: bigint) => {
        const result = await backend.getDeal(dealId);
        if ('ok' in result) {
            if (result.ok.status === 'Pending' && result.ok.to.toString() === principal?.toString()) {
                navigate(`/deal/buyer/lock-token/${dealId}`);
            } else if (result.ok.status === 'Pending' && result.ok.from.toString() === principal?.toString()) {
                navigate(`/deal/seller/waiting-buyer/${dealId}`);
            } else if (result.ok.status === 'In Progress' && result.ok.to.toString() === principal?.toString()) {
                navigate(`/deal/buyer/lock-successfully/${dealId}`);
            } else if (result.ok.status === 'In Progress' && result.ok.from.toString() === principal?.toString()) {
                navigate(`/deal/seller/submit-deliverables/${dealId}`);
            } else if (result.ok.status === 'Submitted Deliverables' && result.ok.to.toString() === principal?.toString()) {
                navigate(`/deal-overview/${dealId}`);
            } else if (result.ok.status === 'Submitted Deliverables' && result.ok.from.toString() === principal?.toString()) {
                navigate(`/deal/seller/submit-deliverables-successfully/${dealId}`);
            } else if (result.ok.status === 'Completed') {
                navigate(`/deal-overview/${dealId}`);
            } else if (result.ok.status === 'Cancelled') {
                navigate(`/deal-overview/${dealId}`);
            }
        }
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
                                            {d.status === 'Pending' && d.to.toString() === principal?.toString() ? (
                                                <div>
                                                    <span className="badge badge-warning">Pending</span>
                                                    <button className="btn btn-confirm btn-primary" onClick={() => handleActionDetail(d.id)}>Proceed to lock token</button>
                                                </div>
                                            ) : d.status === 'Pending' && d.from.toString() === principal?.toString() ? (
                                                <div>
                                                    <span className="badge badge-warning">Pending</span>
                                                    <button className="btn btn-confirm btn-primary" onClick={() => handleActionDetail(d.id)}>Waiting for buyer to lock token</button>
                                                </div>
                                            ) : d.status === 'In Progress' && d.to.toString() === principal?.toString() ? (
                                                <div>
                                                    <span className="badge badge-primary">In Progress</span>
                                                    <button className="btn btn-confirm btn-primary" onClick={() => handleActionDetail(d.id)}>Waiting for seller to submit deliverables</button>
                                                </div>
                                            ) : d.status === 'In Progress' && d.from.toString() === principal?.toString() ? (
                                                <div>
                                                    <span className="badge badge-primary">In Progress</span>
                                                    <button className="btn btn-confirm btn-primary" onClick={() => handleActionDetail(d.id)}>Proceed to submit deliverables</button>
                                                </div>
                                            ) : d.status === 'Submitted Deliverables' && d.to.toString() === principal?.toString() ? (
                                                <div>
                                                    <span className="badge badge-success">Submitted Deliverables</span>
                                                    <button className="btn btn-confirm btn-primary" onClick={() => handleActionDetail(d.id)}>Proceed to confirm deal</button>
                                                </div>
                                            ) : d.status === 'Submitted Deliverables' && d.from.toString() === principal?.toString() ? (
                                                <div>
                                                    <span className="badge badge-success">Submitted Deliverables</span>
                                                    <button className="btn btn-confirm btn-primary" onClick={() => handleActionDetail(d.id)}>Waiting for buyer to confirm deal</button>
                                                </div>
                                            ) : d.status === 'Completed' ? (
                                                <div>
                                                    <span className="badge badge-success">Completed</span>
                                                    <button className="btn btn-confirm btn-primary" onClick={() => handleActionDetail(d.id)}>View Deal Details</button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="badge badge-danger">Cancelled</span>
                                                    <button className="btn btn-confirm btn-primary" onClick={() => handleActionDetail(d.id)}>View Deal Details</button>
                                                </div>
                                            )}
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