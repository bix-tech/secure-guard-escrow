import InitiatingDealProgressBar from "../../../components/InitiatingDealProgressBar"

const LockToken = () => {
    return (
        <div className="card p-5 mx-auto my-5" style={{width: '75%'}}>
            <div className="card-body text-center">
                
                <InitiatingDealProgressBar currentStep={2} />
                
                <form className="mt-5">
                    <div className="mb-3">
                        <div className="form-row col-md-9 text-start mx-auto">
                            <label htmlFor="projectName" className="form-label text-start">Lock Token</label>
                            <input type="number" className="form-control form-control-lg lock-token-text" placeholder="Token Number"/>
                        </div>
                    </div>
                    
                    <button type="submit" className="btn mx-auto col-md-9 submit-deal-btn mt-3">Lock Token</button>
                </form>
    
            </div>
        </div>
    )
  }
  
  export default LockToken