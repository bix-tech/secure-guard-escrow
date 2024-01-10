import { useState, useEffect, useCallback } from 'react';
import localForage from 'localforage';
import Cookies from 'js-cookie';

export const usePrincipal = () => {
    const [principal, setPrincipal] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    const fetchPrincipal = useCallback(async () => {
        const isAuthenticated = await localForage.getItem<boolean>('isAuthenticated');
        if (isAuthenticated) {
            const storedPrincipal = Cookies.get('principal');
            setPrincipal(storedPrincipal || null);
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
