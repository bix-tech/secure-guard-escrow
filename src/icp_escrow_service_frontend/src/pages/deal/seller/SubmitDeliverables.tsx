import React, { useRef, useState } from 'react';
import InitiatingDealProgressBar from '../../../components/InitiatingDealProgressBar';
import MyEditor from '../../../components/MyEditor';
import { backend } from '../../../../../declarations/backend';
import { useParams, useNavigate } from 'react-router-dom';


type DocumentFile = {
    id: string;
    name: string;
  };


const CreateDeal = () => {

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
            }
        }
        displayDocumentBadge(files[0]);
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
                deliverablePicture: uploadedDocuments.map((doc, index) => ({
                    id: BigInt(doc.id || index), 
                    name: doc.name
                })),
                deliverableDescription: editorContent,
            };
            const response = await backend.addDeliverablesToDeal(BigInt(dealId || 0), newDeliverable);
            if ('ok' in response) {
                console.log("Deliverables added to deal:", response.ok);
                navigate(`/deal/seller/submit-deliverables-successfully/${dealId}`);
            }
        } catch (error) {
            console.error("Failed to add deliverables to deal:", error);
        }
    };

    const handleEditorChange = (content : any) => {
        setEditorContent(content);
      };

    return (
    <div className="card p-5 mx-auto my-5 mb-5" style={{width: '75%'}}>
        <div className="card-body text-center">
            
            <InitiatingDealProgressBar currentStep={3} />
            
            <form className="mt-5" onSubmit={onSubmit}>
                <div className="mb-3">
                    <div className="form-row col-md-9 text-start mx-auto">
                        <label htmlFor="projectName" className="form-label text-start">Upload Pictures</label>
                        <br/>
                        <label htmlFor="projectName" className="form-label text-start">Recommended size 1500 x 600 (px)</label>
                        <br/>

                        <div className="file-drop-area" id="fileDropArea" onClick={triggerFileInput}>
                            <p>Click here or drag and drop files to upload</p>
                            <p>Max File Size: 50 MB</p>
                        <input type="file" id="fileInput" multiple style={{ display: 'none' }} onChange={handleDocumentSelect} ref={fileInputRef}/>
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <div className="form-row col-md-9 text-start mx-auto">
                        <label htmlFor="deal-description" className="form-label text-start">Deal Description</label>
                        {/* <textarea id="editor" className="form-control"></textarea> */}
                        <MyEditor
                            initialValue=""
                            value={editorContent}
                            onEditorChange={handleEditorChange}
                            />
                    </div>
                </div>
                
                <button type="submit" className="btn mx-auto col-md-9 submit-deal-btn mt-3">Submit Deliverables</button>
            </form>

        </div>
    </div>
    )
}

export default CreateDeal