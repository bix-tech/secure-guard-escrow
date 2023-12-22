import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
// import HomePage from './pages/HomePage';
import Login from '../src/pages/Login';
import Dashboard from './pages/Dashboard';
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
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" integrity="sha256-2TnSHycBDAm2wpZmgdi0z81kykGPJAkiUY+Wf97RbvY=" crossOrigin="anonymous"/>
      <NavbarWrapper />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
