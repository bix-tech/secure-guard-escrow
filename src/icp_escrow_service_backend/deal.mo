import Result "mo:base/Result";

module {

    public type Result<A, B> = Result.Result<A, B>;

    public type createDealResult = Result<CreateDealOk, CreateDealErr>;

    public type CreateDealOk = {
        #CreateDealOk;
    };

    public type CreateDealErr = {
        #CreateDealErr;
    };

};
