import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import '@tinymce/tinymce-react';

const CreateDeal = () => {

    const [editorContent, setEditorContent] = React.useState('');
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

    const handleEditorChange = (content : any, editor : any) => {
        setEditorContent(content);
      };

    return (
    <div className="card p-5 mx-auto my-5 mb-5" style={{width: '75%'}}>
        <div className="card-body text-center">
            
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="state-bar d-flex flex-column align-items-center" style={{width: '20%'}}>
                        <div className="avatar state-avatar">
                            <img src="../../src/assets/images/create_deal_icon.png" alt="State Avatar 1"/>
                        </div>
                        <div className="mt-2">Create Deal</div>
                    </div>

                    <div className="horizontal-divider">
                        <img src="../../src/assets/images/line-green.png" className="divider-image" alt="Divider Image 1"/>
                    </div>

                    <div className="state-bar d-flex flex-column align-items-center" style={{width: '20%'}}>
                        <div className="avatar state-avatar">
                            <img src="../../src/assets/images/deal-details-icon.png" alt="State Avatar 2"/>
                        </div>
                        <div className="mt-2">Buyer Lock Payment</div>
                    </div>

                    <div className="horizontal-divider">
                        <img src="../../src/assets/images/line-green.png" className="divider-image" alt="Divider Image 2"/>
                    </div>

                    <div className="state-bar d-flex flex-column align-items-center" style={{width: '20%'}}>
                        <div className="avatar state-avatar">
                            <img src="../../src/assets/images/verify.png" alt="State Avatar 3"/>
                        </div>
                        <div className="mt-2">Deliverables</div>
                    </div>
                </div>
            </div>
            
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
                        {/* <textarea id="editor" className="form-control"></textarea> */}
                        <Editor
                            initialValue=""
                            value={editorContent}
                            init={{
                                height: 250,
                                menubar: false,
                                plugins: ['paste', 'link'],
                                toolbar: 'undo redo | bold italic | paste link',
                            }}
                            onEditorChange={handleEditorChange}
                            />
                    </div>
                </div>
                
                <button type="submit" className="btn mx-auto col-md-9 submit-deal-btn mt-3">Create Deal</button>
            </form>

        </div>
    </div>
    )
}

export default CreateDeal