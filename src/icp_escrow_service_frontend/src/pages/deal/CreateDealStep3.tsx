import CreateDealProgressBar from "../../components/CreateDealProgressBar"

const CreateDealSuccessful = () => {
    return (
        <div className="card p-5 mx-auto my-5" style={{width: '75%'}}>
        <div className="card-body text-center">
            
            <CreateDealProgressBar currentStep={3} />

            <div className="mb-4">
                <img src="/create_deals.png" className="create-deals-image" alt="Image"/>
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