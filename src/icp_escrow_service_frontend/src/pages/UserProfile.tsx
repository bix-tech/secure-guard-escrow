// import React, { useEffect, useState } from 'react'
// import { backend } from '../../../declarations/backend'
// import { usePrincipal } from '../hooks/usePrincipal'
// import { Principal } from '@dfinity/principal'
// import DatePicker from 'react-datepicker'

// type UploadedPictureType = {
//     data: File;
//     id: bigint;
//     name: string;
// };

// type UserProfileType = {
//     name: string;
//     email: string;
//     phone: string;
//     address: string;
//     age: bigint;
//     dob: bigint;
//     profilePicture: UploadedPictureType | null;
// }


// const UserProfile = () => {
//     const { principal } = usePrincipal();
//     const [uploadedProfilePicture, setUploadedProfilePicture] = useState<UploadedPictureType | null>(null);
//     const [profile, setProfile] = useState<UserProfileType | null>(null);
//     const [name, setName] = useState('');
//     const [email, setEmail] = useState('');
//     const [phone, setPhone] = useState('');
//     const [address, setAddress] = useState('');
//     const [age, setAge] = useState(0);
//     const [dob, setDob] = useState<Date | null>(null);

//     const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value);
//     const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value);
//     const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => setPhone(event.target.value);
//     const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => setAddress(event.target.value);
//     const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => setAge(parseInt(event.target.value));


//     useEffect(() => {
//         const fetchUserProfile = async () => {
//             if (principal) {
//                 try {
//                     const result = await backend.getUserProfile(Principal.fromText(principal.toString()));
//                     if ('ok' in result && result.ok) {
//                         const profileData = result.ok;
//                         setProfile({
//                             name : profileData.name,
//                             email : profileData.email,
//                             phone : profileData.phone,
//                             address : profileData.address,
//                             age : profileData.age,
//                             dob : profileData.dob,
//                             profilePicture: uploadedProfilePicture
//                         });
//                         setName(profileData.name);
//                         setEmail(profileData.email);
//                         setPhone(profileData.phone);
//                         setAddress(profileData.address);
//                         setAge(Number(profileData.age));
//                         setDob(new Date(Number(profileData.dob)));
//                     }
//                 } catch (error) {
//                     console.error("Error fetching user profile:", error);
//                 }
//             }
//         }
//         fetchUserProfile();
//     }, [principal, uploadedProfilePicture]);

//     const handlePictureSelect = async (event: any) => {
//         const file = event.target.files[0];
//         if (file) {
//             const binaryData = await file.arrayBuffer();
//             const pictureBinary = new Uint8Array(binaryData);
//             const pictureId = await uploadProfilePicture(pictureBinary);
//             setUploadedProfilePicture({ file, id: pictureId });
//         }
//     };

//     const uploadProfilePicture = async (binaryFile: any): Promise<bigint> => {
//         try {
//             const id = await backend.uploadProfilePicture(binaryFile);
//             console.log("Picture uploaded with ID:", id);
//             return id;
//         } catch (error) {
//             console.error("Failed to upload picture:", error);
//             throw error;
//         }
//     };


//     const submitUserProfile = async (event : any) => {
//         event.preventDefault();
//         try {
//             let profilePicture = null;
//             if (uploadedProfilePicture) {
//                 profilePicture = {
//                     id: uploadedProfilePicture.id,
//                     name: uploadedProfilePicture.file.name
//                 };
//             }
//             const profileData: UserProfileType = { 
//                 name,
//                 email,
//                 phone,
//                 address,
//                 profilePicture,
//                 age: BigInt(age),
//                 dob: dob ? BigInt(dob.getTime()) : BigInt(0)
//             };
//             const result = await backend.updateUserProfile(Principal.fromText(principal || ''), profileData);
//             if ('ok' in result) {
//                 setProfile(profileData);
//             }
//         } catch (error) {
//             console.error("Error submitting user profile:", error);
//         }
//     };

//     return (
//         <div className="profile-container">
//             <form onSubmit={submitUserProfile} className="profile-form">
//                 <div className="form-group">
//                     <label>Name:</label>
//                     <input type="text" placeholder="Name" value={name} onChange={handleNameChange} />
//                 </div>
//                 <div className="form-group">
//                     <label>Email:</label>
//                     <input type="email" placeholder="Email" value={email} onChange={handleEmailChange} />
//                 </div>
//                 <div className="form-group">
//                     <label>Phone:</label>
//                     <input type="tel" placeholder="Phone" value={phone} onChange={handlePhoneChange} />
//                 </div>
//                 <div className="form-group">
//                     <label>Address:</label>
//                     <input type="text" placeholder="Address" value={address} onChange={handleAddressChange} />
//                 </div>
//                 <div className="form-group">
//                     <label>Age:</label>
//                     <input type="number" placeholder="Age" value={age} onChange={handleAgeChange} />
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="open-date" className="form-label text-start">
//                         DOB
//                     </label>
//                     <div className="input-group">
//                         <DatePicker
//                             selected={dob}
//                             onChange={(date: any) => setDob(date)}
//                             dateFormat="MMMM d, yyyy"
//                             className="form-control"
//                         />
//                     </div>
//                 </div>
//                 <button type="submit" className="submit-btn">Submit</button>
//             </form>
//             {profile && (
//                 <div>
//                     <h3>Existing Profile</h3>
//                     <p>Name: {profile.name}</p>
//                     <p>Email: {profile.email}</p>
//                     <p>Phone: {profile.phone}</p>
//                     <p>Address: {profile.address}</p>
//                     <p>Age: {profile.age.toString()}</p>
//                     <p>DOB: {new Date(Number(profile.dob)).toLocaleDateString()}</p>
//                     {profile.profilePicture && (
//                         <img src={URL.createObjectURL(profile.profilePicture.file)} alt="Profile" />
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }
// export default UserProfile