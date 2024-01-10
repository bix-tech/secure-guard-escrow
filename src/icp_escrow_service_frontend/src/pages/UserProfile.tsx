import React, { useEffect, useState } from 'react'
import { backend } from '../../../declarations/backend'
import { usePrincipal } from '../hooks/usePrincipal'
import { Principal } from '@dfinity/principal'
import DatePicker from 'react-datepicker'
import { FileReference, UserProfile } from '../../../declarations/backend/backend.did'

type UploadedPictureType = {
    file: File;
    id: bigint;
    name: string;
};

const UserProfilePage = () => {
    const { principal } = usePrincipal();
    const [pictureUrls, setPictureUrls] = useState<string[]>([]);
    const [uploadedProfilePicture, setUploadedProfilePicture] = useState<UploadedPictureType>();
    const [profile, setProfile] = useState<UserProfile>();
    const [name, setName] = useState(profile ? profile.name : '');
    const [email, setEmail] = useState(profile ? profile.email : '');
    const [phone, setPhone] = useState(profile ? profile.phone : '');
    const [address, setAddress] = useState(profile ? profile.address : '');
    const [age, setAge] = useState(profile ? profile.age : (0));
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
    const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => setAge(parseInt(event.target.value));


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
                        setAge(Number(profileData.age));
                        setDob(new Date(Number(profileData.dob)));
                        await fetchPictures(profileData);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            
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
            setUploadedProfilePicture({ file, id: pictureId, name: file.name });
        }
    };


    const uploadProfilePicture = async (binaryFile: any): Promise<bigint> => {
        try {
            const id = await backend.uploadProfilePicture(binaryFile);
            console.log("Picture uploaded with ID:", id);
            return id;
        } catch (error) {
            console.error("Failed to upload picture:", error);
            throw error;
        }
    };


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
                age: BigInt(age),
                dob: dob ? BigInt(dob.getTime()) : BigInt(0)
            };
            const result = await backend.updateUserProfile(Principal.fromText(principal || ''), profileData);
            if ('ok' in result) {
                setProfile(profileData);
            }
        } catch (error) {
            console.error("Error submitting user profile:", error);
        }
    };

    return (
        <div className="profile-container">
            <form onSubmit={submitUserProfile} className="profile-form">
                <div className="form-group">
                    <label>Profile Picture:</label>
                    <input type="file" accept="image/*" onChange={handlePictureSelect} />
                    {pictureUrls.map((url) => (
                        <img key={url} src={url} alt={`Picture`} />
                    ))}
                </div>
                <div className="form-group">
                    <label>Name:</label>
                    <input type="text" placeholder="Name" value={name} onChange={handleNameChange} />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" placeholder="Email" value={email} onChange={handleEmailChange} />
                </div>
                <div className="form-group">
                    <label>Phone:</label>
                    <input type="tel" placeholder="Phone" value={phone} onChange={handlePhoneChange} />
                </div>
                <div className="form-group">
                    <label>Address:</label>
                    <input type="text" placeholder="Address" value={address} onChange={handleAddressChange} />
                </div>
                <div className="form-group">
                    <label>Age:</label>
                    <input type="number" placeholder="Age" value={Number(age)} onChange={handleAgeChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="open-date" className="form-label text-start">
                        DOB
                    </label>
                    <div className="input-group">
                        <DatePicker
                            selected={dob}
                            onChange={(date: any) => setDob(date)}
                            dateFormat="MMMM d, yyyy"
                            className="form-control"
                        />
                    </div>
                </div>
                <button type="submit" className="submit-btn">Submit</button>
            </form>
        </div>
    );
}
export default UserProfilePage