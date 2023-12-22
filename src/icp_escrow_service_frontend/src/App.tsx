import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from '../src/pages/Login';
import Dashboard from './pages/Dashboard';
import DealProgress_1 from './pages/DealProgress_1';
import DealProgress_2 from './pages/DealProgress_2';
import DealProgress_3 from './pages/DealProgress_3';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';



import './App.css';

const NavbarWrapper = () => {
  const location = useLocation();

  if (location.pathname === "/") {
    return null;
  }

  return <Navbar />;
};


function App() {
  return (
    <Router>
      <AuthProvider>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" integrity="sha256-2TnSHycBDAm2wpZmgdi0z81kykGPJAkiUY+Wf97RbvY=" crossOrigin="anonymous"/>
      <NavbarWrapper />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dealProgress_1" element={<ProtectedRoute><DealProgress_1 /></ProtectedRoute>} />
        <Route path="/dealProgress_2" element={<ProtectedRoute><DealProgress_2 /></ProtectedRoute>} />
        <Route path="/dealProgress_3" element={<ProtectedRoute><DealProgress_3 /></ProtectedRoute>} />
      </Routes>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossOrigin="anonymous"/>
      </AuthProvider>
    </Router>
  );
}

export default App;
