import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Hash "mo:base/Hash";

actor {

  let ledger : TrieMap.TrieMap<Principal, Nat> = TrieMap.TrieMap(Principal.equal, Principal.hash);

  public type Result<A, B> = Result.Result<A, B>;

  public type HashMap<K, V> = HashMap.HashMap<K, V>;

  public type TrieMap<K, V> = TrieMap.TrieMap<K, V>;

  public type createDealResult = Result<CreateDealOk, CreateDealErr>;

  public type CreateDealOk = {
    #CreateDealOk;
  };

  public type CreateDealErr = {
    #CreateDealErr;
  };

  var nextDealId : Nat = 1;

  let deals : TrieMap.TrieMap<Nat, Deal> = TrieMap.TrieMap(Nat.equal, Hash.hash);

  public type DealStatus = {
    #Pending;
    #Confirmed;
    #Cancelled;
  };

  public type Deal = {
    status : DealStatus;
    name : Text;
    from : Principal;
    to : Principal;
    amount : Nat;
    picture : Text;
    description : Text;
    dealCategory : Text;
    dealType : Text;
    dealTimeline : Text;
  };

  public shared ({ caller }) func createDeal(newDeal : Deal) : async createDealResult {
    let dealToCreate = {
      id = nextDealId;
      status = #Pending;
      name = newDeal.name;
      from = newDeal.from;
      to = newDeal.to;
      amount = newDeal.amount;
      picture = newDeal.picture;
      description = newDeal.description;
      dealCategory = newDeal.dealCategory;
      dealType = newDeal.dealType;
      dealTimeline = newDeal.dealTimeline;
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

  public shared ({ caller}) func getDealStatus(dealId : Nat) : async Result<DealStatus, Text> {
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
  

  public shared (msg) func callerPrincipal() : async Principal {
    return msg.caller;
  };

};
