import { useState,useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { useNavigate } from 'react-router';
import '../App.css';


const Navbar = () => {
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
                <img src="assets/images/notification.png" className="notification-icon" alt="Notification Avatar"/>
            </div>

            <div className="vertical-divider mx-4"></div>

            <div className="d-flex align-items-center">
                <div className="avatar me-3">
                    <img src="assets/images/minion.jpeg" alt="User Avatar"/>
                </div>
                <div>
                    <p className="mb-0">John Doe</p>
                    <small>johndoe@example.com</small>
                    <button id ="logout" className="dropdown-item" onClick={handleLogout}>Logout</button>
                </div>

                <div className="dropdown">
                    <button className="btn btn-default dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    </button>
                    <div className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <a className="dropdown-item" href="#">Profile</a>
                        <a className="dropdown-item" href="#">Settings</a>
                        <div className="dropdown-divider"></div>
                    </div>
                </div>
            </div>
        </div>
    </nav>
  );
};

export default Navbar;
