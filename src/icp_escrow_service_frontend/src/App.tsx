import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
// import HomePage from './pages/HomePage';
import LoginPage from '../src/pages/Login';
import DashboardPage from './pages/Dashboard';
import Navbar from './components/Navbar';

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
      <NavbarWrapper />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
