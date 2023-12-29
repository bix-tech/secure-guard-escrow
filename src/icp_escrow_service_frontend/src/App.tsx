import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from '../src/pages/Login';
import Dashboard from './pages/Dashboard';
import CreateDealSuccessful from './pages/deal/CreateDealStep3';
import WaitingBuyerLockToken from './pages/deal/seller/WaitingBuyerLockToken';
import CreateDeal from './pages/deal/seller/SubmitDeliverables';
import LockToken from './pages/deal/buyer/InitiateDealLockToken';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import DealOverview from './pages/DealOverview';
import localforage from 'localforage';
import CreateDealStep1 from './pages/deal/CreateDealStep1';
import CreateDealStep2 from './pages/deal/CreateDealStep2';
import CreateDealStep3 from './pages/deal/CreateDealStep3';
import { DealDataProvider } from './contexts/DealContext';

const NavbarWrapper = () => {
  const location = useLocation();

  useEffect(() => {
    localforage.setItem('lastVisitedRoute', location.pathname);
  }, [location]);

  if (location.pathname === "/") {
    return null;
  }

  return <Navbar />;
};


function App() {
  const [dealDetails, setDealDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const auth = useAuth();
  const isAuthenticated = auth ? auth.isAuthenticated : false;

  const CreateStep1 = ({ onNext, onFormSubmit }: { onNext: string, onFormSubmit: (data: any) => void }) => {
    const navigate = useNavigate();

    const handleNext = () => {
      onFormSubmit(dealDetails);
      navigate(onNext);
    };

    return <CreateDealStep1 onNext={handleNext} />;
  };

  const CreateStep2 = ({ onNext, onFormSubmit }: { onNext: string, onFormSubmit: (data: any) => void }) => {
    const navigate = useNavigate();

    const handleNext = () => {
      onFormSubmit(dealDetails);
      navigate(onNext);
    };

    return <CreateDealStep2 onNext={handleNext} />;
  };

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
        <DealDataProvider>
          <NavbarWrapper />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/deal-overview" element={<ProtectedRoute><DealOverview /></ProtectedRoute>} />
            <Route path="/deal/CreateDealSuccessful" element={<ProtectedRoute><CreateDealSuccessful /></ProtectedRoute>} />
            <Route path="/deal/seller/WaitingBuyerLockToken" element={<ProtectedRoute><WaitingBuyerLockToken /></ProtectedRoute>} />
            <Route path="/deal/seller/CreateDeal" element={<ProtectedRoute><CreateDeal /></ProtectedRoute>} />
            <Route path="/deal/buyer/LockToken" element={<ProtectedRoute><LockToken /></ProtectedRoute>} />
            <Route path="/createDealStep1" element={<ProtectedRoute><CreateStep1 onNext='/createDealStep2' onFormSubmit={setDealDetails} /></ProtectedRoute>} />
            <Route path="/createDealStep2" element={<ProtectedRoute><CreateStep2 onNext='/createDealStep3' onFormSubmit={setDealDetails} /></ProtectedRoute>} />
            <Route path="/createDealStep3" element={<ProtectedRoute><CreateDealStep3 /></ProtectedRoute>} />

          </Routes>
        </DealDataProvider>

      </AuthProvider>
    </Router>
  );
}

export default App;