import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Hash "mo:base/Hash";
import Array "mo:base/Array";
import Float "mo:base/Float";
import Account "account";
import Wallet "wallet";
import Deal "deal";

actor {
  public type Result<A, B> = Result.Result<A, B>;

  let ledger : TrieMap.TrieMap<Account.Account, Nat> = TrieMap.TrieMap(Account.accountsEqual, Account.accountsHash);

  let lockedTokens : TrieMap.TrieMap<Account.Account, Nat> = TrieMap.TrieMap(Account.accountsEqual, Account.accountsHash);

  var nextDealId : Nat = 1;

  let deals : TrieMap.TrieMap<Nat, Deal> = TrieMap.TrieMap(Nat.equal, Hash.hash);

  let activityLogs : TrieMap.TrieMap<Nat, [ActivityLog]> = TrieMap.TrieMap(Nat.equal, Hash.hash);

  public type User = {
    #Buyer;
    #Seller;
  };
  public type DealStatus = {
    #Pending;
    #InProgress;
    #SubmittedDeliverables;
    #Completed;
    #Cancelled;
  };

  public type DealFee = {
    percent : Float;
  };

  public type BuyerStatus = {
    #Pending;
    #Approved;
  };

  public type Deliverable = {
    deliverableId : Nat;
    deliverableDescription : Text;
    deliverablePicture : Text;
  };

  type Time = Int;

  public type DealTimeline = {
    dealStart : Time;
    dealEnd : Time;
  };

  public type PaymentScheduleInfo = {
    packageName : Text;
    packageDescription : Text;
    packagePrice : Nat;
  };

  public type DealCategory = {
    #Services;
    #PhysicalProducts;
    #DigitalProducts;
    #DomainName;
    #NFT;
    #Tokens;
  };

  public type Deal = {
    status : DealStatus;
    name : Text;
    from : Principal; //buyer
    to : Principal; //seller
    amount : Nat;
    picture : Text;
    description : Text;
    dealCategory : DealCategory;
    dealType : User;
    paymentScheduleInfo : [PaymentScheduleInfo];
    dealTimeline : [DealTimeline];
    deliverables : [Deliverable];
    buyerCancelRequest : Bool;
    sellerCancelRequest : Bool;
    initiator : Principal;
    acceptor : Principal;
  };

  public type ActivityLog = {
    dealId : Nat;
    description : Text;
    activityType : Text;
    amount : Nat;
    activityTime : Time;
  };

  public shared ({ caller }) func createDeal(newDeal : Deal) : async Deal.createDealResult {
    let dealToCreate = {
      id = nextDealId;
      status = newDeal.status;
      name = newDeal.name;
      from = newDeal.from;
      to = newDeal.to;
      amount = newDeal.amount;
      picture = newDeal.picture;
      description = newDeal.description;
      dealCategory = newDeal.dealCategory;
      dealType = newDeal.dealType;
      paymentScheduleInfo = [];
      dealTimeline = [];
      deliverables = [];
      buyerCancelRequest = false;
      sellerCancelRequest = false;
      initiator = caller;
      acceptor = newDeal.to;
    };

    deals.put(nextDealId, dealToCreate);

    nextDealId += 1;

    return #ok(#CreateDealOk);
  };

  public shared ({ caller }) func getDeal(dealId : Nat) : async Result<Deal, Text> {
    let deal = deals.get(dealId);

    switch (deal) {
      case (null) {
        return #err("Deal not found");
      };
      case (?deal) {
        return #ok(deal);
      };
    };
  };

  public shared ({ caller }) func getDealStatus(dealId : Nat) : async Result<DealStatus, Text> {
    let deal = deals.get(dealId);

    switch (deal) {
      case (null) {
        return #err("Deal not found");
      };
      case (?deal) {
        return #ok(deal.status);
      };
    };
  };

  public shared ({ caller }) func checkToken(principal : Principal) : async ?Nat {
    let defaultAccount = { owner = principal; subaccount = null };
    return ledger.get(defaultAccount);
  };

  public shared ({ caller }) func checkLockedToken(principal : Principal) : async ?Nat {
    let defaultAccount = { owner = principal; subaccount = null };
    return lockedTokens.get(defaultAccount);
  };

  public shared ({ caller }) func lockToken(principal : Principal, amount : Nat) : async Wallet.LockTokenResult {
    let buyerAccount = { owner = principal; subaccount = null };
    let balance = ledger.get(buyerAccount);

    switch (balance) {
      case (null) {
        return #InsufficientBalance;
      };
      case (?balance) {
        if (balance < amount) {
          return #InsufficientBalance;
        } else {
          ledger.put(buyerAccount, balance - amount);
          lockedTokens.put(buyerAccount, amount);
          return #TokenLocked;
        };
      };
    };
  };

  public shared ({ caller }) func confirmDeal(dealId : Nat) : async Result<(), Text> {
    let dealOpt = deals.get(dealId);

    switch (dealOpt) {
      case (null) {
        return #err("Deal not found");
      };
      case (?deal) {
        if (caller != deal.acceptor) {
          return #err("Only the buyer can confirm the deal");
        };
        if (deal.status != #SubmittedDeliverables) {
          return #err("Deal is not in a state that can be confirmed");
        };

        let sellerAccount = { owner = deal.to; subaccount = null };
        let buyerAccount = { owner = deal.from; subaccount = null };
        let lockedAmountOpt = lockedTokens.get(buyerAccount);

        switch (lockedAmountOpt) {
          case (null) {
            return #err("No tokens are locked for this deal");
          };
          case (?lockedAmount) {
            let sellerBalanceOpt = ledger.get(sellerAccount);
            let sellerBalance = switch (sellerBalanceOpt) {
              case (null) { 0 };
              case (?balance) { balance };
            };

            ledger.put(sellerAccount, sellerBalance + lockedAmount);
            let _ = lockedTokens.remove(buyerAccount);

            let updatedDeal = {
              status = #Completed;
              name = deal.name;
              from = deal.from;
              to = deal.to;
              amount = deal.amount;
              picture = deal.picture;
              description = deal.description;
              dealCategory = deal.dealCategory;
              dealType = deal.dealType;
              paymentScheduleInfo = deal.paymentScheduleInfo;
              dealTimeline = deal.dealTimeline;
              deliverables = deal.deliverables;
              buyerCancelRequest = false;
              sellerCancelRequest = false;
              initiator = deal.initiator;
              acceptor = deal.acceptor;
            };

            deals.put(dealId, updatedDeal);

            let log = {
              dealId = dealId;
              description = "Deal confirmed";
              activityType = "DealConfirmed";
              amount = deal.amount;
              activityTime = Time.now();
            };
            await createActivityLog(log);

            return #ok(());
          };
        };
      };
    };
  };

  public shared ({ caller }) func addDeliverablesToDeal(dealId : Nat, newDeliverable : Deliverable) : async Result<(), Text> {
    let dealOpt = deals.get(dealId);

    switch (dealOpt) {
      case (null) {
        return #err("Deal not found");
      };
      case (?deal) {
        let updatedDeliverables = Array.append(deal.deliverables, [newDeliverable]);

        let updatedDeal = {
          status = deal.status;
          name = deal.name;
          from = deal.from;
          to = deal.to;
          amount = deal.amount;
          picture = deal.picture;
          description = deal.description;
          dealCategory = deal.dealCategory;
          dealType = deal.dealType;
          paymentScheduleInfo = deal.paymentScheduleInfo;
          dealTimeline = deal.dealTimeline;
          deliverables = updatedDeliverables;
          buyerCancelRequest = deal.buyerCancelRequest;
          sellerCancelRequest = deal.sellerCancelRequest;
          initiator = deal.initiator;
          acceptor = deal.acceptor;
        };

        deals.put(dealId, updatedDeal);
        return #ok(());
      };
    };
  };

  public shared ({ caller }) func cancelDeal(dealId : Nat) : async Result<Deal, Text> {
    let dealOpt = deals.get(dealId);

    switch (dealOpt) {
      case (null) {
        return #err("Deal not found");
      };
      case (?deal) {
        let isBuyer = caller == deal.from;
        let isSeller = caller == deal.to;

        let updatedDeal = {
          status = deal.status;
          name = deal.name;
          from = deal.from;
          to = deal.to;
          amount = deal.amount;
          picture = deal.picture;
          description = deal.description;
          dealCategory = deal.dealCategory;
          dealType = deal.dealType;
          paymentScheduleInfo = deal.paymentScheduleInfo;
          dealTimeline = deal.dealTimeline;
          deliverables = deal.deliverables;
          buyerCancelRequest = if (isBuyer) { true } else {
            deal.buyerCancelRequest;
          };
          sellerCancelRequest = if (isSeller) { true } else {
            deal.sellerCancelRequest;
          };
          initiator = deal.initiator;
          acceptor = deal.acceptor;
        };

        if (updatedDeal.buyerCancelRequest and updatedDeal.sellerCancelRequest) {
          let buyerAccount = { owner = deal.from; subaccount = null };
          let lockedAmountOpt = lockedTokens.get(buyerAccount);
          switch (lockedAmountOpt) {
            case (null) {
              return #err("Insufficient Balance");
            };
            case (?lockedAmount) {
              let balanceOpt = ledger.get(buyerAccount);
              switch (balanceOpt) {
                case (null) {
                  return #err("Insufficient Balance");
                };
                case (?balance) {
                  ledger.put(buyerAccount, balance + lockedAmount);
                };
              };
              let _ = lockedTokens.remove(buyerAccount);
            };
          };

          let finalDeal = {
            status = #Cancelled;
            name = deal.name;
            from = deal.from;
            to = deal.to;
            amount = deal.amount;
            picture = deal.picture;
            description = deal.description;
            dealCategory = deal.dealCategory;
            dealType = deal.dealType;
            paymentScheduleInfo = deal.paymentScheduleInfo;
            dealTimeline = deal.dealTimeline;
            deliverables = deal.deliverables;
            buyerCancelRequest = false;
            sellerCancelRequest = false;
            initiator = deal.initiator;
            acceptor = deal.acceptor;
          };
          deals.put(dealId, finalDeal);
          return #ok(finalDeal);
        } else {
          deals.put(dealId, updatedDeal);
          return #ok(updatedDeal);
        };
      };
    };
  };

  public func getActivityLogs(dealId : Nat) : async [ActivityLog] {
    let logsOpt = activityLogs.get(dealId);
    switch (logsOpt) {
      case (null) {
        return [];
      };
      case (?logs) {
        return logs;
      };
    };
  };

  public func createActivityLog(newLog : ActivityLog) : async () {
    let existingLogs = switch (activityLogs.get(newLog.dealId)) {
      case (null) {
        [];
      };
      case (?logs) {
        logs;
      };
    };

    let createLog = {
      dealId = newLog.dealId;
      description = newLog.description;
      activityType = newLog.activityType;
      amount = newLog.amount;
      activityTime = Time.now();
    };

    activityLogs.put(newLog.dealId, Array.append(existingLogs, [createLog]));
  };

  public func mintTokens(principal : Principal, amount : Nat) : async () {
    let defaultAccount = { owner = principal; subaccount = null };
    let balanceOpt = ledger.get(defaultAccount);
    switch (balanceOpt) {
      case (null) {
        ledger.put(defaultAccount, amount);
      };
      case (?balance) {
        ledger.put(defaultAccount, balance + amount);
      };
    };
  };

  public shared (msg) func callerPrincipal() : async Principal {
    return msg.caller;
  };

};
