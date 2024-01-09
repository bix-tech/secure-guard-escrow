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
import Bool "mo:base/Bool";
import Iter "mo:base/Iter";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Order "mo:base/Order";
import Int "mo:base/Int";
import Account "account";
import Wallet "wallet";
import Deal "deal";

actor {
  public type Result<A, B> = Result.Result<A, B>;

  public type ResultDeal<T> = { #ok : T; #err : Text };

  type Order = { #less; #equal; #greater };

  var pictures : HashMap.HashMap<Nat, Blob> = HashMap.HashMap(10, Nat.equal, Hash.hash);

  var documents : HashMap.HashMap<Nat, Blob> = HashMap.HashMap(10, Nat.equal, Hash.hash);

  var deliverableDocuments : HashMap.HashMap<Nat, Blob> = HashMap.HashMap(10, Nat.equal, Hash.hash);

  let ledger : TrieMap.TrieMap<Account.Account, Nat> = TrieMap.TrieMap(Account.accountsEqual, Account.accountsHash);

  let lockedTokens : TrieMap.TrieMap<Account.Account, Nat> = TrieMap.TrieMap(Account.accountsEqual, Account.accountsHash);

  let platformAcc : Principal = Principal.fromText("msfjg-mdjak-g5m3u-6rel6-bdj6e-2olg2-v2eo2-k6pmq-73oey-m6pq5-qqe");

  var nextDealId : Nat = 1;

  let deals : TrieMap.TrieMap<Nat, Deal> = TrieMap.TrieMap(Nat.equal, Hash.hash);

  let activityLogs : TrieMap.TrieMap<Nat, [ActivityLog]> = TrieMap.TrieMap(Nat.equal, Hash.hash);

  let transactionLogs : TrieMap.TrieMap<Nat, [TransactionLog]> = TrieMap.TrieMap(Nat.equal, Hash.hash);

  let notifications : TrieMap.TrieMap<Principal, [Notification]> = TrieMap.TrieMap(Principal.equal, Principal.hash);
  public type User = {
    #Buyer;
    #Seller;
  };

  public type Notification = {
    dealId : Nat;
    message : Text;
  };

  public type BuyerStatus = {
    #Pending;
    #Approved;
  };

  public type Deliverable = {
    id : Nat;
    deliverableDescription : Text;
    deliverableDocuments : [FileReference];
  };

  type Time = Int;

  public type DealTimeline = {
    dealStart : Time;
    dealEnd : Time;
  };

  public type PaymentScheduleInfo = {
    packageName : Text;
    packageDescription : Text;
  };

  public type DealCategory = {
    #Services;
    #PhysicalProducts;
    #DigitalProducts;
    #DomainName;
    #NFT;
    #Tokens;
  };

  public type DealStatus = Text;
  public type FileReference = {
    id : Nat;
    name : Text;
  };

  public type Deal = {
    id : Nat;
    status : DealStatus;
    name : Text;
    from : Principal;
    to : Principal;
    amount : Nat;
    picture : FileReference;
    supportingDocuments : [FileReference];
    description : Text;
    dealCategory : DealCategory;
    dealType : User;
    paymentScheduleInfo : [PaymentScheduleInfo];
    dealTimeline : [DealTimeline];
    deliverables : [Deliverable];
    createTime : Time;
    submissionTime : ?Time;
    buyerCancelRequest : Bool;
    sellerCancelRequest : Bool;
  };

  public type ActivityLog = {
    dealId : Nat;
    description : Text;
    activityType : Text;
    amount : Nat;
    status : DealStatus;
    activityTime : Time;
    user : Principal;
    deal : Deal;
  };

  public type TransactionLog = {
    dealId : Nat;
    description : Text;
    activityType : Text;
    amount : Nat;
    status : DealStatus;
    activityTime : Time;
    user : Principal;
    deal : Deal;
  };

  public query func getNotification(user : Principal) : async [Notification] {
    let notificationsOpt = notifications.get(user);
    switch (notificationsOpt) {
      case (null) { return [] };
      case (?n) { return n };
    };
  };

  private func addNotification(user : Principal, notification : Notification) {
    let currentNotifications = switch (notifications.get(user)) {
      case (null) { [] };
      case (?n) { n };
    };
    notifications.put(user, Array.append(currentNotifications, [notification]));
  };

  public func clearNotifications(user : Principal, dealId : Nat) : async Bool {
    let currentNotifications = switch (notifications.get(user)) {
      case (null) { return false };
      case (?n) { n };
    };
    let newNotifications = Array.filter(
      currentNotifications,
      func(n : Notification) : Bool {
        n.dealId != dealId;
      },
    );
    notifications.put(user, newNotifications);
    return true;
  };

  public func uploadPicture(blob : Blob) : async Nat {
    let id = pictures.size();
    pictures.put(id, blob);
    return id;
  };

  public func uploadSupportingDocument(blob : Blob) : async Nat {
    let id = documents.size();
    documents.put(id, blob);
    return id;
  };

  public func uploadDeliverableDocument(blob : Blob) : async Nat {
    let id = deliverableDocuments.size();
    deliverableDocuments.put(id, blob);
    return id;
  };

  public func getPicture(fileRef : FileReference, dealId : Nat) : async ?Blob {
    let dealOpt = deals.get(dealId);
    switch (dealOpt) {
      case (null) {
        return null;
      };
      case (?deal) {
        if (deal.picture.id == fileRef.id) {
          return pictures.get(fileRef.id);
        } else {
          return null;
        };
      };
    };
  };

  public func getSupportingDocument(fileRef : FileReference, dealId : Nat) : async ?Blob {
    let dealOpt = deals.get(dealId);
    switch (dealOpt) {
      case (null) {
        return null;
      };
      case (?deal) {
        let supportingDocuments = deal.supportingDocuments;
        let documentOpt = Array.find(
          supportingDocuments,
          func(doc : FileReference) : Bool {
            doc.id == fileRef.id;
          },
        );
        switch (documentOpt) {
          case (null) {
            return null;
          };
          case (?document) {
            return documents.get(document.id);
          };
        };
      };
    };
  };

  public func getAllDeliverableDocuments(dealId : Nat) : async [Blob] {
    let dealOpt = deals.get(dealId);
    var allDocuments : [Blob] = [];

    switch (dealOpt) {
      case (null) {
        return allDocuments;
      };
      case (?deal) {
        let deliverables = Array.vals(deal.deliverables);

        for (deliv in deliverables) {
          let docOpt = deliverableDocuments.get(deliv.id);
          switch (docOpt) {
            case (null) {
              //do nothing
            };
            case (?doc) {
              allDocuments := Array.append<Blob>(allDocuments, [doc]);
            };
          };
        };
      };
    };

    return allDocuments;
  };

  public shared ({ caller }) func createDeal(newDeal : Deal, principal : Principal) : async Deal.createDealResult {
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
      paymentScheduleInfo = newDeal.paymentScheduleInfo;
      dealTimeline = newDeal.dealTimeline;
      deliverables = [];
      supportingDocuments = newDeal.supportingDocuments;
      createTime = Time.now();
      submissionTime = null;
      buyerCancelRequest = false;
      sellerCancelRequest = false;
    };

    let creatorDescription : Text = if (principal == newDeal.from) {
      "You, as a seller, created a deal named: " # newDeal.name;
    } else if (principal == newDeal.to) {
      "You, as a buyer, created a deal named: " # newDeal.name;
    } else {
      "Invalid principal";
    };

    let receiverDescription : Text = if (principal == newDeal.from) {
      "You, as a buyer, received a deal named: " # newDeal.name;
    } else if (principal == newDeal.to) {
      "You, as a seller, received a deal named: " # newDeal.name;
    } else {
      "Invalid principal";
    };

    let creatorLog = {
      dealId = nextDealId;
      description = creatorDescription;
      activityType = "Deal Created";
      status = newDeal.status;
      amount = newDeal.amount;
      activityTime = Time.now();
      user = newDeal.to;
      deal = dealToCreate;

    };

    let receiverLog = {
      dealId = nextDealId;
      description = receiverDescription;
      activityType = "Deal Received";
      status = newDeal.status;
      amount = newDeal.amount;
      activityTime = Time.now();
      user = newDeal.from;
      deal = dealToCreate;
    };

    await createActivityLog(creatorLog, principal);
    await createActivityLog(receiverLog, if (principal == newDeal.from) newDeal.to else newDeal.from);

    deals.put(nextDealId, dealToCreate);

    nextDealId += 1;

    addNotification(newDeal.to, { dealId = nextDealId - 1; message = "You have a new deal named: " # newDeal.name });

    return #ok(#CreateDealOk({ id = nextDealId - 1 }));
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

  public shared ({ caller }) func getAllDealsForUser(principal : Principal) : async ResultDeal<[Deal]> {
    let allDeals = Iter.toArray(deals.vals());

    let userDeals = Array.filter(
      allDeals,
      func(deal : Deal) : Bool {
        deal.from == principal or deal.to == principal;
      },
    );

    let sortedDeals = Array.sort(
      userDeals,
      func(a : Deal, b : Deal) : Order {
        if (a.createTime > b.createTime) { return #less };
        if (a.createTime < b.createTime) { return #greater };
        return #equal;
      },
    );

    return #ok(sortedDeals);
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

  public shared ({ caller }) func lockToken(principal : Principal, amount : Nat, dealId : Nat) : async Wallet.LockTokenResult {
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
          let existingLockedAmountOpt = lockedTokens.get(buyerAccount);
          let existingLockedAmount = switch (existingLockedAmountOpt) {
            case (null) { 0 };
            case (?amount) { amount };
          };

          let newLockedAmount = existingLockedAmount + amount;
          lockedTokens.put(buyerAccount, newLockedAmount);

          let dealOpt = deals.get(dealId);
          switch (dealOpt) {
            case (null) {
              ledger.put(buyerAccount, balance);
              let _ = lockedTokens.remove(buyerAccount);
              return #TokenNotLocked;
            };
            case (?deal) {
              if (principal != deal.to) {
                ledger.put(buyerAccount, balance);
                let _ = lockedTokens.remove(buyerAccount);
                return #NotAuthorized;
              };

              if (deal.status != "Pending") {
                ledger.put(buyerAccount, balance);
                let _ = lockedTokens.remove(buyerAccount);
                return #DealNotPending;
              };

              let updatedDeal = {
                id = dealId;
                status = "In Progress";
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
                supportingDocuments = deal.supportingDocuments;
                createTime = deal.createTime;
                submissionTime = deal.submissionTime;
                buyerCancelRequest = deal.buyerCancelRequest;
                sellerCancelRequest = deal.sellerCancelRequest;
              };

              let buyerLog = {
                dealId = dealId;
                description = "Deal in progress, you've locked token for this deal.";
                activityType = "Deal In Progress";
                status = "In Progress";
                amount = deal.amount;
                activityTime = Time.now();
                user = deal.to;
                deal = updatedDeal;
              };

              let sellerLog = {
                dealId = dealId;
                description = "Deal in progress, buyer has locked token for this deal.";
                activityType = "Deal In Progress";
                status = "In Progress";
                amount = deal.amount;
                activityTime = Time.now();
                user = deal.from;
                deal = updatedDeal;
              };

              await createActivityLog(buyerLog, deal.to);
              await createActivityLog(sellerLog, deal.from);

              await createTransactionLog(buyerLog, deal.to);
              await createTransactionLog(sellerLog, deal.from);
              

              addNotification(updatedDeal.from, { dealId = nextDealId - 1; message = "Buyer locked token, you can submit deliverables now." });

              deals.put(dealId, updatedDeal);
              return #TokenLocked;
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func confirmDeal(dealId : Nat, principal : Principal) : async Result<(), Text> {
    let dealOpt = deals.get(dealId);

    switch (dealOpt) {
      case (null) {
        return #err("Deal not found");
      };
      case (?deal) {
        if (principal != deal.to) {
          return #err("Only the buyer can confirm the deal");
        };
        if (deal.status != "Submitted Deliverables") {
          return #err("Deal is not in a state that can be confirmed");
        };

        let sellerAccount = { owner = deal.from; subaccount = null };
        let buyerAccount = { owner = deal.to; subaccount = null };
        let platformAccount = { owner = platformAcc; subaccount = null };
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

            let platformBalanceOpt = ledger.get(platformAccount);
            let platformBalance = switch (platformBalanceOpt) {
              case (null) { 0 };
              case (?balance) { balance };
            };
            let dealFee = (deal.amount * 1) / 100;
            ledger.put(platformAccount, dealFee + platformBalance);
            ledger.put(sellerAccount, sellerBalance + (deal.amount - dealFee));
            let newLockedAmount = lockedAmount - deal.amount;
            lockedTokens.put(buyerAccount, newLockedAmount);

            let updatedDeal = {
              id = dealId;
              status = "Completed";
              name = deal.name;
              from = deal.from;
              to = deal.to;
              amount = deal.amount;
              picture = deal.picture;
              description = deal.description;
              dealCategory = deal.dealCategory;
              dealType = deal.dealType;
              supportingDocuments = deal.supportingDocuments;
              paymentScheduleInfo = deal.paymentScheduleInfo;
              dealTimeline = deal.dealTimeline;
              deliverables = deal.deliverables;
              createTime = deal.createTime;
              submissionTime = deal.submissionTime;
              buyerCancelRequest = false;
              sellerCancelRequest = false;
            };

            let sellerLog = {
              dealId = dealId;
              description = "Deal completed, buyer has confirmed the deal.";
              activityType = "Deal Completed";
              status = "Completed";
              amount = deal.amount;
              activityTime = Time.now();
              user = deal.from;
              deal = updatedDeal;
            };

            let buyerLog = {
              dealId = dealId;
              description = "Deal completed, you've confirmed the deal.";
              activityType = "Deal Completed";
              status = "Completed";
              amount = deal.amount;
              activityTime = Time.now();
              user = deal.to;
              deal = updatedDeal;
            };

            await createActivityLog(buyerLog, deal.to);
            await createActivityLog(sellerLog, deal.from);

            await createTransactionLog(buyerLog, deal.to);
            await createTransactionLog(sellerLog, deal.from);

            addNotification(updatedDeal.from, { dealId = nextDealId - 1; message = "Buyer confirmed the deal. Please check if you've received the token." });

            deals.put(dealId, updatedDeal);

            return #ok(());
          };
        };
      };
    };
  };

  public shared ({ caller }) func addDeliverablesToDeal(dealId : Nat, newDeliverable : Deliverable) : async Result<Nat, Text> {
    let dealOpt = deals.get(dealId);

    switch (dealOpt) {
      case (null) {
        return #err("Deal not found");
      };
      case (?deal) {
        let updatedDeliverables = Array.append(deal.deliverables, [newDeliverable]);

        let updatedDeal = {
          id = dealId;
          status = "Submitted Deliverables";
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
          supportingDocuments = deal.supportingDocuments;
          createTime = deal.createTime;
          submissionTime = ?Time.now();
          buyerCancelRequest = deal.buyerCancelRequest;
          sellerCancelRequest = deal.sellerCancelRequest;
        };

        let buyerLog = {
          dealId = dealId;
          description = "Seller submitted deliverables, please check and confirm the deal if everything is ok.";
          activityType = "Submitted Deliverables";
          status = "Submitted Deliverables";
          amount = deal.amount;
          activityTime = Time.now();
          user = deal.to;
          deal = updatedDeal;
        };

        let sellerLog = {
          dealId = dealId;
          description = "You've submitted deliverables, wait for buyer to confirm deal.";
          activityType = "Submitted Deliverables";
          status = "Submitted Deliverables";
          amount = deal.amount;
          activityTime = Time.now();
          user = deal.from;
          deal = updatedDeal;
        };

        await createActivityLog(buyerLog, deal.to);
        await createActivityLog(sellerLog, deal.from);

        addNotification(updatedDeal.to, { dealId = nextDealId - 1; message = "Seller submitted deliverables. Please check and confirm the deal if everything is" });

        deals.put(dealId, updatedDeal);
        return #ok(dealId);
      };
    };
  };

  public shared ({ caller }) func cancelDeal(dealId : Nat, principal : Principal) : async Result<Deal, Text> {
    let dealOpt = deals.get(dealId);

    switch (dealOpt) {
      case (null) {
        return #err("Deal not found");
      };
      case (?deal) {
        if (deal.status == "Cancelled") {
          return #err("Deal already cancelled");
        };

        if (deal.status == "Completed") {
          return #err("Deal already completed");
        };

        if (principal != deal.from and principal != deal.to) {
          return #err("Only the buyer or seller can cancel the deal");
        };

        let isBuyer = principal == deal.to;
        let isSeller = principal == deal.from;

        let updatedDeal = {
          id = dealId;
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
          supportingDocuments = deal.supportingDocuments;
          dealTimeline = deal.dealTimeline;
          deliverables = deal.deliverables;
          createTime = deal.createTime;
          submissionTime = deal.submissionTime;
          buyerCancelRequest = if (isBuyer) { true } else {
            deal.buyerCancelRequest;
          };
          sellerCancelRequest = if (isSeller) { true } else {
            deal.sellerCancelRequest;
          };
        };

        if (isBuyer) {
          let buyerLog = {
            dealId = dealId;
            description = "Deal cancelled, please wait for seller to cancel the deal too.";
            activityType = "Deal Cancelation";
            status = "Cancelled";
            amount = deal.amount;
            activityTime = Time.now();
            user = deal.to;
            deal = updatedDeal;
          };

          await createActivityLog(buyerLog, deal.to);
        } else if (isSeller) {
          let sellerLog = {
            dealId = dealId;
            description = "Deal cancelled, please wait for buyer to cancel the deal too.";
            activityType = "Deal Cancelation";
            status = "Cancelled";
            amount = deal.amount;
            activityTime = Time.now();
            user = deal.from;
            deal = updatedDeal;
          };

          await createActivityLog(sellerLog, deal.from);
        };

        if (updatedDeal.buyerCancelRequest and updatedDeal.sellerCancelRequest) {
          let buyerAccount = { owner = deal.to; subaccount = null };
          let lockedAmountOpt = lockedTokens.get(buyerAccount);
          switch (lockedAmountOpt) {
            case (null) {};
            case (?lockedAmount) {
              let balanceOpt = ledger.get(buyerAccount);
              switch (balanceOpt) {
                case (null) {
                  ledger.put(buyerAccount, lockedAmount);
                };
                case (?balance) {
                  ledger.put(buyerAccount, balance + lockedAmount);
                };
              };
              let _ = lockedTokens.remove(buyerAccount);
            };
          };

          let finalDeal = {
            id = dealId;
            status = "Cancelled";
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
            supportingDocuments = deal.supportingDocuments;
            createTime = deal.createTime;
            submissionTime = deal.submissionTime;
            buyerCancelRequest = false;
            sellerCancelRequest = false;
          };

          let afterBuyerLog = {
            dealId = dealId;
            description = "Deal cancelled, you've cancelled the deal.";
            activityType = "Deal Cancelation";
            status = "Cancelled";
            amount = deal.amount;
            activityTime = Time.now();
            user = deal.to;
            deal = finalDeal;
          };

          let afterSellerLog = {
            dealId = dealId;
            description = "Deal cancelled, you've cancelled the deal.";
            activityType = "Deal Cancelation";
            status = "Cancelled";
            amount = deal.amount;
            activityTime = Time.now();
            user = deal.from;
            deal = finalDeal;
          };

          await createActivityLog(afterBuyerLog, deal.to);
          await createActivityLog(afterSellerLog, deal.from);

          if (finalDeal.from == principal) {
            addNotification(finalDeal.to, { dealId = nextDealId - 1; message = "Seller cancelled the deal." });
          } else {
            addNotification(finalDeal.from, { dealId = nextDealId - 1; message = "Buyer cancelled the deal." });
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

  public func getActivityLogsForUser(user : Principal) : async [ActivityLog] {
    let allLogs = Array.flatten(Iter.toArray(activityLogs.vals()));

    let userLogs = Array.filter(
      allLogs,
      func(log : ActivityLog) : Bool {
        log.user == user;
      },
    );

    let sortedLogs = Array.sort(
      userLogs,
      func(a : ActivityLog, b : ActivityLog) : Order {
        if (a.activityTime > b.activityTime) { return #less };
        if (a.activityTime < b.activityTime) { return #greater };
        return #equal;
      },
    );

    return sortedLogs;
  };

  public func getActivityLogsCountForUser(user : Principal, page : Nat, itemsPerPage : Nat) : async [ActivityLog] {
    let allLogs = Array.flatten(Iter.toArray(activityLogs.vals()));
    let userLogs = Array.filter(
      allLogs,
      func(log : ActivityLog) : Bool {
        log.user == user;
      },
    );
    let start = page * itemsPerPage;
    var end = (page + 1) * itemsPerPage;
    if (end > Array.size(userLogs)) {
      end := Array.size(userLogs);
    };

    return Iter.toArray(Array.slice(userLogs, start, end));
  };

  public func createActivityLog(newLog : ActivityLog, additionalUser : Principal) : async () {
    let existingLogs = switch (activityLogs.get(newLog.dealId)) {
      case (null) {
        [];
      };
      case (?logs) {
        logs;
      };
    };

    let createLog : ActivityLog = {
      dealId = newLog.dealId;
      description = newLog.description;
      activityType = newLog.activityType;
      amount = newLog.amount;
      status = newLog.status;
      activityTime = Time.now();
      user = newLog.user;
      deal = newLog.deal;
    };

    let additionalLog : ActivityLog = {
      dealId = newLog.dealId;
      description = newLog.description;
      activityType = newLog.activityType;
      amount = newLog.amount;
      status = newLog.status;
      activityTime = Time.now();
      user = additionalUser;
      deal = newLog.deal;
    };

    let existingAdditionalLogs = switch (activityLogs.get(additionalLog.dealId)) {
      case (null) {
        [];
      };
      case (?logs) {
        logs;
      };
    };

    activityLogs.put(additionalLog.dealId, Array.append(existingAdditionalLogs, [additionalLog]));
  };

  public func createTransactionLog(newLog : TransactionLog, additionalUser : Principal) : async () {
    let existingLogs = switch (transactionLogs.get(newLog.dealId)) {
      case (null) {
        [];
      };
      case (?logs) {
        logs;
      };
    };

    let createLog : TransactionLog = {
      dealId = newLog.dealId;
      description = newLog.description;
      activityType = newLog.activityType;
      amount = newLog.amount;
      status = newLog.status;
      activityTime = Time.now();
      user = newLog.user;
      deal = newLog.deal;
    };


    transactionLogs.put(createLog.dealId, Array.append(existingLogs, [createLog]));
  };


  public func autoConfirmDeals() : async () {
    let currentTime = Time.now();
    var allDealIds : [Nat] = [];
    let iter = deals.keys();
    var maybeKey = iter.next();
    while (maybeKey != null) {
      switch (maybeKey) {
        case (?k) {
          allDealIds := Array.append(allDealIds, [k]);
        };
        case (null) {};
      };
      maybeKey := iter.next();
    };

    for (dealId in allDealIds.vals()) {
      let dealOpt = deals.get(dealId);
      switch (dealOpt) {
        case (?deal) {
          switch (deal.submissionTime) {
            case (?subTime) {
              // let sevenDays = 7 * 86400 * 1000000000;
              let fiveMinutes = 5 * 60 * 1000000000;
              let deadline = subTime + fiveMinutes;
              if (currentTime >= deadline and deal.status == "Submitted Deliverables") {
                let _ = await confirmDeal(dealId, deal.to);
              };
            };
            case (null) {};
          };
        };
        case (null) {};
      };
    };
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

  system func heartbeat() : async () {
    await autoConfirmDeals();
  };
};
