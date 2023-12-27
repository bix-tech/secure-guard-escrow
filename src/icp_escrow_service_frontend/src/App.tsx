import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from '../src/pages/Login';
import Dashboard from './pages/Dashboard';
import DealProgress_1 from './pages/DealProgress_1';
import DealProgress_2 from './pages/DealProgress_2';
import DealProgress_3 from './pages/DealProgress_3';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import DealOverview from './pages/DealOverview';
import localforage from 'localforage';

const NavbarWrapper = () => {
  const location = useLocation();

  useEffect(()=> {
    localforage.setItem('lastVisitedRoute', location.pathname);
  }, [location]);
  
  if (location.pathname === "/") {
    return null;
  }

  return <Navbar />;
};

const DealProgress1 = ({ onNext }: { onNext: string }) => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate(onNext);
  };

  return <DealProgress_1 onNext={handleNext} />;
};

const DealProgress2 = ({ onNext }: { onNext: string }) => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate(onNext);
  };

  return <DealProgress_2 onNext={handleNext} />;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const auth = useAuth();
  const isAuthenticated = auth ? auth.isAuthenticated : false;

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(false);  
    };
  
    checkAuthentication();
  }, []);
  

  useEffect(() => {
    console.log(isAuthenticated); 
  }, [isAuthenticated]);
  

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <Router>
      <AuthProvider>
        <NavbarWrapper />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/deal-overview" element={<ProtectedRoute><DealOverview /></ProtectedRoute>} />
          <Route path="/dealProgress_1" element={<ProtectedRoute><DealProgress1 onNext='/dealProgress_2' /></ProtectedRoute>} />
          <Route path="/dealProgress_2" element={<ProtectedRoute><DealProgress2 onNext='/dealProgress_3' /></ProtectedRoute>} />
          <Route path="/dealProgress_3" element={<ProtectedRoute><DealProgress_3 /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;