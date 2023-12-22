import { useState, useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [authClient, setAuthClient] = useState<AuthClient | null>(null);

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

    const handleLogout = async () => {
        try {
            await authClient?.logout();
            console.log("Logout successful");
            logout();
            navigate('/');
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
                    <img src="src/assets/images/notification.png" className="notification-icon" alt="Notification Avatar" />
                </div>

                <div className="vertical-divider mx-4"></div>

                <div className="d-flex align-items-center">
                    <div className="avatar me-3">
                        <img src="src/assets/images/minion.jpeg" alt="User Avatar" />
                    </div>
                    <div>
                        <p className="mb-0">John Doe</p>
                        <small>johndoe@example.com</small>
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
