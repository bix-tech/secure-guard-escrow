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
import Nat64 "mo:base/Nat64";
import Int64 "mo:base/Int64";
import Option "mo:base/Option";
import Prim "mo:⛔";
import List "mo:base/List";
import CertifiedData "mo:base/CertifiedData";
import Error "mo:base/Error";
import Nat8 "mo:base/Nat8";
import Trie "mo:base/Trie";
import Helpers "helpers";
import T "Types";
import LT "ledger";
// import Ledger "canister:ledger";
shared actor class Escrow() = this {

  let Ledger = actor "ryjl3-tyaaa-aaaaa-aaaba-cai" : LT.Self;

  public type Result<A, B> = Result.Result<A, B>;

  public type ResultDeal<T> = { #ok : T; #err : Text };

  let ledger_principal : Principal = Principal.fromActor(Ledger);
  let icp_fee : Nat64 = 10_000;

  public type LockTokenResult = {
    #TokenLocked : ();
    #TokenNotLocked : ();
    #DealNotFound : ();
    #InsufficientFunds : { balance : LT.Tokens };
    #TransferError : LT.TransferError;
  };

  type Order = { #less; #equal; #greater };

  var pictures : HashMap.HashMap<Nat, Blob> = HashMap.HashMap(10, Nat.equal, Hash.hash);

  var documents : HashMap.HashMap<Nat, Blob> = HashMap.HashMap(10, Nat.equal, Hash.hash);

  var deliverableDocuments : HashMap.HashMap<Nat, Blob> = HashMap.HashMap(10, Nat.equal, Hash.hash);

  var userProfiles : HashMap.HashMap<Principal, UserProfile> = HashMap.HashMap(10, Principal.equal, Principal.hash);

  var profilePictures : HashMap.HashMap<Nat, Blob> = HashMap.HashMap(10, Nat.equal, Hash.hash);

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

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    address : Text;
    profilePicture : FileReference;
    age : Nat;
    dob : Time;
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
    amount : { e8s : Nat64 };
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
    amount : { e8s : Nat64 };
    status : DealStatus;
    activityTime : Time;
    user : Principal;
    deal : Deal;
  };

  public type TransactionLog = {
    dealId : Nat;
    dealName : Text;
    description : Text;
    activityType : Text;
    amount : Float;
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

  public shared ({ caller }) func getUserProfile(user : Principal) : async Result<UserProfile, Text> {
    let profileOpt = userProfiles.get(user);
    switch (profileOpt) {
      case (null) {
        return #err("Profile not found");
      };
      case (?profile) {
        return #ok(profile);
      };
    };
  };

  public shared ({ caller }) func updateUserProfile(user : Principal, updatedProfile : UserProfile) : async Result<Text, Text> {
    let profileOpt = userProfiles.get(user);
    switch (profileOpt) {
      case (null) {
        let newProfile = {
          name = updatedProfile.name;
          email = updatedProfile.email;
          phone = updatedProfile.phone;
          address = updatedProfile.address;
          profilePicture = updatedProfile.profilePicture;
          age = updatedProfile.age;
          dob = updatedProfile.dob;
        };
        userProfiles.put(user, newProfile);
        return #ok("Profile created");
      };
      case (?profile) {
        let newProfile = {
          name = updatedProfile.name;
          email = updatedProfile.email;
          phone = updatedProfile.phone;
          address = updatedProfile.address;
          profilePicture = updatedProfile.profilePicture;
          age = updatedProfile.age;
          dob = updatedProfile.dob;
        };
        userProfiles.put(user, newProfile);
        return #ok("Profile updated");
      };
    };
  };

  public func getProfilePicture(fileRef : FileReference, principal : Principal) : async ?Blob {
    let profileOpt = userProfiles.get(principal);
    switch (profileOpt) {
      case (null) {
        return null;
      };
      case (?profile) {
        if (profile.profilePicture.id == fileRef.id) {
          return profilePictures.get(fileRef.id);
        } else {
          return null;
        };
      };
    };
  };

  public shared ({ caller }) func userInfo() : async T.UserInfo {
    await getUserInfo(caller);
  };

  public func getUserInfo(principal : Principal) : async T.UserInfo {
    let user_balance = await getBalance(principal);
    let address = Helpers.getAddress(Principal.fromActor(this), principal);

    Debug.print("Address length: " # Nat.toText(Array.size(address)));

    return {
      principal = principal;
      address = address;
      balance = user_balance;
    };
  };

  public func uploadProfilePicture(blob : Blob) : async Nat {
    let id = profilePictures.size();
    profilePictures.put(id, blob);
    return id;
  };

  public func uploadPicture(blob : Blob) : async Nat {
    let id = pictures.size();
    if (id >= 0) {
      let _ = pictures.remove(id);
    };
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

  func isAnonymous(p : Principal) : Bool {
    Blob.equal(Principal.toBlob(p), Blob.fromArray([0x04]));
  };

  public shared ({ caller }) func balanceUser() : async Nat64 {
    await getBalance(caller);
  };

  public func getBalance(caller : Principal) : async Nat64 {
    let account = Blob.toArray(Account.accountIdentifier(caller, Account.defaultSubaccount()));
    let balance = await Ledger.account_balance({ account });
    return balance.e8s;
  };


  public shared ({ caller }) func lockToken(principal : Principal, amount : LT.Tokens, dealId : Nat) : async LockTokenResult {

    let dealOpt = deals.get(dealId);
    let buyerBalance = await getBalance(caller);

    switch (dealOpt) {
      
      case (?deal) {  
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
            deals.put(dealId, updatedDeal);

            let activityLog = {
              dealId = dealId;
              description = "Tokens locked for the deal.";
              activityType = "Tokens Locked";
              amount = deal.amount;
              status = "Tokens Locked";
              activityTime = Time.now();
              user = principal;
              deal = updatedDeal;
            };
            await createActivityLog(activityLog, principal);

            return #TokenLocked;
          };
      case (null) {
        return #DealNotFound;
      };
    };
  };

  // private func transferICP(caller : Principal, amount : Nat64) : async LT.TransferResult {
  //   let account = Blob.toArray(Account.accountIdentifier(Principal.fromActor(this), Account.defaultSubaccount()));

  //   let res = await Ledger.transfer({
  //     memo : Nat64 = 0;
  //     from_subaccount = ?Helpers.getSubaccount(caller);
  //     to = account;
  //     amount = { e8s = amount - icp_fee };
  //     fee = { e8s = icp_fee };
  //     created_at_time = ?{
  //       timestamp_nanos = Nat64.fromNat(Int.abs(Time.now()));
  //     };
  //   });

  //   return res;
  // };

  // private func depositIcp(caller: Principal): async T.DepositReceipt {

  //         // Calculate target subaccount
  //         // NOTE: Should this be hashed first instead?
  //         let source_account = Account.accountIdentifier(Principal.fromActor(this), Account.principalToSubaccount(caller));

  //         // Check ledger for value
  //         let balance = await Ledger.account_balance({ account = source_account });

  //         // Transfer to default subaccount
  //         let icp_receipt = if (balance.e8s > icp_fee) {
  //             await Ledger.transfer({
  //                 memo: Nat64    = 0;
  //                 // from_subaccount = ?Account.principalToSubaccount(caller);
  //                from_subaccount = ?Helpers.getSubaccount(caller);
  //                 to = Account.accountIdentifier(Principal.fromActor(this), Account.defaultSubaccount());
  //                 amount = { e8s = balance.e8s - Nat64.fromNat(icp_fee)};
  //                 fee = { e8s = Nat64.fromNat(icp_fee) };
  //                 created_at_time = ?{ timestamp_nanos = Nat64.fromNat(Int.abs(Time.now())) };
  //             })
  //         } else {
  //             return #Err(#BalanceLow);
  //         };

  //         switch icp_receipt {
  //             case ( #Err _) {
  //                 return #Err(#TransferFailure);
  //             };
  //             case _ {};
  //         };
  //         let available = { e8s : balance.e8s - icp_fee };

  //         // keep track of deposited ICP
  //         book.addTokens(caller,ledger,available.e8s);

  //         // Return result
  //         #Ok(available.e8s)
  //     };

   public func canisterBalance() : async LT.Tokens {
    await Ledger.account_balance({ account = Blob.toArray(Account.accountIdentifier(Principal.fromActor(this), Account.defaultSubaccount())) });
  };


  public shared ({ caller }) func confirmDeal(dealId : Nat, principal : Principal) : async Result<(), Text> {
    let canisterBackend = Principal.fromActor(this); 
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

        let sellerAccountBlob = Account.accountIdentifier(deal.from, Account.defaultSubaccount());
        let sellerAccount : [Nat8] = Blob.toArray(sellerAccountBlob);

        let platformAccBlob = Account.accountIdentifier(platformAcc, Account.defaultSubaccount());
        let platformAccount : [Nat8] = Blob.toArray(platformAccBlob);

        let dealFeeE8s = deal.amount.e8s / 100;
        let dealFee = { e8s = dealFeeE8s };

        let transferFeeAmount = dealFee.e8s;
        let transferDealAmount = deal.amount.e8s - dealFee.e8s;

        let transferResult = await Ledger.transfer({
          memo : Nat64 = 0;
          from_subaccount = null;
          to = platformAccount;
          amount = dealFee;
          fee = { e8s = icp_fee };
          created_at_time = ?{
            timestamp_nanos = Nat64.fromNat(Int.abs(Time.now()));
          };
        });

        switch (transferResult) {
          case (#err(e)) {
            return #err("Failed to transfer fee to platform account: " # + e);
          };
          case _ {};
        };

        let transferSellerResult = await Ledger.transfer({
          memo : Nat64 = 0;
          from_subaccount = null;
          to = sellerAccount;
          amount = { e8s = transferDealAmount };
          fee = { e8s = icp_fee };
          created_at_time = ?{
            timestamp_nanos = Nat64.fromNat(Int.abs(Time.now()));
          };
        });

        switch (transferSellerResult) {
          case (#err(e)) {
            return #err("Failed to transfer amount to seller: " # + e);
          };
          case _ {};
        };

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

        addNotification(updatedDeal.from, { dealId = nextDealId - 1; message = "Buyer confirmed the deal. Please check if you've received the token." });

        deals.put(dealId, updatedDeal);

        return #ok(());
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

        if (isBuyer or isSeller) {
          let cancelLog = {
            dealId = dealId;
            description = "Deal cancelled.";
            activityType = "Deal Cancelation";
            status = "Cancelled";
            amount = deal.amount;
            activityTime = Time.now();
            user = principal;
            deal = updatedDeal;
          };

          await createActivityLog(cancelLog, principal);
        };

        if (updatedDeal.buyerCancelRequest and updatedDeal.sellerCancelRequest) {
          let buyerAccountBlob = Account.accountIdentifier(deal.to, Account.defaultSubaccount());
          let buyerAccount : [Nat8] = Blob.toArray(buyerAccountBlob);
          let platformAccount = Account.accountIdentifier(platformAcc, Account.defaultSubaccount());

          let refundAmount = deal.amount.e8s;
          let refundResults = await Ledger.transfer({
            memo : Nat64 = 0;
            from_subaccount = null;
            to = buyerAccount;
            amount = { e8s = refundAmount };
            fee = { e8s = icp_fee };
            created_at_time = ?{
              timestamp_nanos = Nat64.fromNat(Int.abs(Time.now()));
            };
          });

          switch (refundResults) {
            case (#Err(e)) {
              return #err("Failed to refund locked amount");
            };
            case _ {};
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
            supportingDocuments = deal.supportingDocuments;
            dealTimeline = deal.dealTimeline;
            deliverables = deal.deliverables;
            createTime = deal.createTime;
            submissionTime = deal.submissionTime;
            buyerCancelRequest = false;
            sellerCancelRequest = false;
          };

          deals.put(dealId, finalDeal);

          if (finalDeal.from == principal) {
            addNotification(finalDeal.to, { dealId = nextDealId - 1; message = "Seller cancelled the deal." });
          } else {
            addNotification(finalDeal.from, { dealId = nextDealId - 1; message = "Buyer cancelled the deal." });
          };

          return #ok(finalDeal);
        } else {
          deals.put(dealId, updatedDeal);
          return #ok(updatedDeal);
        };
      };
    };
  };

  public func getTotalDeals(user: Principal) : async Nat {
    let allDeals = Iter.toArray(deals.vals());

    let userDeals = Array.filter(
      allDeals,
      func(deal : Deal) : Bool {
        deal.from == user or deal.to == user;
      },
    );

    return Array.size(userDeals);
  };

  public func getTotalCompletedDeals(user: Principal) : async Nat {
    let allDeals = Iter.toArray(deals.vals());

    let userDeals = Array.filter(
      allDeals,
      func(deal : Deal) : Bool {
        deal.from == user or deal.to == user;
      },
    );

    let completedDeals = Array.filter(
      userDeals,
      func(deal : Deal) : Bool {
        deal.status == "Completed";
      },
    );

    return Array.size(completedDeals);
  };

  public func getTotalInProgressDeals(user : Principal) : async Nat {
    let allDeals = Iter.toArray(deals.vals());

    let userDeals = Array.filter(
      allDeals,
      func(deal : Deal) : Bool {
        deal.from == user or deal.to == user;
      },
    );

    let inProgressDeals = Array.filter(
      userDeals,
      func(deal : Deal) : Bool {
        deal.status == "In Progress";
      },
    );

    return Array.size(inProgressDeals);
  };

  public func getTotalInProgressDealsAmount(user : Principal) : async Nat64 {
    let allDeals = Iter.toArray(deals.vals());

    let userDeals = Array.filter(
      allDeals,
      func(deal : Deal) : Bool {
        deal.from == user or deal.to == user;
      },
    );

    let inProgressDeals = Array.filter(
      userDeals,
      func(deal : Deal) : Bool {
        deal.status == "In Progress";
      },
    );

    let totalAmount = Array.foldLeft(
      inProgressDeals,
      0 : Nat64,
      func(acc : Nat64, deal : Deal) : Nat64 {
        acc + deal.amount.e8s;
      },
    );

    return totalAmount;
  };

  public func getActivityLogsForUser(user : Principal, page : Nat, itemsPerPage : Nat) : async [ActivityLog] {
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

    let start = page * itemsPerPage;
    var end = (page + 1) * itemsPerPage;
    if (end > Array.size(userLogs)) {
      end := Array.size(userLogs);
    };

    return Iter.toArray(Array.slice(sortedLogs, start, end));
  };

  public func getActivityLogsCountForUser(user : Principal) : async Nat {
    let allLogs = Array.flatten(Iter.toArray(activityLogs.vals()));
    let userLogs = Array.filter(
      allLogs,
      func(log : ActivityLog) : Bool {
        log.user == user;
      },
    );
    return Array.size(userLogs);
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
      dealName = newLog.dealName;
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

  public func getTransactionLogsForUser(user : Principal, page : Nat, itemsPerPage : Nat) : async [TransactionLog] {
    let allLogs = Array.flatten(Iter.toArray(transactionLogs.vals()));

    let userLogs = Array.filter(
      allLogs,
      func(log : TransactionLog) : Bool {
        log.user == user;
      },
    );

    let sortedLogs = Array.sort(
      userLogs,
      func(a : TransactionLog, b : TransactionLog) : Order {
        if (a.activityTime > b.activityTime) { return #less };
        if (a.activityTime < b.activityTime) { return #greater };
        return #equal;
      },
    );

    let start = page * itemsPerPage;
    var end = (page + 1) * itemsPerPage;
    if (end > Array.size(userLogs)) {
      end := Array.size(userLogs);
    };

    return Iter.toArray(Array.slice(sortedLogs, start, end));
  };

  public func getTransactionLogsCountForUser(user : Principal) : async Nat {
    let allLogs = Array.flatten(Iter.toArray(transactionLogs.vals()));
    let userLogs = Array.filter(
      allLogs,
      func(log : TransactionLog) : Bool {
        log.user == user;
      },
    );

    return Array.size(userLogs);
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

  public shared (msg) func callerPrincipal() : async Principal {
    return msg.caller;
  };

  system func heartbeat() : async () {
    await autoConfirmDeals();
  };

};
