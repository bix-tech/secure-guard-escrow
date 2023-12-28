const CreateDealSuccessful = () => {
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
                        <img src="../src/assets/images/line-green.png" className="divider-image" alt="Divider Image 1"/>
                    </div>

                    <div className="state-bar d-flex flex-column align-items-center" style={{width: '20%'}}>
                        <div className="avatar state-avatar">
                            <img src="../src/assets/images/deal-details-icon.png" alt="State Avatar 2"/>
                        </div>
                        <div className="mt-2">Deal Details</div>
                    </div>

                    <div className="horizontal-divider">
                        <img src="../src/assets/images/line-green.png" className="divider-image" alt="Divider Image 2"/>
                    </div>

                    <div className="state-bar d-flex flex-column align-items-center" style={{width: '20%'}}>
                        <div className="avatar state-avatar">
                            <img src="../src/assets/images/verify.png" alt="State Avatar 3"/>
                        </div>
                        <div className="mt-2">Deal Submitted</div>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <img src="../src/assets/images/create_deals.png" className="create-deals-image" alt="Image"/>
                <p className="mt-2">You’ve Successfully Created a Deal !</p>
            </div>

            <div>
                <button className="btn me-2 view-details-btn">View Details</button>
                <button className="btn return-dashboard-btn">Return to Dashboard</button>
            </div>

        </div>
    </div>
    )
}

export default CreateDealSuccessful