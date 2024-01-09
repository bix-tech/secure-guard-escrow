import { useNavigate } from "react-router-dom";

interface SidebarProps {
  isHamburgerActive: boolean;
  handleHamburgerClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isHamburgerActive, handleHamburgerClick }) => {
  const navigate = useNavigate();

  const handleMyDealClick = () => {
    navigate('/myDeal')
  };

  const handleTransactionClick = () => {
    navigate('/my-transactions')
  }

  const handleHomeClick = () => {
    navigate('/dashboard')
  }



  return (
    <div className={`col-md-3 col-lg-2 ps-0 ${isHamburgerActive ? '' : 'bg-white'}`}>
      <div className="btn-group hamburger">
        <button className="btn btn-default" type="button" id="menu-toggle" onClick={handleHamburgerClick}>
          <img src="hamburger.png" className="menu-icon" alt="" />
        </button>
      </div>
      < nav id="sidebar" className={`pt-3 d-md-block sidebar ${isHamburgerActive ? 'active' : ''}`} style={{ height: 'auto', minHeight: '92vh' }}>
        <div className="position-sticky">
          <ul className="nav flex-column">
            <li className="nav-item">
              <h5 className="nav active px-3 py-2">
                MENU
              </h5>
            </li>
            <li className="nav-item">
              <div className="nav-link active mb-3" onClick={handleHomeClick} style={{ cursor: "pointer" }}>
                <img src="/dashboard.png" alt="User Avatar" className="menu-icon me-2" />
                Dashboard
              </div>
            </li>
            <li className="nav-item">
              <div className="nav-link mb-3" onClick={handleMyDealClick} style={{ cursor: "pointer" }}>
                <img src="/my-deals.png" alt="User Avatar" className="menu-icon me-2" />
                My Deals
              </div>
            </li>
            <li className="nav-item">
              <div className="nav-link mb-3" onClick={handleTransactionClick} style={{ cursor: "pointer" }}>
                <img src="/transaction.png" alt="User Avatar" className="menu-icon me-2" />
                Transactions
              </div>
            </li>
            <li className="nav-item">
              <a className="nav-link mb-3" href="#">
                <img src="/profile.png" alt="User Avatar" className="menu-icon me-2" />
                Profile
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link mb-3" href="#">
                <img src="/help-center.png" alt="User Avatar" className="menu-icon me-2" />
                Help Center
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>

  );
}

export default Sidebar;
