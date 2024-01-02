// usePrincipal.ts
import { useState, useEffect, useCallback } from 'react';
import localForage from 'localforage';

export const usePrincipal = () => {
    const [principal, setPrincipal] = useState<string | null>(null);

    const fetchPrincipal = useCallback(async () => {
        const storedPrincipal = await localForage.getItem<string | null>('principal');
        console.log("Fetched Principal: ", storedPrincipal);
        setPrincipal(storedPrincipal);
    }, []);

    useEffect(() => {
        fetchPrincipal();
    }, [fetchPrincipal]);

    return principal;
};
