import React, { useRef, useState, useContext, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CreateDealProgressBar from '../../components/CreateDealProgressBar';
import { backend } from '../../../../declarations/backend';
import { DealCategory, useDealData } from '../../contexts/DealContext';
import { Principal } from '@dfinity/principal';
import { usePrincipal } from '../../hooks/usePrincipal';
import { DealFlowContext } from '../../contexts/InitiateDealFlowContext';
import '../../App.css';
import { useNavigate } from 'react-router-dom';
import TiptapEditor from '../../components/TiptapEditor';
import { useForm } from 'react-hook-form';
import { FileReference } from '../../../../declarations/backend/backend.did';

type CreateDealProps = {
    onNext: () => void;
    isSidebarActive: boolean;
};

type UploadedPictureType = {
    file: File;
    id: bigint;
    name: string;
};


type DocumentFile = {
    id: string;
    name: string;
};

type PaymentSchedule = {
    packageName: string;
    packageDescription: string;
};

type PaymentSchedules = PaymentSchedule[];

type FormData = {
    dealCategory: DealCategory;
};


const CreateDealStep2: React.FC<CreateDealProps> = ({ onNext, isSidebarActive }) => {
    const context = useContext(DealFlowContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    // const [selectedCategory, setSelectedCategory] = useState<DealCategory>(DealCategory.NFT);
    const [recipientPrincipal, setRecipientPrincipal] = useState<string>('');
    const { principal } = usePrincipal();
    const { dealData, setDealData } = useDealData();
    const [amount, setAmount] = useState<string>('0');
    const pictureInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);
    const [dealStart, setOpenDate] = useState<Date | null>(null);
    const [dealEnd, setCloseDate] = useState<Date | null>(null);
    const [uploadedPicture, setUploadedPicture] = useState<UploadedPictureType | null>(null);
    const [editorContent, setEditorContent] = useState('');
    const [uploadedDocuments, setUploadedDocuments] = useState<DocumentFile[]>([]);
    const [selectedDealCategory, setSelectedDealCategory] = useState<DealCategory>(DealCategory.NFT);
    const { register, setValue } = useForm<FormData>();

    useEffect(() => {
        if (!context || !context.stepCompleted.step1) {
            navigate('/createDealStep1');
        }
        console.log(selectedDealCategory);
    }, [context, navigate, selectedDealCategory]);

    register('dealCategory');

    const defaultPicture: UploadedPictureType = {
        id: BigInt(0),
        file: new File([], ''),
        name: 'default',
    };

    const selectDealCategory = (dealCategory: DealCategory) => {
        setSelectedDealCategory(dealCategory);
        setValue('dealCategory', dealCategory);
    };

    // const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    //     setSelectedCategory(event.target.value as DealCategory);
    // };

    const [paymentSchedules, setPaymentSchedules] = useState<PaymentSchedules>([
        { packageName: "", packageDescription: "" }
    ]);

    const addSchedule = () => {
        const newSchedule = { packageName: "", packageDescription: "" };
        setPaymentSchedules([...paymentSchedules, newSchedule]);
    };

    const removeSchedule = (index: number) => {
        if (paymentSchedules.length > 1) {
            const filteredSchedules = paymentSchedules.filter((_, i) => i !== index);
            setPaymentSchedules(filteredSchedules);
        }
    };

    const handleScheduleChange = (event: React.ChangeEvent<HTMLInputElement>, index: number, field: keyof PaymentSchedule) => {
        const newSchedules = [...paymentSchedules];
        newSchedules[index][field] = event.target.value as never;
        setPaymentSchedules(newSchedules);
    };
    

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const formattedDealStart = dealStart ? dealStart.getTime() : null;
            const formattedDealEnd = dealEnd ? dealEnd.getTime() : null;
            const supportingDocuments = uploadedDocuments.map((file, index) => ({
                id: BigInt(index),
                name: file.name,
            }));
            let picture: FileReference | null = null;
            if (uploadedPicture) {
                picture = {
                    id: uploadedPicture.id,
                    name: uploadedPicture.file.name
                };
            }

            let to, from;
            if (dealData.dealType === "Buyer") {
                to = Principal.fromText(principal || '');
                from = Principal.fromText(recipientPrincipal);
            } else {
                from = Principal.fromText(principal || '');
                to = Principal.fromText(recipientPrincipal);
            }

            const deal = {
                id: BigInt(0),
                name: dealData.dealName,
                label: label,
                dealType: dealData.dealType === "Buyer" ? { "Buyer": null } : { "Seller": null },
                description: editorContent,
                status: "Pending",
                dealCategory: getDealCategory(selectedDealCategory),
                dealTimeline: [{
                    dealStart: dealStart ? BigInt(dealStart.getTime()) : BigInt(0),
                    dealEnd: dealEnd ? BigInt(dealEnd.getTime()) : BigInt(0)
                }],
                deliverables: [],
                to: to,
                picture: picture || defaultPicture,
                supportingDocuments: supportingDocuments,
                paymentScheduleInfo: paymentSchedules.map(schedule => ({
                    ...schedule,
                    packageName: schedule.packageName,
                    description: schedule.packageDescription,
                })),
                from: from,
                amount: { e8s: BigInt(Math.round(parseFloat(amount) * 1e8)) },
                createTime: BigInt(Date.now()),
                submissionTime: [BigInt(0)] as [bigint],
                sellerCancelRequest: false,
                buyerCancelRequest: false,
            };

            console.log(formattedDealEnd);
            console.log(formattedDealStart);
            setIsLoading(true);

            const response = await backend.createDeal(deal, Principal.fromText(principal || ''));

            console.log(response);


            if ('ok' in response) {
                setIsLoading(false);
                const newDealId = response.ok.CreateDealOk.id;
                setDealData(prevState => ({ ...prevState, id: newDealId }));
                if (context) {
                    context.completeStep('step2');
                }
                onNext();
            } else {
                console.error('Failed to create deal');
            }
        } catch (error) {
            console.error('Failed to create deal', error);
        }
    };

    const triggerPictureInput = () => {
        if (pictureInputRef.current) {
            pictureInputRef.current.click();
        }
    };

    const triggerDocumentInput = () => {
        if (documentInputRef.current) {
            documentInputRef.current.click();
        }
    };

    const handlePictureSelect = async (event: any) => {
        const file = event.target.files[0];
        if (file) {
            const binaryData = await file.arrayBuffer();
            const pictureBinary = new Uint8Array(binaryData);
            const pictureId = await uploadPicture(pictureBinary);
            setUploadedPicture({ file, id: pictureId, name: file.name });
            if (pictureInputRef.current) {
                displayPictureBadge(file);
            } else {
                console.error("Picture input ref is null");
            }
        }
    };


    const handleDocumentSelect = async (event: any) => {
        const files = event.target.files;
        console.log("Files:", files);
        if (files.length > 0) {
            for (const file of files) {
                const binaryData = await file.arrayBuffer();
                const documentBinary = new Uint8Array(binaryData);
                await uploadSupportingDocument(documentBinary);
                setUploadedDocuments([...uploadedDocuments, file]);
                displayDocumentBadge(files[0]);
            }
        }
    };

    const uploadPicture = async (binaryFile: any): Promise<bigint> => {
        try {
            const id = await backend.uploadPicture(binaryFile);
            console.log("Picture uploaded with ID:", id);
            return id;
        } catch (error) {
            console.error("Failed to upload picture:", error);
            throw error;
        }
    };


    const uploadSupportingDocument = async (binaryFile: any) => {
        try {
            const response = await backend.uploadSupportingDocument(binaryFile);
            console.log("Document uploaded:", response);
            return response;
        } catch (error) {
            console.error("Failed to upload document:", error);
        }
    };


    const displayPictureBadge = (file: File) => {
        const badgeContainer = document.getElementById('fileDropArea');
        if (badgeContainer) {
            const oldBadge = badgeContainer.querySelector('.file-badge');
            if (oldBadge) {
                badgeContainer.removeChild(oldBadge);
            }
            const badge = document.createElement('span');
            badge.className = 'file-badge';
            badge.textContent = file.name;
            badgeContainer.appendChild(badge);
        }
    };

    const displayDocumentBadge = (file: File) => {
        const badgeContainer = document.getElementById('fileDropArea2');
        if (badgeContainer) {
            const badge = document.createElement('span');
            badge.className = 'file-badge';
            badge.textContent = file.name;
            badgeContainer.appendChild(badge);
        }
    };

    const handleEditorContentChange = (content: string) => {
        setEditorContent(content);
    };

    const getDealCategory = (dealCategory: DealCategory) => {
        switch (dealCategory) {
            case DealCategory.NFT:
                return { "NFT": null };
            case DealCategory.DomainName:
                return { "DomainName": null };
            case DealCategory.Services:
                return { "Services": null };
            case DealCategory.PhysicalProducts:
                return { "PhysicalProducts": null };
            case DealCategory.DigitalProducts:
                return { "DigitalProducts": null };
            case DealCategory.Tokens:
                return { "Tokens": null };
            default:
                return { "NFT": null };
        }
    };


    const label = dealData.dealType === "Buyer" ? "From" : "To";

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
            <div className="container-fluid d-flex flex-column justify-content-center align-items-center p-3 pb-5">
                <div className={`card create-deal-step-2-card p-5 margin-5 mobile-card mobile-font-size-8px ${isSidebarActive ? 'not-full-width' : 'full-width'}`} >
                    <div className="card-body text-center">
                        <CreateDealProgressBar currentStep={2} />
                        <form className="mt-5" onSubmit={onSubmit}>
                            <div className="mb-3">
                                <div className="form-row col-md-9 text-start mx-auto">
                                    <label htmlFor="projectName" className="form-label text-start">Upload Pictures</label>
                                    <br />
                                    <label htmlFor="projectName" className="form-label text-start">Recommended size 1500 x 600 (px)</label>
                                    <br />

                                    <div className="file-drop-area" id="fileDropArea" onClick={triggerPictureInput}>
                                        <p>Click here or drag and drop files to upload</p>
                                        <p>Max File Size: 50 MB</p>
                                        <input type="file" id="pictureInput" style={{ display: 'none' }} onChange={handlePictureSelect} ref={pictureInputRef} />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="form-row col-md-9 text-start mx-auto">
                                    <label htmlFor="deal-description" className="form-label text-start">Deal Description</label>
                                    <TiptapEditor onContentChange={handleEditorContentChange} className="form-control rich-editor" />
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className='form-row col-md-9 text-start mx-auto'>
                                    <label htmlFor="deal-category" className='form-label text-start'>Deal Category</label>
                                    <div className="btn-group d-flex flex-wrap">
                                        <input type="hidden" {...register("dealCategory")} value={selectedDealCategory} />
                                        <span className={`badge-option ${selectedDealCategory === DealCategory.NFT ? 'selected' : ''}`} onClick={() => selectDealCategory(DealCategory.NFT)}>NFT</span>
                                        <span className={`badge-option ${selectedDealCategory === DealCategory.DomainName ? 'selected' : ''}`} onClick={() => selectDealCategory(DealCategory.DomainName)}>Domain Name</span>
                                        <span className={`badge-option ${selectedDealCategory === DealCategory.Services ? 'selected' : ''}`} onClick={() => selectDealCategory(DealCategory.Services)}>Services</span>
                                        <span className={`badge-option ${selectedDealCategory === DealCategory.PhysicalProducts ? 'selected' : ''}`} onClick={() => selectDealCategory(DealCategory.PhysicalProducts)}>Physical Products</span>
                                        <span className={`badge-option ${selectedDealCategory === DealCategory.DigitalProducts ? 'selected' : ''}`} onClick={() => selectDealCategory(DealCategory.DigitalProducts)}>Digital Products</span>
                                        <span className={`badge-option ${selectedDealCategory === DealCategory.Tokens ? 'selected' : ''}`} onClick={() => selectDealCategory(DealCategory.Tokens)}>Tokens</span>
                                    </div>
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
                                                    selected={dealStart}
                                                    onChange={(date: any) => setOpenDate(date)}
                                                    dateFormat="MMMM d, yyyy"
                                                    className="form-control mobile-font-size-8px"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="close-date" className="form-label text-start">
                                                Close Date
                                            </label>
                                            <div className="input-group ">
                                                <DatePicker
                                                    selected={dealEnd}
                                                    onChange={(date: any) => setCloseDate(date)}
                                                    dateFormat="MMMM d, yyyy h:mm aa"
                                                    className="form-control mobile-font-size-8px"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="form-row col-md-9 text-start mx-auto">
                                    <label htmlFor="projectName" className="form-label text-start">Supporting Documents</label>
                                    <br />

                                    <div className="file-drop-area-2" id="fileDropArea2" onClick={triggerDocumentInput}>
                                        <p>Click here or drag and drop files to upload</p>
                                        <input type="file" id="documentInput" multiple style={{ display: 'none' }} onChange={handleDocumentSelect} ref={documentInputRef} />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="form-row col-md-9 text-start mx-auto">
                                    <label htmlFor="recipientPrincipal" className="form-label text-start mt-3">{label}</label>
                                    <input type="text" placeholder="Enter recipient Principal ID" value={recipientPrincipal} onChange={(e) => setRecipientPrincipal(e.target.value)} className="form-control" id="recipientPrincipal" />
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="form-row col-md-9 text-start mx-auto">
                                    <label htmlFor="projectName" className="form-label text-start">Payment Schedule Information</label>
                                    <br />
                                    <div className="border rounded py-3 px-3">
                                        <label htmlFor="projectName" className="h6 form-label text-start">Payment Schedule 1</label>
                                        <br />
                                        {paymentSchedules.map((schedule, index) => (
                                            <div key={index} className="border rounded py-3 px-3 mb-3">
                                                <div className="form-group">
                                                    {/* Package Name */}
                                                    <label htmlFor={`packageName-${index}`} className="form-label text-start mt-3">Package Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control mobile-font-size-8px"
                                                        id="packageName"
                                                        placeholder="Package Name"
                                                        value={schedule.packageName}
                                                        onChange={e => handleScheduleChange(e, index, 'packageName')}
                                                    />

                                                    {/* Description */}
                                                    <label htmlFor={`description-${index}`} className="form-label text-start mt-3">Description</label>
                                                    <input
                                                        type="text"
                                                        className="form-control mobile-font-size-8px"
                                                        id="description"
                                                        placeholder="Description"
                                                        value={schedule.packageDescription}
                                                        onChange={e => handleScheduleChange(e, index, 'packageDescription')}
                                                    />

                                                    {/* Total Token */}
                                                    <label htmlFor={`amount-${index}`} className="form-label text-start mt-3">Total Token</label>
<input
    type="text"
    className="form-control"
    id="amount"
    placeholder="Total Token"
    value={amount}
    onChange={(e) => {
        const value = e.target.value;
        if (!isNaN(Number(value)) || value === '') {
            setAmount(value);
        }
    }}
/>
                                                    {/* Remove Button */}
                                                    <button type="button" className="btn col-md-12 remove-payment-btn mt-4 mobile-font-size-8px" onClick={() => removeSchedule(index)}>Remove Payment Schedule</button>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Button to add more schedules */}
                                        <button type="button" className="btn add-payment-btn mt-4 mobile-font-size-8px" onClick={addSchedule}>Add More Schedules</button>
                                    </div>
                                </div>
                            </div>


                            <button type="submit" className="btn mx-auto col-md-9 submit-deal-btn mt-3">Create Deal</button>
                        </form>

                    </div>
                </div>
            </div>
        )
    )
}

export default CreateDealStep2