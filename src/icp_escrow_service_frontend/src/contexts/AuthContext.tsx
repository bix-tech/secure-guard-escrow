import localforage from 'localforage';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

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

    const verifyConnection = async () => {
        const connected = await window.ic.plug.isConnected();
        if (!connected) await window.ic.plug.requestConnect({ whitelist, host });
    };


    const whitelist = ['ryjl3-tyaaa-aaaaa-aaaba-cai', 'rdmx6-jaaaa-aaaaa-aaadq-cai']; // replace with your canister IDs
    const host = 'https://ic0.app';
    const navigate = useNavigate();
    useEffect(() => {
        const checkAuthentication = async () => {
            const storedAuthState = await localforage.getItem<boolean>('isAuthenticated');
            const cookie = Cookies.get('principal');
            if (storedAuthState === true && cookie) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                navigate('/');
            }
        };

        checkAuthentication();
        verifyConnection();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};