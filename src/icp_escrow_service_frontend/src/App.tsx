import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from '../src/pages/Login';
import Dashboard from './pages/Dashboard';
import WaitingBuyerLockToken from './pages/deal/seller/WaitingBuyerLockToken';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { useEffect, useState, Dispatch, SetStateAction } from 'react';
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
import MyDeal from './pages/deal/MyDeal';
import 'bootstrap/dist/css/bootstrap.css';
import Transaction from './pages/Transaction';
import UserProfilePage from './pages/UserProfile';
import Footer from './components/Footer';


const NavbarWrapper = ({ isSidebarActive, setIsSidebarActive }: { isSidebarActive: boolean, setIsSidebarActive: Dispatch<SetStateAction<boolean>> }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    localforage.setItem('lastVisitedRoute', location.pathname);
    const getLastVisitedRoute = async () => {
      const lastVisitedRoute = await localforage.getItem<string>('lastVisitedRoute');
      if (lastVisitedRoute) {
        navigate(lastVisitedRoute);
      }
    };

    const handleResize = () => {
      setIsSidebarActive(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);

    getLastVisitedRoute();
  }, []);

  if (location.pathname === "/") {
    return null;
  }

  return <Navbar isSidebarActive={isSidebarActive} setIsSidebarActive={setIsSidebarActive} />;

};


function App() {
  const [dealDetails, setDealDetails] = useState({});
  const auth = useAuth();
  const isAuthenticated = auth ? auth.isAuthenticated : false;
  const [isSidebarActive, setIsSidebarActive] = useState(window.innerWidth > 768);


  const CreateStep1 = ({ onNext, onFormSubmit, isSidebarActive }: { onNext: string, onFormSubmit: (data: any) => void , isSidebarActive: boolean}) => {
    const navigate = useNavigate();

    const handleNext = () => {
      onFormSubmit(dealDetails);
      navigate(onNext);
    };

    return <CreateDealStep1 onNext={handleNext} isSidebarActive={isSidebarActive} />;
  };

  const CreateStep2 = ({ onNext, onFormSubmit, isSidebarActive }: { onNext: string, onFormSubmit: (data: any) => void , isSidebarActive: boolean}) => {
    const navigate = useNavigate();

    const handleNext = () => {
      onFormSubmit(dealDetails);
      navigate(onNext);
    };

    return <CreateDealStep2 onNext={handleNext} isSidebarActive={isSidebarActive} />;
  };

  useEffect(() => {
  }, [isAuthenticated]);


  return (
    <Router>
      <AuthProvider>
        <DealDataProvider>
          <DealFlowProvider>
          <NavbarWrapper isSidebarActive={isSidebarActive} setIsSidebarActive={setIsSidebarActive} />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard isSidebarActive={isSidebarActive}/></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><UserProfilePage isSidebarActive={isSidebarActive} /></ProtectedRoute>} />
              <Route path="/myDeal" element={<ProtectedRoute><MyDeal isSidebarActive={isSidebarActive} /></ProtectedRoute>} />
              <Route path="/my-transactions" element={<ProtectedRoute><Transaction isSidebarActive={isSidebarActive} /></ProtectedRoute>} />
              <Route path="/deal-overview/:dealId" element={<ProtectedRoute><DealOverview isSidebarActive={isSidebarActive} /></ProtectedRoute>} />
              <Route path="/createDealStep1" element={<ProtectedRoute><CreateStep1 isSidebarActive={isSidebarActive} onNext='/createDealStep2' onFormSubmit={setDealDetails} /></ProtectedRoute>} />
              <Route path="/createDealStep2" element={<ProtectedRoute><CreateStep2 isSidebarActive={isSidebarActive} onNext='/createDealStep3' onFormSubmit={setDealDetails} /></ProtectedRoute>} />
              <Route path="/createDealStep3" element={<ProtectedRoute><CreateDealStep3 isSidebarActive={isSidebarActive}/></ProtectedRoute>} />
              <Route path="/deal/seller/waiting-buyer/:dealId" element={<ProtectedRoute><WaitingBuyerLockToken isSidebarActive={isSidebarActive}/></ProtectedRoute>} />
              <Route path="/deal/buyer/lock-token/:dealId" element={<ProtectedRoute><InitiateDealLockToken isSidebarActive={isSidebarActive} /></ProtectedRoute>} />
              <Route path="/deal/buyer/lock-successfully/:dealId" element={<ProtectedRoute><LockTokenSuccessfully isSidebarActive={isSidebarActive} /></ProtectedRoute>} />
              <Route path="/deal/seller/submit-deliverables/:dealId" element={<ProtectedRoute><SubmitDeliverables isSidebarActive={isSidebarActive}/></ProtectedRoute>} />
              <Route path="/deal/seller/submit-deliverables-successfully/:dealId" element={<ProtectedRoute><SubmitDeliverablesSuccessfully isSidebarActive={isSidebarActive} /></ProtectedRoute>} />
            </Routes>
            <Footer isSidebarActive={isSidebarActive} />
          </DealFlowProvider>
        </DealDataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;