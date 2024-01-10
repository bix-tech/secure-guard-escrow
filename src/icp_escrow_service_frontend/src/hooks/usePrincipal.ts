import { useState, useEffect, useCallback } from 'react';
import localForage from 'localforage';

export const usePrincipal = () => {
    const [principal, setPrincipal] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    const fetchPrincipal = useCallback(async () => {
        const isAuthenticated = await localForage.getItem<string>('isAuthenticated');
        if (isAuthenticated) {
            const storedPrincipal = await localForage.getItem<string | null>('principal');
            console.log("Fetched Principal: ", storedPrincipal);
            setPrincipal(storedPrincipal);
        } else {
            setPrincipal(null);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchPrincipal();
    }, [fetchPrincipal]);

    return { principal, isLoading };
};
