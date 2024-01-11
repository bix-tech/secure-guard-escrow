import localforage from 'localforage';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';

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

    const login = async () => {
        await localforage.setItem('isAuthenticated', true);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await localforage.setItem('isAuthenticated', false);
        setIsAuthenticated(false);
    };

    useEffect(() => {
        const checkAuthentication = async () => {
            const storedAuthState = await localforage.getItem<boolean>('isAuthenticated');
            const cookie = Cookies.get('principal');
            if (storedAuthState === true && cookie) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        };

        checkAuthentication();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};
