import React from "react";

type FooterProps = {
  isSidebarActive:  boolean;
  children?: React.ReactNode;
};

const Footer: React.FC<FooterProps> = ({ isSidebarActive, children }) => {
  return (
    <div className={`bottom-bar d-flex justify-content-between p-4 ${isSidebarActive ? 'not-full-width' : 'full-width'}`}>
          <div className="left-side mobile-font-size-8px">
            <span>© 2023 SecureGuard Escrow</span>
          </div>

          <div className="right-side mobile-font-size-8px">
            <span>Designed by </span><span style={{ fontWeight: '600' }}>SecureGuard Escrow</span>
          </div>
          {children}
      </div>
  )
}

export default Footer