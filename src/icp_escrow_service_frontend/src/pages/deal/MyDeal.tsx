import { useEffect, useState } from 'react'
import { backend } from '../../../../declarations/backend';
import { usePrincipal } from '../../hooks/usePrincipal';
import { Principal } from '@dfinity/principal';
import { Deal } from '../../../../declarations/backend/backend.did';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
    isSidebarActive: boolean;
};

const MyDeal : React.FC<SidebarProps> = ( { isSidebarActive }) => {
    const { principal, isLoading: isPrincipalLoading } = usePrincipal();
    const [deal, setDeal] = useState<Deal[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const handleActionDetail = async (dealId: bigint) => {
        const result = await backend.getDeal(dealId);
        if ('ok' in result) {
            const { status, to } = result.ok;
            const isBuyer = to.toString() === principal?.toString();

            const routes: { [key: string]: string } = {
                'Pending': isBuyer ? `/deal/buyer/lock-token/${dealId}` : `/deal/seller/waiting-buyer/${dealId}`,
                'In Progress': isBuyer ? `/deal/buyer/lock-successfully/${dealId}` : `/deal/seller/submit-deliverables/${dealId}`,
                'Submitted Deliverables': isBuyer ? `/deal-overview/${dealId}` : `/deal/seller/submit-deliverables-successfully/${dealId}`,
                'Completed': `/deal-overview/${dealId}`,
                'Cancelled': `/deal-overview/${dealId}`
            };
            navigate(routes[status]);
        }
    };

    const handleDealClick = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const dealId = BigInt((event.target as HTMLDivElement).dataset.id!);
        setIsLoading(true);
        const result = await backend.getDeal(dealId);
        if ('ok' in result) {
            navigate(`/deal-overview/${dealId}`)
            setIsLoading(false);
        }
    }


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
        <div className="container-fluid p-5">
            <div className="row d-flex">
                <div className={`col-9 mydeal-card ${isSidebarActive ? 'not-full-width' : 'full-width'}`}>
                    {isLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                            <div className="spinner-grow text-success" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        deal && deal.length > 0 ? (
                            deal.map((d, index) => {
                                const isBuyer = d.to.toString() === principal?.toString();

                                const statusDetails: { [key: string]: { badge: string, text: string } } = {
                                    'Pending': {
                                        badge: 'warning',
                                        text: isBuyer ? 'Proceed to lock token' : 'Waiting for buyer to lock token'
                                    },
                                    'In Progress': {
                                        badge: 'primary',
                                        text: isBuyer ? 'Waiting for seller to submit deliverables' : 'Proceed to submit deliverables'
                                    },
                                    'Submitted Deliverables': {
                                        badge: 'primary',
                                        text: isBuyer ? 'Proceed to confirm deal' : 'Waiting for buyer to confirm deal'
                                    },
                                    'Completed': {
                                        badge: 'success',
                                        text: 'View Deal Details'
                                    },
                                    'Cancelled': {
                                        badge: 'danger',
                                        text: 'View Deal Details'
                                    }
                                };

                                const details = statusDetails[d.status] || { badge: 'danger', text: 'View Deal Details' };

                                return (
                                    <div key={index} className="card p-3 my-2 mobile-font-size-10px">
                                        <div className="row">
                                            <div className="col d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    <div className="cursor-pointer" data-id={d.id} onClick={handleDealClick}>{d.name}</div>
                                                    <span className={`badge badge-pill bg-${details.badge} ml-2 mx-2`}>{d.status}</span>
                                                </div>
                                                <button className="btn btn-confirm btn-primary" onClick={() => handleActionDetail(d.id)}>{details.text}</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="card p-3 my-2 mobile-font-size-10px">
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