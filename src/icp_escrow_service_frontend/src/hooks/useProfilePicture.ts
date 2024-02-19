import { useState, useCallback } from "react";
import { usePrincipal } from "./usePrincipal";
import { backend } from "../../../declarations/backend";
import { UserProfile } from "../../../declarations/backend/backend.did";
import { Principal } from "@dfinity/principal";

export const useProfilePicture = () => {
    const [profilePictureUrl, setProfilePictureUrl] = useState<string[]>([]);
    const { principal } = usePrincipal(); 

    const fetchProfilePicture = useCallback(async (user : UserProfile) => {
        try {
            if (principal) {
                const profileRef = user.profilePicture;
                const blob = await backend.getProfilePicture(profileRef, Principal.fromText(principal || ''));
                if (blob){
                    const array = Array.isArray(blob[0]) ? new Uint8Array(blob[0]) : blob[0];
                    if (array){
                        const blobObject = new Blob([array]);
                        const url = URL.createObjectURL(blobObject);
                        setProfilePictureUrl([url]);
                        
                    }
                }
            }
        } catch (error) {
            console.log(error);
        } 
    }, [principal]);

    return { profilePictureUrl, fetchProfilePicture };
};