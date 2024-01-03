import { backend } from "../../../../declarations/backend";
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Deal } from "../../../../declarations/backend/backend.did";

const DealOverview = () => {
    const [deal, setDeal] = useState<Deal | null>(null);
    const [error, setError] = useState('');
    const { dealId } = useParams(); 

    useEffect(() => {
        const fetchDealData = async () => {
            try {
                const dealResult = await backend.getDeal(BigInt(dealId || 0));
                if ('ok' in dealResult) {
                    setDeal(dealResult.ok);                    
                } else {
                    setError('An error occurred while fetching the deal.');
                }
            } catch (err) {
                setError('An error occurred while fetching the deal.');
            }
        };
        fetchDealData();
    }, [dealId]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!deal) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div>
            <h1>Deal Overview: {deal.name}</h1>
            </div>
            <div className="d-flex flex-row justify-content-between p-5">
                <div className="card p-5 mx-auto my-5" style={{ width: '45%' }}>
                    Buyer {deal.to.toString()}
                    Seller {deal.from.toString()}
                </div>
                <div className="card p-5 mx-auto my-5" style={{ width: '45%' }}>
                    Deal Description<br />
                    {deal.description}
                </div>
            </div>

            <div className="card p-5 mx-auto my-5" style={{ width: '80%' }}>
                Deliverables
            </div>

            <div className="card p-5 mx-auto my-5" style={{ width: '80%' }}>
                Activity Logs
            </div>

        </div>
    )
}

export default DealOverview