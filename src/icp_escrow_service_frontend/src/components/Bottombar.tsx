const Bottombar = () => {
  return (
      <div className="bottom-bar d-flex justify-content-between p-4" style={{ marginTop: '20px' }}>
          <div className="left-side mobile-font-size-8px">
            <span>© 2023 SecureGuard Escrow</span>
          </div>

          <div className="right-side mobile-font-size-8px">
            <span>Designed by </span><span style={{ fontWeight: '600' }}>SecureGuard Escrow</span>
          </div>
      </div>
  )
}

export default Bottombar