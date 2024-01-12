import React, { useRef, useState } from 'react';
import InitiatingDealProgressBar from '../../../components/InitiatingDealProgressBar';
import { backend } from '../../../../../declarations/backend';
import { useParams, useNavigate } from 'react-router-dom';
import TiptapEditor from '../../../components/TiptapEditor';


type DocumentFile = {
    id: string;
    name: string;
};

interface SidebarProps {
    isSidebarActive: boolean;
};


const CreateDeal : React.FC<SidebarProps> = ( {isSidebarActive} ) => {
    const [isLoading, setIsLoading] = useState(true);
    const [editorContent, setEditorContent] = React.useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedDocuments, setUploadedDocuments] = useState<DocumentFile[]>([]);
    const { dealId } = useParams();
    const navigate = useNavigate();


    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDocumentSelect = async (event: any) => {
        const files = event.target.files;
        console.log("Files:", files);
        if (files.length > 0) {
            for (const file of files) {
                const binaryData = await file.arrayBuffer();
                const documentBinary = new Uint8Array(binaryData);
                await uploadDeliverableDocuments(documentBinary);
                setUploadedDocuments([...uploadedDocuments, file]);
                displayDocumentBadge(file);
            }
        }
    };

    const uploadDeliverableDocuments = async (binaryFile: any) => {
        try {
            const response = await backend.uploadDeliverableDocument(binaryFile);
            console.log("Document uploaded:", response);
        } catch (error) {
            console.error("Failed to upload document:", error);
        }
    };

    const displayDocumentBadge = (file: File) => {
        const badgeContainer = document.getElementById('fileDropArea');
        if (badgeContainer) {
            const badge = document.createElement('span');
            badge.className = 'file-badge';
            badge.textContent = file.name;
            badgeContainer.appendChild(badge);
        }
    };

    const onSubmit = async (event: any) => {
        event.preventDefault();
        console.log("Deal ID:", dealId);
        console.log("Uploaded Documents:", uploadedDocuments);
        try {
            const newDeliverable = {
                id: BigInt(0),
                deliverableDocuments: uploadedDocuments.map((doc, index) => ({
                    id: BigInt(doc.id || index),
                    name: doc.name
                })),
                deliverableDescription: editorContent,
            };
            setIsLoading(true);
            const response = await backend.addDeliverablesToDeal(BigInt(dealId || 0), newDeliverable);
            if ('ok' in response) {
                setIsLoading(false);
                console.log("Deliverables added to deal:", response.ok);
                navigate(`/deal/seller/submit-deliverables-successfully/${dealId}`);
            }
        } catch (error) {
            console.error("Failed to add deliverables to deal:", error);
        }
    };

    const handleEditorContentChange = (content: string) => {
        setEditorContent(content);
    };


    return (
        isLoading ? (
            <div className="container-fluid mt-1 d-flex flex-column">
                <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                    <div className="spinner-grow text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        ) : (
            <div className="container-fluid mt-1 d-flex flex-column">
            <div className={`card p-5 my-5 mb-5 ${isSidebarActive ? 'not-full-width' : 'full-width' }`}>
                <div className="card-body text-center">

                    <InitiatingDealProgressBar currentStep={3} />

                    <form className="mt-5" onSubmit={onSubmit}>
                        <div className="mb-3">
                            <div className="form-row col-md-9 text-start mx-auto">
                                <label htmlFor="projectName" className="form-label text-start">Upload Pictures</label>
                                <br />
                                <label htmlFor="projectName" className="form-label text-start">Recommended size 1500 x 600 (px)</label>
                                <br />

                                <div className="file-drop-area" id="fileDropArea" onClick={triggerFileInput}>
                                    <p>Click here or drag and drop files to upload</p>
                                    <p>Max File Size: 50 MB</p>
                                    <input type="file" id="fileInput" multiple style={{ display: 'none' }} onChange={handleDocumentSelect} ref={fileInputRef} />
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="form-row col-md-9 text-start mx-auto">
                                <label htmlFor="deal-description" className="form-label text-start">Deal Description</label>
                                <TiptapEditor onContentChange={handleEditorContentChange} className="form-control" />
                            </div>
                        </div>

                        <button type="submit" className="btn mx-auto col-md-9 submit-deal-btn mt-3">Submit Deliverables</button>
                    </form>

                </div>
            </div>
            </div>
        )
    )
}

export default CreateDeal