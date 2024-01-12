import React, { useEffect, useState } from 'react'
import { backend } from '../../../declarations/backend'
import { usePrincipal } from '../hooks/usePrincipal'
import { Principal } from '@dfinity/principal'
import DatePicker from 'react-datepicker'
import { FileReference, UserProfile } from '../../../declarations/backend/backend.did'
import "react-datepicker/dist/react-datepicker.css";

type UploadedPictureType = {
    file: File;
    id: bigint;
    name: string;
};

interface SidebarProps {
    isSidebarActive: boolean;
};

const UserProfilePage : React.FC<SidebarProps> = ( {isSidebarActive} ) => {
    const { principal } = usePrincipal();
    const [isLoading, setIsLoading] = useState(true);
    const [pictureUrls, setPictureUrls] = useState<string[]>([]);
    const [uploadedProfilePicture, setUploadedProfilePicture] = useState<UploadedPictureType>();
    const [profile, setProfile] = useState<UserProfile>();
    const [name, setName] = useState(profile ? profile.name : '');
    const [email, setEmail] = useState(profile ? profile.email : '');
    const [phone, setPhone] = useState(profile ? profile.phone : '');
    const [address, setAddress] = useState(profile ? profile.address : '');
    const [age, setAge] = useState(profile ? profile.age : null);
    const [dob, setDob] = useState(profile ? new Date(Number(profile.dob)) : null);

    const defaultPicture: UploadedPictureType = {
        id: BigInt(0),
        file: new File([], ''),
        name: 'default',
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value);
    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value);
    const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => setPhone(event.target.value);
    const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => setAddress(event.target.value);

    const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setAge(value ? BigInt(value) : null);
    };

    const fetchPictures = async (deal: UserProfile) => {
        const pictureRef = deal.profilePicture;
        try {
            const blob = await backend.getProfilePicture(pictureRef, Principal.fromText(principal || ''));
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
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (principal) {
                try {
                    const result = await backend.getUserProfile(Principal.fromText(principal.toString()));
                    if ('ok' in result && result.ok) {
                        const profileData = result.ok;
                        setProfile({
                            name: profileData.name,
                            email: profileData.email,
                            phone: profileData.phone,
                            address: profileData.address,
                            age: profileData.age,
                            dob: profileData.dob,
                            profilePicture: profileData.profilePicture
                        });
                        setName(profileData.name);
                        setEmail(profileData.email);
                        setPhone(profileData.phone);
                        setAddress(profileData.address);
                        setAge(BigInt(profileData.age));
                        setDob(new Date(Number(profileData.dob)));
                        await fetchPictures(profileData);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
                setIsLoading(false);
            }
        }
        fetchUserProfile();
    }, [principal, uploadedProfilePicture]);

    const handlePictureSelect = async (event: any) => {
        const file = event.target.files[0];
        if (file) {
            const binaryData = await file.arrayBuffer();
            const pictureBinary = new Uint8Array(binaryData);
            const pictureId = await uploadProfilePicture(pictureBinary);
            const urls = URL.createObjectURL(file);
            setPictureUrls([urls]);
            setUploadedProfilePicture({ file, id: pictureId, name: file.name });
        }
    };


    const uploadProfilePicture = async (binaryFile: any): Promise<bigint> => {
        try {
            setIsLoading(true);
            const id = await backend.uploadProfilePicture(binaryFile);
            console.log("Picture uploaded with ID:", id);
            setIsLoading(false);
            return id;
        } catch (error) {
            console.error("Failed to upload picture:", error);
            throw error;
        }
    };

    const triggerProfilePictureInput = () => {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.click();
            console.log("Clicked file input")
        }
    }


    const submitUserProfile = async (event: any) => {
        event.preventDefault();
        try {
            let profilePicture: FileReference | null = null;
            if (uploadedProfilePicture) {
                profilePicture = {
                    id: uploadedProfilePicture.id,
                    name: uploadedProfilePicture.file.name
                };
            }
            const profileData = {
                name: name,
                email: email,
                phone: phone,
                address: address,
                profilePicture: profilePicture || defaultPicture,
                age: BigInt(age || 0),
                dob: dob ? BigInt(dob.getTime()) : BigInt(0)
            };
            setIsLoading(true);
            const result = await backend.updateUserProfile(Principal.fromText(principal || ''), profileData);
            if ('ok' in result) {
                setProfile(profileData);
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error submitting user profile:", error);
        }
    };

    return (
        isLoading ? (
            <div className="container-fluid mt-1 d-flex flex-column">
                <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                    <div className="spinner-grow text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        ) : (
            <div className="container-fluid d-flex flex-column p-5">
                <div className={`profile-container card mt-2 p-5 ${isSidebarActive ? 'not-full-width' : 'full-width'}`}>
                    <form onSubmit={submitUserProfile} className="profile-form d-flex flex-column align-items-center">
                        <div className="form-group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePictureSelect}
                                style={{ display: 'none' }}
                                id="fileInput"
                            />
                            {pictureUrls.length > 0 ? (
                                pictureUrls.map((url) => (
                                    <img
                                        key={url}
                                        src={url}
                                        alt={`Picture`}
                                        style={{ width: '100px', height: '100px', borderRadius: '100px' }}
                                        onClick={() => { triggerProfilePictureInput() }}
                                    />
                                ))
                            ) : (
                                <img
                                    src="https://www.w3schools.com/howto/img_avatar.png"
                                    alt="Avatar"
                                    className="avatar"
                                    style={{ width: '100px', height: '100px', borderRadius: '100px' }}
                                    onClick={() => { triggerProfilePictureInput() }}
                                />
                            )}
                        </div>
                        <div className="mt-5 mb-3">
                            <div className="form-row col-md-9 text-start mx-auto">
                                <label>Name</label>
                                <input type="text" placeholder="Name" value={name} onChange={handleNameChange} className="form-control" />
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="form-row col-md-9 text-start mx-auto">
                                <label>Email:</label>
                                <input type="email" placeholder="Email" value={email} onChange={handleEmailChange} className="form-control" />
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="form-row col-md-9 text-start mx-auto">
                                <label>Phone:</label>
                                <input type="tel" placeholder="Phone" value={phone} onChange={handlePhoneChange} className="form-control" />
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="form-row col-md-9 text-start mx-auto">
                                <label>Address:</label>
                                <input type="text" placeholder="Address" value={address} onChange={handleAddressChange} className="form-control" />
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="form-row col-md-9 text-start mx-auto">
                                <label>Age:</label>
                                <input type="number" placeholder="Age" value={age ? age.toString() : ''} onChange={handleAgeChange} className="form-control" />
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="form-row col-md-9 text-start mx-auto">
                                <label htmlFor="open-date" className="form-label text-start">
                                    DOB
                                </label>
                                <div className="input-group date-picker-group">
                                    <DatePicker
                                        selected={dob}
                                        onChange={(date) => setDob(date)}
                                        dateFormat="MMMM d, yyyy"
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                        className="form-control custom-date-picker"
                                        yearDropdownItemNumber={5}
                                        placeholderText="Select a date"
                                        isClearable={true}
                                    />
                                    <span className="input-group-addon">
                                        <i className="fa fa-calendar" aria-hidden="true"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-confirm">Submit</button>
                    </form>
                </div>
            </div>
        )
    );
}
export default UserProfilePage