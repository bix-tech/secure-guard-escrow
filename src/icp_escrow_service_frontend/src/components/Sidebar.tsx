
const Sidebar = () => {
    return (
        <nav id="sidebar" className="pt-3 col-md-3 col-lg-2 d-md-block bg-light sidebar" style={{ height: '100vh' }}>
          <div className="position-sticky">
            <ul className="nav flex-column">
              <li className="nav-item">
                <h5 className="nav active px-3 py-2">
                  MENU
                </h5>
              </li>
              <li className="nav-item">
                <a className="nav-link active mb-3" href="#">
                  <img src="/dashboard.png" alt="User Avatar" className="menu-icon me-2" />
                  Dashboard
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link mb-3" href="#">
                  <img src="/my-deals.png" alt="User Avatar" className="menu-icon me-2" />
                  My Deals
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link mb-3" href="#">
                  <img src="/transaction.png" alt="User Avatar" className="menu-icon me-2" />
                  Transactions
                </a>
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
    );
}

export default Sidebar;
