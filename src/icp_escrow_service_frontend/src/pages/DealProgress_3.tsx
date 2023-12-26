import React, { useRef } from 'react';
import CreateDealProgressBar from '../components/CreateDealProgressBar';

const DealProgress_3 = () => {

    const fileInputRef = useRef<HTMLInputElement>(null);

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        const maxFileSizeMB = 50;

        if (files) {
            for (const file of Array.from(files)) {
                if (file.size <= maxFileSizeMB * 1024 * 1024) {
                    displayFileBadge(file);
                } else {
                    alert(`File ${file.name} exceeds the maximum allowed size of ${maxFileSizeMB} MB.`);
                }
            }
        }
    };

    const displayFileBadge = (file: File) => {
        const badgeContainer = document.getElementById('fileDropArea');
        if (badgeContainer) {
            const badge = document.createElement('span');
            badge.className = 'file-badge';
            badge.textContent = file.name;
            badgeContainer.appendChild(badge);
        }
    };

    return (
    <div className="card p-5 mx-auto my-5 mb-5" style={{width: '75%'}}>
        <div className="card-body text-center">
            
        <CreateDealProgressBar currentStep={3} />
            
            <form className="mt-5">
                <div className="mb-3">
                    <div className="form-row col-md-9 text-start mx-auto">
                        <label htmlFor="projectName" className="form-label text-start">Upload Pictures</label>
                        <br/>
                        <label htmlFor="projectName" className="form-label text-start">Recommended size 1500 x 600 (px)</label>
                        <br/>

                        <div className="file-drop-area" id="fileDropArea" onClick={triggerFileInput}>
                            <p>Click here or drag and drop files to upload</p>
                            <p>Max File Size: 50 MB</p>
                        <input type="file" id="fileInput" multiple style={{ display: 'none' }} onChange={handleFileSelect} ref={fileInputRef}/>
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <div className="form-row col-md-9 text-start mx-auto">
                        <label htmlFor="deal-description" className="form-label text-start">Deal Description</label>
                        <textarea id="editor" className="form-control"></textarea>
                    </div>
                </div>
                
                <button type="submit" className="btn mx-auto col-md-9 submit-deal-btn mt-3">Create Deal</button>
            </form>

        </div>
    </div>
    )
}

export default DealProgress_3