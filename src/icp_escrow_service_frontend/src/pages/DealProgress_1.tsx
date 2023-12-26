import CreateDealProgressBar from "../components/CreateDealProgressBar";
interface DealProgressProps {
    onNext: () => void; 
  }

const DealProgress_1 = ({ onNext }: DealProgressProps) => {
    return (
        <div className="card p-5 mx-auto my-5" style={{width: '75%'}}>
            <div className="card-body text-center">
            <CreateDealProgressBar currentStep={1} />

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