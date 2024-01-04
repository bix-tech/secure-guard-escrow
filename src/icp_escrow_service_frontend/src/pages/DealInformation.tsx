import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import '@tinymce/tinymce-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DealInformation = () => {

    const [editorContent, setEditorContent] = React.useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [openDate, setOpenDate] = React.useState(null);
    const [closeDate, setCloseDate] = React.useState(null);

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

        const badgeContainer2 = document.getElementById('fileDropArea2');
        if (badgeContainer2) {
            const badge = document.createElement('span');
            badge.className = 'file-badge';
            badge.textContent = file.name;
            badgeContainer2.appendChild(badge);
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

                <div className="mb-3">
                    <div className='form-row col-md-9 text-start mx-auto'>
                            <label htmlFor="deal-category" className='form-label text-start'>Deal Category</label>
                            <br/>
                            <span className='badge badge-green'>Services</span>
                            <br/>
                            <span className='badge badge-grey mt-3 me-2'>Physical Product</span>
                            <span className='badge badge-grey me-2'>Digital Products</span>
                            <span className='badge badge-grey me-2'>Domain Name</span>
                            <span className='badge badge-grey me-2'>NFT</span>
                            <span className='badge badge-grey me-2'>Tokens</span>

                    </div>
                </div>

                    <div className="mb-3">
                        <div className="form-row col-md-9 text-start mx-auto">
                            <label htmlFor="deal-timeline" className="form-label text-start">
                                Deal Timeline
                            </label>
                            <div className="row">
                                <div className="col-md-6">
                                    <label htmlFor="open-date" className="form-label text-start">
                                        Set Live Date
                                    </label>
                                    <div className="input-group">
                                        <DatePicker
                                            selected={openDate}
                                            onChange={(date : any) => setOpenDate(date)}
                                            dateFormat="MMMM d, yyyy"
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="close-date" className="form-label text-start">
                                        Close Date
                                    </label>
                                    <div className="input-group">
                                        <DatePicker
                                            selected={closeDate}
                                            onChange={(date : any) => setCloseDate(date)}
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="form-row col-md-9 text-start mx-auto">
                            <label htmlFor="projectName" className="form-label text-start">Supporting Documents</label>
                            <br/>

                            <div className="file-drop-area-2" id="fileDropArea2" onClick={triggerFileInput}>
                                <p>Click here or drag and drop files to upload</p>
                            <input type="file" id="fileInput" multiple style={{ display: 'none' }} onChange={handleFileSelect} ref={fileInputRef}/>
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="form-row col-md-9 text-start mx-auto">
                            <label htmlFor="projectName" className="form-label text-start">Payment Schedule Information</label>
                            <br/>
                            <div className="border rounded py-3 px-3">
                                <label htmlFor="projectName" className="h6 form-label text-start">Payment Schedule 1</label>
                                <br />
                                <label htmlFor="projectName" className="form-label text-start mt-3">Package Name</label>
                                <input type="text" className="form-control deal-name-text" placeholder="Deposit"/>

                                <label htmlFor="projectName" className="form-label text-start mt-3">Description</label>
                                <input type="text" className="form-control deal-name-text" placeholder="150"/>

                                <label htmlFor="projectName" className="form-label text-start mt-3">Total Token</label>
                                <input type="text" className="form-control deal-name-text" placeholder="1000"/>

                                <button type="button" className="btn mx-auto col-md-12 remove-payment-btn mt-4">Remove Payment Schedule</button>
                            </div>
                        </div>
                    </div>
                
                
                <button type="submit" className="btn mx-auto col-md-9 submit-deal-btn mt-3">Create Deal</button>
            </form>

        </div>
    </div>
    )
}

export default DealInformation