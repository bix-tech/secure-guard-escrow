import React, {useContext} from 'react';
import CreateDealProgressBar from "../../components/CreateDealProgressBar";
import { useForm } from 'react-hook-form';
import { useDealData, User } from '../../contexts/DealContext';
import { DealFlowContext } from '../../contexts/InitiateDealFlowContext';

type CreateDealProps = {
    onNext: () => void; 
};


type FormData = {
    dealName: string;
    dealType: User;
};


const CreateDeal: React.FC<CreateDealProps> = ({ onNext }) => {
    const context = useContext(DealFlowContext);
    const { dealData, setDealData } = useDealData(); 
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();


    const onSubmit = (formData: FormData) => {
        const userType: User = formData.dealType === 'Buyer' ? User.Buyer : User.Seller;

        setDealData({
            ...dealData,
            dealName: formData.dealName,
            dealType: userType, 
        });

        console.log(dealData);
        console.log(formData);
        if(context) {
            context.completeStep('step1');
        }

        onNext(); 
    };

    return (
        <div className="card p-5 mx-auto my-5" style={{ width: '75%' }}>
            <div className="card-body text-center">

                <CreateDealProgressBar currentStep={1} />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <div className="form-row col-md-9 text-start mx-auto">
                            <label htmlFor="dealName" className="form-label text-start">Deal Name</label>
                            <input {...register("dealName", { required: true })} className="form-control" />
                            {errors.dealName && <p>This field is required</p>}
                        </div>
                    </div>

                    <div className="mb-3 mt-4">
                        <div className="form-row">
                            <div className="form-group col-md-9 text-start mx-auto">
                                <label htmlFor="dealType" className="form-label">Are you a buyer or seller in this deal?</label>
                                <div className="btn-group d-flex">
                                    <label>
                                        <input type="radio" {...register("dealType", { required: true })} value="Buyer" /> Buyer
                                    </label>
                                    <label>
                                        <input type="radio" {...register("dealType", { required: true })} value="Seller" /> Seller
                                    </label>
                                    {errors.dealType && <p>This field is required</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn mx-auto col-md-9 submit-deal-btn mt-3">Confirm</button>
                </form>

            </div>
        </div>
    );
};

export default CreateDeal;
