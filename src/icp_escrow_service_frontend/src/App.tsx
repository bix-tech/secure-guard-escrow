import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from '../src/pages/Login';
import Dashboard from './pages/Dashboard';
import WaitingBuyerLockToken from './pages/deal/seller/WaitingBuyerLockToken';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import DealOverview from './pages/deal/DealDetail';
import localforage from 'localforage';
import CreateDealStep1 from './pages/deal/CreateDealStep1';
import CreateDealStep2 from './pages/deal/CreateDealStep2';
import CreateDealStep3 from './pages/deal/CreateDealStep3';
import { DealDataProvider } from './contexts/DealContext';
import InitiateDealLockToken from './pages/deal/buyer/InitiateDealLockToken';
import SubmitDeliverables from './pages/deal/seller/SubmitDeliverables';
import LockTokenSuccessfully from './pages/deal/buyer/LockTokenSuccessfully';
import SubmitDeliverablesSuccessfully from './pages/deal/seller/SubmitDeliverablesSuccessfully';
import { DealFlowProvider } from './contexts/InitiateDealFlowContext';

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
          <DealFlowProvider>
            <NavbarWrapper />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/deal-overview/:dealId" element={<ProtectedRoute><DealOverview /></ProtectedRoute>} />
              <Route path="/createDealStep1" element={<ProtectedRoute><CreateStep1 onNext='/createDealStep2' onFormSubmit={setDealDetails} /></ProtectedRoute>} />
              <Route path="/createDealStep2" element={<ProtectedRoute><CreateStep2 onNext='/createDealStep3' onFormSubmit={setDealDetails} /></ProtectedRoute>} />
              <Route path="/createDealStep3" element={<ProtectedRoute><CreateDealStep3 /></ProtectedRoute>} />
              <Route path="/deal/seller/waiting-buyer/:dealId" element={<ProtectedRoute><WaitingBuyerLockToken /></ProtectedRoute>} />
              <Route path="/deal/buyer/lock-token/:dealId" element={<ProtectedRoute><InitiateDealLockToken /></ProtectedRoute>} />
              <Route path="/deal/buyer/lock-successfully/:dealId" element={<ProtectedRoute><LockTokenSuccessfully /></ProtectedRoute>} />
              <Route path="/deal/seller/submit-deliverables/:dealId" element={<ProtectedRoute><SubmitDeliverables /></ProtectedRoute>} />
              <Route path="/deal/seller/submit-deliverables-successfully/:dealId" element={<ProtectedRoute><SubmitDeliverablesSuccessfully /></ProtectedRoute>} />
            </Routes>
          </DealFlowProvider>
        </DealDataProvider>

      </AuthProvider>
    </Router>
  );
}

export default App;