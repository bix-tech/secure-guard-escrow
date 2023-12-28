import { useState, useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import localForage from "localforage";
import { FaCopy } from 'react-icons/fa';


const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [authClient, setAuthClient] = useState<AuthClient | null>(null);
    const [principal, setPrincipal] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const formatPrincipal = (principal: string | null) => {
        if (!principal) return null;
        return `${principal?.slice(0, 5)}......${principal?.slice(-5)}`;
    };

    const handleCopy = () => {
        if (principal) {
            navigator.clipboard.writeText(principal);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const authClient = await AuthClient.create();
                setAuthClient(authClient);
            } catch (error) {
                console.error("Failed to create auth client:", error);
            }
        };
        initAuth();
    }, []);

    useEffect(() => {
        const fetchPrincipal = async () => {
            const storedPrincipal = await localForage.getItem<string | null>('principal');
            setPrincipal(storedPrincipal);
        };

        fetchPrincipal();
    }, []);

    const handleLogout = async () => {
        try {
            if (authClient) {
                await authClient.logout();
            }
            logout();

            await localForage.removeItem('principal');

            navigate('/');

            console.log("Logout successful");
        } catch (error) {
            console.error("Error in handleLogout:", error);
        }
    }


    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <a className="navbar-brand" href="login.html">Your Logo</a>

                <div className="ms-auto"></div>

                <div className="notification-avatar ms-3 d-flex align-items-center justify-content-center">
                    <img src="../../src/assets/images/notification.png" className="notification-icon" alt="Notification Avatar" />
                </div>

                <div className="vertical-divider mx-4"></div>

                <div className="d-flex align-items-center">
                    <div className="avatar me-3">
                        <img src="src/assets/images/minion.jpeg" alt="User Avatar" />
                    </div>
                    <div>
                        <p className="mb-0">
                        <FaCopy className="copy-icon" onClick={handleCopy} />
                            {formatPrincipal(principal)}
                        </p>
                        {copied && <span>Copied to clipboard</span>}
                    </div>
                    <Dropdown>
                        <Dropdown.Toggle variant="default" id="dropdown-basic">
                            {/* Add some text or an icon for the toggle */}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item href="#">Profile</Dropdown.Item>
                            <Dropdown.Item href="#">Settings</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
