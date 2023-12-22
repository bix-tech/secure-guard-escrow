import { useState, useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { createActor as createBackendActor } from "../../../declarations/backend";
// import minionLogo from './assets/minion.jpeg'; 
// import loginIcon from './assets/login_icon.png'; 
// import './Login.css'; 
import { createActor } from "../../../declarations/backend";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [authClient, setAuthClient] = useState<AuthClient | null>(null);
    const [principal, setPrincipal] = useState<string | null>(null);
    const [daoActor, setDaoActor] = useState<ReturnType<typeof createActor> | null>(null);

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

    const handleLogin = async () => {
        try {
            const identityProvider = process.env.DFX_NETWORK === 'ic'
                ? 'https://identity.ic0.app'
                : `http://127.0.0.1:4943/?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`;
                console.log(identityProvider);

            await authClient?.login({
                identityProvider,
                onSuccess: async () => {
                    console.log("Login successful");
                    const identity = authClient.getIdentity();
                    setPrincipal(identity.getPrincipal().toString());
                    const agent = new HttpAgent({ identity });
                    const actor = createBackendActor(process.env.BACKEND_CANISTER_ID!, { agent });
                    setDaoActor(actor);
                    console.log(daoActor);
                    login();
                    navigate('/dealProgress_3');
                },
                onError: (error?: string | undefined) => {
                    console.error("Login error:", error);
                }
            });
        } catch (error) {
            console.error("Error in handleLogin:", error);
        }
    };


    return (
        <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
      <div className="card p-5" style={{ width: '50%' }}>
        <div className="card-body text-center">
          <div className="avatar mb-5 mx-auto login-avatar">
            {/* <img src={minionLogo} alt="Logo" /> */}
            <img src="src/assets/images/minion.jpeg" alt="User Avatar" />
          </div>
          <h5 className="card-title">ESCROW SERVICE</h5>
          <button className="loginBtn btn btn-primary d-block mx-auto mt-5 px-4 align-items-center" onClick={handleLogin}>
            Login / Create
            {/* <img className="login-logo" src={loginIcon} alt="" /> */}
          </button>
          {principal && <p className="text-center mt-5">Hi {principal}</p>}
        </div>
      </div>
    </div>
    );
};

export default Login;
