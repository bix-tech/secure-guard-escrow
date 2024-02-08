import { backend } from "../../../../declarations/backend";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Deal } from "../../../../declarations/backend/backend.did";
import '../../App.css';
import { usePrincipal } from "../../hooks/usePrincipal";
import { Principal } from "@dfinity/principal";
import { Modal, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface SidebarProps {
    isSidebarActive: boolean;
}



const DealOverview: React.FC<SidebarProps> = ({ isSidebarActive }) => {
    const [deal, setDeal] = useState<Deal | null>(null);
    const { principal, isLoading: isPrincipalLoading } = usePrincipal();
    const [error, setError] = useState('');
    const { dealId } = useParams();
    const [pictureUrls, setPictureUrls] = useState<string[]>([]);
    const [deliverableUrls, setDeliverableUrls] = useState<{ [id: string]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [showConfirmModal, setConfirmModal] = useState(false);
    const [showCancelModal, setCancelModal] = useState(false);
    // const canisterBackend = Principal.fromText('bd3sg-teaaa-aaaaa-qaaba-cai').toText();
    // const platformAccount = Principal.fromText('rwlgt-iiaaa-aaaaa-aaaaa-cai').toText();

    const navigate = useNavigate();

    const handleOpenConfirmModal = () => setConfirmModal(true);
    const handleCloseConfirmModal = () => setConfirmModal(false);

    const handleOpenCancelModal = () => setCancelModal(true);
    const handleCloseCancelModal = () => setCancelModal(false);
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
            const pictureRef = deal.picture;
            try {
                const blob = await backend.getPicture(pictureRef, BigInt(dealId || 0));
                if (blob) {
                    const array = Array.isArray(blob[0]) ? new Uint8Array(blob[0]) : blob[0];
                    if (array) {
                        const blobObject = new Blob([array]);
                        const url = URL.createObjectURL(blobObject);
                        setPictureUrls([url]);
                    }
                } else {
                    throw new Error(`No blob returned for picture ${pictureRef.id}`);
                }
            } catch (error) {
                console.error(`Error fetching picture:`);
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

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!deal) {
        return <div className="container-fluid mt-1 d-flex flex-column">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="spinner-grow text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    }

    

    const handleConfirmDeal = async (dealId: number) => {
        try {
            const result = await backend.confirmDeal(BigInt(dealId), Principal.fromText(principal || ''));
            if ('ok' in result) {
                console.log('Deal confirmed', result);
                toast.success('Deal confirmed successfully');
                setConfirmModal(false);
            } else {
                console.error('Deal confirmation failed', result);
                toast.error(`Deal confirmation failed: ${result.err}`);
                setConfirmModal(false);
            }
        } catch (error) {
            console.error('Deal confirmation failed', error);
            toast.error(`Deal confirmation failed: ${(error as Error).message}`);
        }
    }

    const handleCancelDeal = async (dealId: number) => {
        try {
            const result = await backend.cancelDeal(BigInt(dealId), Principal.fromText(principal || ''));

            if ('ok' in result) {
                console.log('Deal cancelled', result.ok);
                toast.success('Deal cancelled successfully');
                setCancelModal(false);
            } else {
                console.error('Deal cancellation failed', result.err);
                toast.error(`Deal cancellation failed: ${result.err}`);
                setCancelModal(false);
            }
        } catch (error) {
            console.error('Deal cancellation failed', error);
            toast.error(`Deal cancellation failed: ${(error as Error).message}`);
        }
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
        isLoading ? (
            <div className="container-fluid mt-1 d-flex flex-column">
                <main className={`col-md-9 ms-sm-auto col-lg-10 px-md-4 ${isSidebarActive ? 'not-full-width' : 'full-width'}`}>
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                        <div className="spinner-grow text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </main>
            </div>
        ) : (
            <div className="container-fluid mt-1">
                <ToastContainer />
                <div className="row">
                    <main className={`col-md-9 ms-sm-auto col-lg-10 px-md-4 ${isSidebarActive ? 'not-full-width' : 'full-width'}`}>
                        <div className="mt-4">
                            <h4>Deal Overview : {deal.name}</h4>
                            <p>SSM / Company</p>
                            <div className="d-flex flex-row justify-content-end">
                                {deal.status !== 'Confirmed' && deal.status !== 'Cancelled' && (
                                    <button onClick={handleOpenCancelModal} className="btn btn-cancel btn-primary" style={{ marginRight: "5px" }}>Cancel Deal</button>
                                )}
                                {deal.status !== 'Confirmed' && deal.status !== 'Cancelled' && (
                                    <button onClick={handleOpenConfirmModal} className="btn btn-confirm btn-primary" >Confirm Deal</button>
                                )}

                                <Modal show={showConfirmModal} onHide={handleCloseConfirmModal}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Confirm Deal</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body> Are you sure you want to confirm this deal?</Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleCloseConfirmModal}>Close</Button>
                                        <Button variant="primary" onClick={() => { handleConfirmDeal(Number(dealId)) }}>Confirm</Button>
                                    </Modal.Footer>
                                </Modal>

                                <Modal show={showCancelModal} onHide={handleCloseCancelModal}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Cancel Deal</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>Are you sure you want to cancel this deal?</Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleCloseCancelModal}>Close</Button>
                                        <Button variant="primary" onClick={() => { handleCancelDeal(Number(dealId)) }}>Cancel</Button>
                                    </Modal.Footer>
                                </Modal>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <div className="card p-3 my-5" style={{ width: "100%", height: "100%" }}>
                                    <div className="card-body text-center">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar me-3">
                                                {pictureUrls.map((url) => (
                                                    <img key={url} src={url} alt={`Picture`} />
                                                ))}
                                            </div>
                                            <div className="text-start">
                                                <h4 className="mb-0">{deal.name}</h4>
                                                <small>{Object.keys(deal.dealCategory)[0]}</small><br />
                                                <small>{deal.status}</small>
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
                                <div className="card p-3 my-5" style={{ width: "100%", height: "100%" }}>
                                    <div className="card-body ">
                                        <div className="text-start">
                                            <h4>Deal Description</h4>
                                            <div dangerouslySetInnerHTML={{ __html: deal.description }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row mb-5">
                            <div className="col-md-12">
                                <div className="card p-5 mx-auto my-5">
                                    <h4>Deliverables</h4>
                                    <div className="deliverables-grid">
                                        {deal.deliverables.map((deliverable, index) => (
                                            <div key={deliverable.id || index} className="deliverable-item justify-content-between">
                                                {deliverable.deliverableDocuments.map((document) => (
                                                    <div key={document.id} className="d-flex align-items-center m-3" style={{ width: "45%" }}>
                                                        <div className="avatar me-3" style={{ border: "none" }}>
                                                            <img src="/document-download.png" alt="User Avatar" />
                                                        </div>
                                                        <div className="deliverable-download">
                                                            <a href={deliverableUrls[document.id.toString()]} download={document.name}>
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
                </div >
            </div >
        )
    );
}

export default DealOverview