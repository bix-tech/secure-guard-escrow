import localforage from 'localforage';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    setIsAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = () => setIsAuthenticated(true);
    const logout = () => setIsAuthenticated(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            const storedPrincipal = await localforage.getItem<string | null>('principal');
            const isUserAuthenticated = !!storedPrincipal;
            setIsAuthenticated(isUserAuthenticated);
        };

        checkAuthentication();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};
