const CreateDeal = () => {
    return (
    <div className="card p-5 mx-auto my-5" style={{width: '75%'}}>
        <div className="card-body text-center">
            
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="state-bar d-flex flex-column align-items-center" style={{width: '20%'}}>
                        <div className="avatar state-avatar">
                            <img src="../src/assets/images/create_deal_icon.png" alt="State Avatar 1"/>
                        </div>
                        <div className="mt-2">Create Deal</div>
                    </div>

                    <div className="horizontal-divider">
                        <img src="../src/assets/images/line-grey.png" className="divider-image" alt="Divider Image 1"/>
                    </div>

                    <div className="state-bar d-flex flex-column align-items-center" style={{width: '20%'}}>
                        <div className="avatar state-avatar">
                            <img src="../src/assets/images/deal-details-icon-2.png" alt="State Avatar 2"/>
                        </div>
                        <div className="mt-2">Deal Details</div>
                    </div>

                    <div className="horizontal-divider">
                        <img src="../src/assets/images/line-grey.png" className="divider-image" alt="Divider Image 2"/>
                    </div>

                    <div className="state-bar d-flex flex-column align-items-center" style={{width: '20%'}}>
                        <div className="avatar state-avatar">
                            <img src="../src/assets/images/verify-2.png" alt="State Avatar 3"/>
                        </div>
                        <div className="mt-2">Deal Submitted</div>
                    </div>
                </div>
            </div>
            
            <form className="mt-5">
                <div className="mb-3">
                    <div className="form-row col-md-9 text-start mx-auto">
                        <label htmlFor="projectName" className="form-label text-start">Deal Name</label>
                        <input type="text" className="form-control form-control-lg deal-name-text" placeholder="Project Name"/>
                    </div>
                </div>
                
                <div className="mb-3 mt-4">
                    <div className="form-row">
                        <div className="form-group col-md-9 text-start mx-auto">
                            <label htmlFor="projectName" className="form-label">Are you a buyer or seller in this deal?</label>
                            <div className="btn-group d-flex">
                                <button type="button" className="btn btn-sm buyer-btn me-3">Buyer</button>
                                <button type="button" className="btn seller-btn">Seller</button>
                            </div>
                            
                        </div>
                        
                    </div>
                </div>

                <button type="submit" className="btn mx-auto col-md-9 submit-deal-btn mt-3">Confirm</button>
            </form>

        </div>
    </div>
    )
}  

export default CreateDeal