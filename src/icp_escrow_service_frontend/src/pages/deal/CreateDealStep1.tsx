import CreateDealProgressBar from "../../components/CreateDealProgressBar";

type CreateDealProps = {
    onNext: () => void;
  };
  
  const CreateDeal: React.FC<CreateDealProps> = ({ onNext }) => {
    const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      onNext();
    };
 return (
    <div className="card p-5 mx-auto my-5" style={{width: '75%'}}>
        <div className="card-body text-center">
            
            <CreateDealProgressBar currentStep={1} />
            
            <form className="mt-5" onSubmit={handleSubmit}>
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