import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import Result "mo:base/Result";
import Account "account";

actor {
    let ledger : TrieMap.TrieMap<Account.Account, Nat> = TrieMap.TrieMap(Account.accountsEqual, Account.accountsHash);
    let lockedTokens : TrieMap.TrieMap<Account.Account, Nat> = TrieMap.TrieMap(Account.accountsEqual, Account.accountsHash);
    public type Result<A, B> = Result.Result<A, B>;
    
    public type LockTokenResult = {
        #TokenLocked;
        #InsufficientBalance;
        #TokenReleased : Nat;
    };

    public shared ({ caller }) func checkToken(principal : Principal) : async ?Nat {
        let defaultAccount = { owner = principal; subaccount = null };
        return ledger.get(defaultAccount);
    };

    public shared ({ caller }) func lockToken(principal : Principal, amount : Nat) : async LockTokenResult {
        let defaultAccount = { owner = principal; subaccount = null };
        let balance = ledger.get(defaultAccount);

        switch (balance) {
            case (null) {
                return #InsufficientBalance;
            };
            case (?balance) {
                if (balance < amount) {
                    return #InsufficientBalance;
                } else {
                    ledger.put(defaultAccount, balance - amount);
                    lockedTokens.put(defaultAccount, amount);
                    return #TokenLocked;
                };
            };
        };
    };

    public shared ({ caller }) func releaseToken(principal : Principal) : async LockTokenResult {
        let defaultAccount = { owner = principal; subaccount = null };
        let lockedAmount = lockedTokens.get(defaultAccount);

        switch (lockedAmount) {
            case (null) {
                return #InsufficientBalance;
            };
            case (?lockedAmount) {
                let balance = ledger.get(defaultAccount);

                switch (balance) {
                    case (null) {
                        return #InsufficientBalance;
                    };
                    case (?balance) {
                        ledger.put(defaultAccount, balance + lockedAmount);
                        let _ = lockedTokens.remove(defaultAccount);
                        return #TokenReleased(lockedAmount);
                    };
                };
            };
        };
    };

};
