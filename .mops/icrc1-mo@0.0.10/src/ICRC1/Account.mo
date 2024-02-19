import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Char "mo:base/Char";
import Debug "mo:base/Debug";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

import ArrayModule "mo:array/Array";
import Itertools "mo:itertools/Iter";
import AccountTools "mo:account";


import MigrationTypes "/migrations/types";

module {
    type Iter<A> = Iter.Iter<A>;

    /// Checks if a subaccount is valid
    public func validate_subaccount(subaccount : ?MigrationTypes.Current.Subaccount) : Bool {
        switch (subaccount) {
            case (?bytes) {
                bytes.size() == 32;
            };
            case (_) true;
        };
    };

    /// Checks if an account is valid
    public func validate(account : MigrationTypes.Current.Account) : Bool {
        let is_anonymous = Principal.isAnonymous(account.owner);
        let invalid_size = Principal.toBlob(account.owner).size() > 29;

        if (is_anonymous or invalid_size) {
            false;
        } else {
            validate_subaccount(account.subaccount);
        };
    };

    /// Implementation of ICRC1's Textual representation of accounts [Encoding Standard](https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1#encoding)
    public func encodeAccount(account : MigrationTypes.Current.Account) : Text {
        AccountTools.toText(account)
    };

    /// Implementation of ICRC1's Textual representation of accounts [Decoding Standard](https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1#decoding)
    public func decodeAccount(encoded : Text) : Result.Result<MigrationTypes.Current.Account, AccountTools.ParseError>  {
        AccountTools.fromText(encoded);
    };
};
