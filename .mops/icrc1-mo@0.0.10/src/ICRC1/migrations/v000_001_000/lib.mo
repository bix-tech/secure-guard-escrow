import D "mo:base/Debug";
import Opt "mo:base/Option";
import Itertools "mo:itertools/Iter";
import Map "mo:map9/Map";
import Vec "mo:vector";

import Account "../../Account";
import Utils "../../Utils";
import MigrationTypes "../types";
import v0_1_0 "types";

module {

  type Transaction = v0_1_0.Transaction;
  type Account = v0_1_0.Account;
  type Balance = v0_1_0.Balance;

  let ahash = v0_1_0.ahash;


  public func upgrade(prevmigration_state: MigrationTypes.State, args: MigrationTypes.Args, caller: Principal): MigrationTypes.State {

    let {
        name;
        symbol;
        logo;
        decimals;
        fee;
        minting_account;
        max_supply;
        min_burn_amount;
        advanced_settings;
        metadata;
        fee_collector;
        max_memo;
        permitted_drift;
        transaction_window;
        max_accounts;
        settle_to_accounts;
    } = switch(args){
      case(?args) {
        {
          args with
          max_memo = Opt.get<Nat>(args.max_memo, 384);
          permitted_drift : Nat64 = Opt.get<Nat64>(args.permitted_drift, 60_000_000_000 : Nat64);
          transaction_window : Nat64 = Opt.get<Nat64>(args.transaction_window, 86_400_000_000_000 : Nat64);
          max_accounts = Opt.get<Nat>(args.max_accounts, 5_000_000);
          settle_to_accounts = Opt.get<Nat>(args.settle_to_accounts, 4_990_000);
        }
      };
      case(null) {{
           name = null;
          symbol = null;
          logo = null;
          decimals = 8 : Nat8;
          fee = null;
          minting_account = null;
          max_supply = null;
          existing_balances = [];
          min_burn_amount = null;
          advanced_settings = null;
          metadata = null;
          max_memo = 384 : Nat;
          fee_collector = null;
          permitted_drift : Nat64 = 60_000_000_000 : Nat64;
          transaction_window : Nat64 = 86_400_000_000_000 : Nat64;
          max_accounts = 5_000_000;
          settle_to_accounts = 4_990_000;
        }
      };
    };

    var existing_balances =switch(advanced_settings){
      case(null) [];
      case(?val) val.existing_balances;
    };
    var local_transactions =switch(advanced_settings){
      case(null) [];
      case(?val) val.local_transactions;
    };
    
     var _burned_tokens = switch(advanced_settings){
        case(null) 0;
        case(?val) val.burned_tokens;
      };
      var _minted_tokens = switch(advanced_settings){
        case(null) 0;
        case(?val) val.minted_tokens;
      };

      let accounts = Map.fromIter<Account, Balance>(existing_balances.vals(), ahash);

      let parsed_minting_account = switch(minting_account){
        case(?minting_account){
          if (not Account.validate(minting_account)) {
            D.trap("minting_account is invalid");
          };
          minting_account;
        };
        case(null) {
          {
            owner = caller;
            subaccount = null;
          };
        };
      };

    let state : MigrationTypes.Current.State = {
      var _burned_tokens = _burned_tokens;
      var _minted_tokens = _minted_tokens;
      var permitted_drift = permitted_drift;
      var transaction_window = transaction_window;
      var accounts = accounts;
      var name = name;
      var symbol = symbol;
      var logo = logo;
      var decimals = decimals;
      var _fee = fee;
      var max_supply = max_supply;
      var max_accounts = max_accounts;
      var settle_to_accounts = settle_to_accounts;
      var cleaning_timer = null;
      var min_burn_amount = min_burn_amount;
      var minting_account = parsed_minting_account;
      var max_memo = max_memo;
      var metadata = metadata;
      var fee_collector = fee_collector;
      var supported_standards = ?Utils.init_standards();
      var local_transactions = Vec.fromIter(local_transactions.vals());
      var recent_transactions = Map.new<Blob, (Nat64, Nat)>();
      var fee_collector_block = 0;
      var fee_collector_emitted = false;
    };

    

    return #v0_1_0(#data(state));
  };

  public func downgrade(prev_migration_state: MigrationTypes.State, args: MigrationTypes.Args, caller: Principal): MigrationTypes.State {

    return #v0_0_0(#data);
  };

};