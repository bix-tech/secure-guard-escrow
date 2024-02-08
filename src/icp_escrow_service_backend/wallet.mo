import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import Result "mo:base/Result";
import Account "account";

module {
    public type Result<A, B> = Result.Result<A, B>;

    public type LockTokenResult = {
        #TokenLocked;
        #InsufficientBalance;
        #TokenReleased : Nat;
        #TokenNotLocked;
        #NotAuthorized;
        #DealNotPending;
        #DealNotFound;
    };

};