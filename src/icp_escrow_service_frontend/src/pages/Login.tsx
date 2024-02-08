// import { useState, useEffect } from 'react';
// import { AuthClient } from "@dfinity/auth-client";
// import { HttpAgent } from "@dfinity/agent";
// import { createActor as createBackendActor } from "../../../declarations/backend";
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import localForage from "localforage";
// import { usePrincipal } from '../hooks/usePrincipal';
// import Cookies from 'js-cookie';


// const Login = () => {
//   const { principal } = usePrincipal();
//   const { login, setIsAuthenticated } = useAuth();
//   const navigate = useNavigate();
//   const [authClient, setAuthClient] = useState<AuthClient | null>(null);
//   const [daoActor, setDaoActor] = useState<ReturnType<typeof createBackendActor> | null>(null);

//   useEffect(() => {
//     const initAuth = async () => {
//       try {
//         const authClient = await AuthClient.create({
//           idleOptions: {
//             idleTimeout: 1000 * 60 * 30, // 30 minutes
//             disableDefaultIdleCallback: true
//           }
//         });
//         setAuthClient(authClient);
  
//         if (window.location.pathname === '/') {
//           if (await authClient.isAuthenticated() || principal) {
//             setIsAuthenticated(true);
//             login();
  
//             const lastVisitedRoute = await localForage.getItem<string>('lastVisitedRoute');
//             navigate(lastVisitedRoute && lastVisitedRoute !== '/' ? lastVisitedRoute : '/dashboard');
//           }
//         }
//       } catch (error) {
//         console.error("Failed to initialize authentication:", error);
//       }
//     };  

//     initAuth();
//   }, [principal, login, setIsAuthenticated, navigate]);




//   const handleLogin = async () => {
//     try {
//       // console.log("DFX_NETWORK:", process.env.DFX_NETWORK);
//       // console.log("INTERNET_IDENTITY_CANISTER_ID:", process.env.INTERNET_IDENTITY_CANISTER_ID);
//       // console.log("BACKEND_CANISTER_ID:", process.env.BACKEND_CANISTER_ID);
//       const identityProvider = process.env.DFX_NETWORK === 'playground'
//         ? 'https://identity.ic0.app'
//         : `http://127.0.0.1:4943/?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`;
//       console.log(identityProvider);

//       await authClient?.login({
//         identityProvider,
//         onSuccess: async () => {
//           console.log("Login successful");
//           const identity = authClient.getIdentity();
//           const newPrincipal = identity.getPrincipal().toString();
//           const agent = new HttpAgent({ identity });
//           const actor = createBackendActor(process.env.BACKEND_CANISTER_ID!, { agent });   
//           Cookies.set('principal', newPrincipal, { expires: 7, secure: true, sameSite: 'Strict' });
//           setDaoActor(actor);
//           console.log(principal);
//           console.log(daoActor);
//           login();
//           navigate('/dashboard');
//         },
//         onError: (error?: string | undefined) => {
//           console.error("Login error:", error);
//         }
//       });
//     } catch (error) {
//       console.error("Error in handleLogin:", error);
//     }
//   };


//   return (
//     <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
//       <div className="card login-card p-5" style={{ width: '50%' }}>
//         <div className="card-body text-center">
//           <div className="avatar mb-5 mx-auto login-avatar">
//             {/* <img src={minionLogo} alt="Logo" /> */}
//             <img src="/minion.jpeg" alt="User Avatar" />
//           </div>
//           <h5 className="card-title">ESCROW SERVICE</h5>
//           <button className="loginBtn btn btn-primary d-block mx-auto mt-5 px-4 align-items-center" onClick={handleLogin}>
//             Login / Create
//             {/* <img className="login-logo" src={loginIcon} alt="" /> */}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';
import PlugConnect from '@psychedelic/plug-connect';
import { useEffect, useState } from 'react';

const Login = () => {
  const { login, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const principalId = Cookies.get('principal');
      if (principalId) {
        setIsAuthenticated(true);
        login();
        navigate('/dashboard');
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, [login, navigate, setIsAuthenticated]);

  const handleLogin = async () => {
    try {
      if (!window.ic?.plug) {
        alert("Plug Wallet is not installed!");
        return;
      }
      
      await window.ic.plug.requestConnect();
      const principalId = await window.ic.plug.agent.getPrincipal();
      console.log("Logged in with Principal ID:", principalId.toString());

      Cookies.set('principal', principalId.toString(), { expires: 7, secure: true, sameSite: 'Strict' });
      setIsAuthenticated(true);
      login();
      navigate('/dashboard');
    } catch (error) {
      console.error("Error in handleLogin with Plug Wallet:", error);
    }
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
      <div className="card login-card p-5" style={{ width: '50%' }}>
        <div className="card-body text-center">
          <div className="mb-5 mx-auto">
            <img style={{height: '150px', width: '200px', objectFit: 'contain'}} src="/logo.png" alt="User Avatar" />
          </div>
          {/* <h5 className="card-title">ESCROW SERVICE</h5> */}
          <PlugConnect
              whitelist={['be2us-64aaa-aaaaa-qaabq-cai','bd3sg-teaaa-aaaaa-qaaba-cai','ryjl3-tyaaa-aaaaa-aaaba-cai','cojoz-raaaa-aaaao-a3b7q-cai','cjiin-4yaaa-aaaao-a3b7a-cai']}
              onConnectCallback={handleLogin}
                        >
          </PlugConnect>
        </div>
      </div>
    </div>
  );
};

export default Login;
