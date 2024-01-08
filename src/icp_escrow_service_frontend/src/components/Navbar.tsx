import { useState, useEffect, useRef } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import localForage from "localforage";
import { FaCopy } from 'react-icons/fa';
import { Principal } from '@dfinity/principal';
import { backend } from "../../../declarations/backend";
import { usePrincipal } from '../hooks/usePrincipal';

type Notification = {
    dealId: bigint;
    message: string;
};

const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { principal } = usePrincipal();
    const [authClient, setAuthClient] = useState<AuthClient | null>(null);
    const [copied, setCopied] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotification, setShowNotification] = useState(false);
    const notificationRef = useRef(null);


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

    const fetchNotifications = async () => {
        if (principal) {
            const fetchedNotifications = await backend.getNotification(Principal.fromText(principal));
            setNotifications(fetchedNotifications);
        }
    }

    const toggleNotification = () => {
        setShowNotification(!showNotification);
        if (!showNotification) {
            fetchNotifications();
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


    const handleNotificationClick = (dealId: bigint) => {
        navigate(`/deal-overview/${dealId}`);
    };

    const handleHomeClick = () => {
        navigate('/dashboard');
    }

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
                <div className="navbar-brand" onClick={handleHomeClick}>ICP Escrow Service</div>

                <div className="ms-auto"></div>

                <Dropdown show={showNotification} onToggle={toggleNotification} ref={notificationRef}>
                    <Dropdown.Toggle as="div" id="dropdown-notification" className="notification-avatar ms-3 d-flex align-items-center justify-content-center">
                        <img src="/notification.png" className="notification-icon" alt="Notification Avatar" />
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="notification-list p-0">
                        {notifications.length === 0 ? (
                            <Dropdown.Item>No notifications</Dropdown.Item>
                        ) : (
                            notifications.map(notification => (
                                <Dropdown.Item key={notification.dealId.toString()} className="notification-item py-2 border-bottom" onClick={() => handleNotificationClick(notification.dealId)}>
                                    {notification.message}
                                </Dropdown.Item>
                            ))
                        )
                        
                        }
                        <Dropdown.Item className='clear-notification-btn py-2 rounded-bottom'>Clear Message</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <div className="vertical-divider mx-4"></div>

                <div className="d-flex align-items-center">
                    <div className="avatar me-3">
                        <img src="/minion.jpeg" alt="User Avatar" />
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
