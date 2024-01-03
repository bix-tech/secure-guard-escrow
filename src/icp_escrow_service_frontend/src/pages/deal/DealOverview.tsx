import { backend } from "../../../../declarations/backend";
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Deal } from "../../../../declarations/backend/backend.did";
import '../../App.css';

const DealOverview = () => {
    const [deal, setDeal] = useState<Deal | null>(null);
    const [error, setError] = useState('');
    const { dealId } = useParams();
    const [pictureUrls, setPictureUrls] = useState<string[]>([]);
    const [deliverableUrls, setDeliverableUrls] = useState<{ [id: string]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    // const [supportingDocUrls, setSupportingDocUrls] = useState<string[]>([]);


    useEffect(() => {
        const fetchDealData = async () => {
            try {
                const dealResult = await backend.getDeal(BigInt(dealId || 0));
                if ('ok' in dealResult) {
                    const deal = dealResult.ok;
                    setDeal(deal);
                    await Promise.all([fetchPictures(deal), fetchDeliverables(deal)]);
                } else {
                    throw new Error('An error occurred while fetching the deal.');
                }
            } catch (err) {
                setError(error);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
    
        const fetchPictures = async (deal: Deal) => {
            const pictureId = deal.picture;
            const blob = await backend.getPicture(pictureId, BigInt(dealId || 0));
            if (blob !== null && blob.length > 0) {
                const array = Array.isArray(blob[0]) ? new Uint8Array(blob[0]) : blob[0];
                if (array !== undefined) {
                    const blobObject = new Blob([array]);
                    const url = URL.createObjectURL(blobObject);
                    setPictureUrls([url]);
                } else {
                    throw new Error(`No blob returned for picture ${pictureId.id}`);
                }
            }
        };
    
        const fetchDeliverables = async (deal: Deal) => {
            const urls: { [id: string]: string } = {};
            for (const deliverable of deal.deliverables) {
                for (const document of deliverable.deliverableDocuments) {
                    const blob = await backend.getAllDeliverableDocuments(BigInt(dealId || 0));
                    if (blob !== null && blob.length > 0) {
                        const array = Array.isArray(blob[0]) ? new Uint8Array(blob[0]) : blob[0];
                        if (array !== undefined) {
                            const blobObject = new Blob([array]);
                            const url = URL.createObjectURL(blobObject);
                            urls[document.id.toString()] = url;
                        } else {
                            throw new Error(`No blob returned for document ${document.id}`);
                        }
                    }
                }
            }
            setDeliverableUrls(urls);
        };
    
        setIsLoading(true);
        fetchDealData();
    }, [dealId]);
    

    const extractText = (rawDescription: any) => {
        try {
            const parsed = JSON.parse(rawDescription);
            return parsed.blocks.map((block: { text: any; }) => block.text).join('\n');
        } catch (error) {
            console.error('Error parsing deal description:', error);
            return '';
        }
    }


    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!deal) {
        return <div className="loader"></div>;
    }

    if (isLoading) {
        return <div className="loader"></div>;
    }

        // useEffect(() => {
    //     const fetchSupportingDocuments = async () => {
    //         if (deal !== null) {
    //             const pictureIds = deal.supportingDocuments;
    //             const urls: string[] = [];
    //             for (const pictureId of pictureIds) {
    //                 const blob = await backend.getSupportingDocument(pictureId, BigInt(dealId || 0));
    //                 if (blob !== null && blob.length > 0) {
    //                     const array = Array.isArray(blob[0]) ? new Uint8Array(blob[0]) : blob[0];
    //                     if (array !== undefined) {
    //                         const blobObject = new Blob([array]);
    //                         const url = URL.createObjectURL(blobObject);
    //                         urls.push(url);
    //                     } else {
    //                         console.error(`No blob returned for picture ${pictureId.id}`);
    //                     }
    //                 }
    //             }
    //             setSupportingDocUrls(urls);
    //         }
    //     }
    //     fetchSupportingDocuments();
    // }, [deal]);

    return (
        <div>
            <div>
                <h1>Deal Overview: {deal.name}</h1>
            </div>
            <div className="d-flex flex-row justify-content-between p-5">
                <div className="card p-5 mx-auto my-5" style={{ width: '45%' }}>
                    Buyer {deal.to.toString()}
                    Seller {deal.from.toString()}
                    {pictureUrls.map((url) => (
                        <img key={url} src={url} alt={`Picture`} />
                    ))}
                </div>
                <div className="card p-5 mx-auto my-5" style={{ width: '45%' }}>
                    Deal Description<br />
                    {deal.description && extractText(deal.description)}
                </div>
            </div>
            <div className="card p-5 mx-auto my-5" style={{ width: '100%' }}>
                <h2>Deliverables</h2>
                <div className="deliverables-grid">
                    {deal.deliverables.map((deliverable, index) => (
                        <div key={deliverable.id || index} className="deliverable-item">
                            {deliverable.deliverableDocuments.map((document) => (
                                <a key={document.id} href={deliverableUrls[document.id.toString()]} download={document.name}>
                                    <div className="deliverable-download">
                                        <span>{document.name}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default DealOverview