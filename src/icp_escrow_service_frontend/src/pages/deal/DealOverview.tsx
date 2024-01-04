import { backend } from "../../../../declarations/backend";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Deal } from "../../../../declarations/backend/backend.did";
import '../../App.css';
import { usePrincipal } from "../../hooks/usePrincipal";
import Sidebar from '../../components/Sidebar';
// import { Principal } from "@dfinity/principal";

const DealOverview = () => {
    const [deal, setDeal] = useState<Deal | null>(null);
    const { principal, isLoading: isPrincipalLoading } = usePrincipal();
    const [error, setError] = useState('');
    const { dealId } = useParams();
    const [pictureUrls, setPictureUrls] = useState<string[]>([]);
    const [deliverableUrls, setDeliverableUrls] = useState<{ [id: string]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    // const [supportingDocUrls, setSupportingDocUrls] = useState<string[]>([]);


    useEffect(() => {
        const fetchDealData = async () => {
            if (!isPrincipalLoading) {
                try {
                    const dealResult = await backend.getDeal(BigInt(dealId || 0));
                    if ('ok' in dealResult) {
                        const deal = dealResult.ok;
                        setDeal(deal);
                        if (deal.to.toString() === principal || deal.from.toString() === principal) {
                            await Promise.all([fetchPictures(deal), fetchDeliverables(deal)]);
                        } else {
                            navigate('/dashboard');
                        }
                    } else {
                        throw new Error('An error occurred while fetching the deal.');
                    }
                } catch (err) {
                    setError(error);
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
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
    }, [dealId, principal, isPrincipalLoading]);

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
        <div className="container-fluid mt-1">
            <div className="row">
                <Sidebar />

                <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                    <div className="mt-4">
                        <h4>Deal Overview : {deal.name}</h4>
                        <p>SSM / Company</p>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="card p-3 my-5" style={{ width: "100%;", height: "100%" }}>
                                <div className="card-body text-center">
                                    <div className="d-flex align-items-center">
                                        <div className="avatar me-3">
                                            {/* <img src="/minion.jpeg" alt="User Avatar" /> */}
                                            {pictureUrls.map((url) => (
                                                <img key={url} src={url} alt={`Picture`} />
                                            ))}
                                        </div>
                                        <div className="text-start">
                                            <h4 className="mb-0">Renovation Contract for Condo</h4>
                                            <small>Apartment Assets</small>
                                        </div>
                                    </div>

                                    <hr />


                                    <div className="contract-info">
                                        <div className="row">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar me-3">
                                                    <img src="/minion.jpeg" alt="User Avatar" />
                                                </div>
                                                <div className="text-start">
                                                    <h6 className="mb-0">Buyer</h6>
                                                    <small>{deal.to.toString()}</small>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center mt-3">
                                                <div className="avatar me-3">
                                                    <img src="/minion.jpeg" alt="User Avatar" />
                                                </div>
                                                <div className="text-start">
                                                    <h6 className="mb-0">Seller</h6>
                                                    <small>{deal.from.toString()}</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card p-3 my-5" style={{ width: "100%;", height: "100%" }}>
                                <div className="card-body ">
                                    <div className="text-start">
                                        <h4>Deal Description</h4>
                                        <p>
                                            {/* {deal.description && extractText(deal.description)} */}
                                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Et fugiat autem voluptatibus voluptas perferendis dicta dolore? Maiores dolorum, iusto veniam id porro quis optio animi totam, similique cumque voluptatem? Eligendi?
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <div className="d-flex flex-row justify-content-between p-5">
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
                    </div> */}
                    
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <div className="card p-5 mx-auto my-5">
                                <h4>Deliverables</h4>
                                <div className="deliverables-grid">
                                    {deal.deliverables.map((deliverable, index) => (
                                        <div key={deliverable.id || index} className="deliverable-item justify-content-between">
                                            {deliverable.deliverableDocuments.map((document) => (
                                                <div className="d-flex align-items-center m-3" style={{width: "45%"}}>
                                                    <div className="avatar me-3" style={{border: "none"}}>
                                                        <img src="/document-download.png" alt="User Avatar" />
                                                    </div>
                                                        <div className="deliverable-download">
                                                            <a key={document.id} href={deliverableUrls[document.id.toString()]} download={document.name}>
                                                                <span>{document.name}</span>
                                                            </a>
                                                        </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DealOverview