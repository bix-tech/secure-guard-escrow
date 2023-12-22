
interface DealProgressProps {
    onNext: () => void; 
  }

const DealProgress_1 = ({ onNext }: DealProgressProps) => {
    return (
        <div className="card p-5 mx-auto my-5" style={{width: '75%'}}>
            <div className="card-body text-center">
                
                {/* First Div: State Bar */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        {/* State 1 */}
                        <div className="state-bar d-flex flex-column align-items-center" style={{width: '20%'}}>
                            <div className="avatar state-avatar">
                                <img src="src/assets/images/create_deal_icon.png" alt="State Avatar 1"/>
                            </div>
                            <div className="mt-2">Create Deal</div>
                        </div>
    
                        {/* Horizontal Divider (Image) */}
                        <div className="horizontal-divider">
                            <img src="src/assets/images/line-grey.png" className="divider-image" alt="Divider Image 1"/>
                        </div>
    
                        {/* State 2 */}
                        <div className="state-bar d-flex flex-column align-items-center" style={{width: '20%'}}>
                            <div className="avatar state-avatar">
                                <img src="src/assets/images/deal-details-icon-2.png" alt="State Avatar 2"/>
                            </div>
                            <div className="mt-2">Buyer Lock Payments</div>
                        </div>
    
                        {/* Horizontal Divider (Image) */}
                        <div className="horizontal-divider">
                            <img src="src/assets/images/line-grey.png" className="divider-image" alt="Divider Image 2"/>
                        </div>
    
                        {/* State 3 */}
                        <div className="state-bar d-flex flex-column align-items-center" style={{width: '20%'}}>
                            <div className="avatar state-avatar">
                                <img src="src/assets/images/verify-2.png" alt="State Avatar 3"/>
                            </div>
                            <div className="mt-2">Deliverables</div>
                        </div>
                    </div>
                </div>
                
                <form className="mt-5">
                    <div className="mb-3">
                        <div className="form-row col-md-9 text-start mx-auto">
                            <label htmlFor="projectName" className="form-label text-start">Lock Token</label>
                            <input type="number" className="form-control form-control-lg lock-token-text" placeholder="Token Number"/>
                        </div>
                    </div>
                    
                    <button onClick={(e) => { e.preventDefault(); onNext(); }} type="submit" className="btn mx-auto col-md-9 submit-deal-btn mt-3">Lock Token</button>
                </form>
    
            </div>
        </div>
    )
  }
  
  export default DealProgress_1