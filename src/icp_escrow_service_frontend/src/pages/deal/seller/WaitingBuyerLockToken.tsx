import InitiatingDealProgressBar from "../../../components/InitiatingDealProgressBar";

const WaitingBuyerLockToken = () => {
    return (
        <div className="card p-5 mx-auto my-5" style={{width: '75%'}}>
        <div className="card-body text-center">
            
            <InitiatingDealProgressBar currentStep={2} />

            <div className="mb-4">
                <img src="../../src/assets/images/create_deals.png" className="create-deals-image" alt="Image"/>
                <p className="mt-2">Waiting for buyer to lock tokens</p>
            </div>

            <div>
                <button  className="btn return-dashboard-btn">Return to Dashboard</button>
            </div>

        </div>
    </div>
    )
}

export default WaitingBuyerLockToken