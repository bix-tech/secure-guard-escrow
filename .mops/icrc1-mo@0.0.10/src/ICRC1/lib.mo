import Array "mo:base/Array";
import Blob "mo:base/Blob";
import D "mo:base/Debug";
import EC "mo:base/ExperimentalCycles";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Nat8 "mo:base/Nat8";
import Option "mo:base/Option";
import Order "mo:base/Order";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Timer "mo:base/Timer";

import Itertools "mo:itertools/Iter";
import RepIndy "mo:rep-indy-hash";
import Star "mo:star/star";
import Vec "mo:vector";

import Account "Account";
import Migration "./migrations";
import MigrationTypes "./migrations/types";
import Utils "Utils";

/// The ICRC1 class defines the structure and functions necessary for creating and managing ICRC-1 compliant tokens on the Internet Computer.
/// It encapsulates the state and behavior of a token ledger which includes transfer, mint, and burn functionalities, as well
/// as metadata handling and tracking of transactions via ICRC-3 transaction logs.
module {

  /// Used to control debug printing for various actions.
  let debug_channel = {
    announce = false;
    transfer = false;
    accounts = false;
    standards = false;
    validation = false;
  };

  /// Exposes types from the migrations library to users of this module, allowing them to utilize these types in interacting
  /// with instances of ICRC1 tokens and their respective attributes and actions.
  public type State = MigrationTypes.State;

  // Imports from types to make code more readable
  public type CurrentState = MigrationTypes.Current.State;
  public type Environment = MigrationTypes.Current.Environment;

  public type Account = MigrationTypes.Current.Account;
  public type Balance = MigrationTypes.Current.Balance;
  public type Value = MigrationTypes.Current.Value;
  public type Subaccount = MigrationTypes.Current.Subaccount;
  public type AccountBalances = MigrationTypes.Current.AccountBalances;

  public type Transaction = MigrationTypes.Current.Transaction;
  public type Fee = MigrationTypes.Current.Fee;
  public type MetaData = MigrationTypes.Current.MetaData;
  public type TransferArgs = MigrationTypes.Current.TransferArgs;
  public type Mint = MigrationTypes.Current.Mint;
  public type BurnArgs = MigrationTypes.Current.BurnArgs;
  public type TransactionRequest = MigrationTypes.Current.TransactionRequest;
  public type TransactionRequestNotification = MigrationTypes.Current.TransactionRequestNotification;
  public type TransferError = MigrationTypes.Current.TransferError;

  public type SupportedStandard = MigrationTypes.Current.SupportedStandard;

  public type InitArgs = MigrationTypes.Current.InitArgs;
  public type AdvancedSettings = MigrationTypes.Current.AdvancedSettings;
  public type MetaDatum = MigrationTypes.Current.MetaDatum;
  public type TxLog = MigrationTypes.Current.TxLog;
  public type TxIndex = MigrationTypes.Current.TxIndex;
  public type CanTransfer = MigrationTypes.Current.CanTransfer;

  public type UpdateLedgerInfoRequest = MigrationTypes.Current.UpdateLedgerInfoRequest;

  public type TransferResult = MigrationTypes.Current.TransferResult;
  public type TokenTransferredListener = MigrationTypes.Current.TokenTransferredListener;
  public type TransferRequest = MigrationTypes.Current.TransactionRequest;

  /// Defines functions to create an initial state, versioning, and utilities for the token ledger.
  /// These are direct mappings from the Migration types library to provide an easy-to-use API surface for users of the ICRC1 class.
  public func initialState() : State { #v0_0_0(#data) };
  public let currentStateVersion = #v0_1_0(#id);

  // Initializes the state with default or migrated data and sets up other utilities such as maps and vector data structures.
  /// Also initializes helper functions and constants like hashing, account equality checks, and comparisons.
  public let init = Migration.migrate;

  //convienence variables to make code more readable
  public let Map = MigrationTypes.Current.Map;
  public let Set = MigrationTypes.Current.Set;
  public let Vector = MigrationTypes.Current.Vector;
  public let AccountHelper = Account;
  public let UtilsHelper = Utils;
  public let ahash = MigrationTypes.Current.ahash;
  public let account_eq = MigrationTypes.Current.account_eq;
  public let account_compare = MigrationTypes.Current.account_compare;
  public let account_hash32 = MigrationTypes.Current.account_hash32;

  //// The `ICRC1` class encapsulates the logic required for managing a token ledger, providing capabilities
  //// such as transferring tokens, getting account balances, and maintaining a log of transactions.
  //// It also supports minting and burning tokens while following compliance with the ICRC-1 standard.
  ////
  //// Parameters:
  //// - `stored`: An optional parameter that can be the previously stored state of the ledger for migration purposes.
  //// - `canister`: The `Principal` of the canister where this token ledger is deployed.
  //// - `environment`: Contextual information for the ledger such as fees and timestamp functions.
  public class ICRC1(stored : ?State, canister : Principal, environment : Environment) {

    /// Initializes the ledger state with either a new state or a given state for migration.
    /// This setup process involves internal data migration routines.
    var state : CurrentState = switch (stored) {
      case (null) {
        let #v0_1_0(#data(foundState)) = init(initialState(), currentStateVersion, null, canister);
        foundState;
      };
      case (?val) {
        let #v0_1_0(#data(foundState)) = init(val, currentStateVersion, null, canister);
        foundState;
      };
    };

    /// Holds the list of listeners that are notified when a token transfer takes place.
    /// This allows the ledger to communicate token transfer events to other canisters or entities that have registered an interest.
    private let token_transferred_listeners = Vec.new<(Text, TokenTransferredListener)>();

    //// Retrieves the full internal state of the token ledger.
    //// This state includes all balances, metadata, transaction logs, and other relevant financial and operational data.
    ////
    //// Returns:
    //// - `CurrentState`: The complete state data of the ledger.
    public func get_state() : CurrentState {
      return state;
    };

    /// Returns the array of local transactions. Does not scale use icrc3-mo for scalable archives
    ///
    /// Returns:
    /// - `Vector<Transaction>`: A vector containing the local transactions recorded in the ledger.
    public func get_local_transactions() : Vec.Vector<Transaction> {
      return state.local_transactions;
    };

    /// Returns the current environment settings for the ledger.
    ///
    /// Returns:
    /// - `Environment`: The environment context in which the ledger operates, encapsulating properties
    ///   like transfer fee calculation and timing functions.
    public func get_environment() : Environment {
      return environment;
    };

    /// Returns the name of the token for display.
    ///
    /// Returns:
    /// - `Text`: The token's name; or if not set, the default is the canister's principal in text form.
    public func name() : Text {
      switch (state.name) {
        case (?val) val;
        case (_) Principal.toText(canister);
      };
    };

    /// Returns the symbol of the token for display, e.g. "BTC" or "ETH".
    ///
    /// Returns:
    /// - `Text`: The token's symbol; or if not set, the default is the canister's principal in text form.
    public func symbol() : Text {
      switch (state.symbol) {
        case (?val) val;
        case (_) Principal.toText(canister);
      };
    };

    /// Returns the number of decimals the token uses for precision.
    ///
    /// Best Practice: 8
    ///
    /// Returns:
    /// - `Nat8`: The number of decimals used in token quantity representation.
    public func decimals() : Nat8 {
      state.decimals;
    };

    /// Returns the default or environment-specified transfer fee.
    ///
    /// Returns:
    /// - `Balance`: The fixed or computed fee for each token transfer.
    public func fee() : MigrationTypes.Current.Balance {
      switch (state._fee) {
        case (?val) switch (val) {
          case (#Fixed(val)) val;
          case (#Environment) {
            //calculated at runtime
            10000;
          };
        };
        case (_) 10000;
      };
    };

    /// `metadata`
    ///
    /// Retrieves all metadata associated with the token ledger, such as the symbol, name, and other relevant data.
    /// If no metadata is found, the method initializes default metadata based on the state and the canister Principal.
    ///
    /// Returns:
    /// `MetaData`: A record containing all metadata entries for this ledger.
    public func metadata() : [MetaDatum] {
      let md = switch (state.metadata) {
        case (?val) val;
        case (null) {
          let newdata = init_metadata();
          state.metadata := ?newdata;
          newdata;
        };
      };

      switch (state.metadata) {
        case (?val) {
          switch (val) {
            case (#Map(val)) val;
            case (_) D.trap("malformed metadata");
          };
        };
        case (null) { D.trap("unreachable metadata") };
      };
    };

    /// `register_metadata`
    ///
    /// Adds metadata to the metadata list from outside the class
    /// Used by ICRC2 and 3 to add metadata dataum.
    ///
    /// Returns:
    /// `MetaData`: A record containing all metadata entries for this ledger.
    public func register_metadata(request : [MetaDatum]) : [MetaDatum] {
      let md = switch (state.metadata) {
        case (?val) {
          switch (state.metadata) {
            case (?val) {
              switch (val) {
                case (#Map(val)) val;
                case (_)[];
              };
            };
            case (null)[];
          };
        };
        case (null)[];
      };

      let results = Map.new<Text, MetaDatum>();
      for (thisItem in md.vals()) {
        ignore Map.put(results, Map.thash, thisItem.0, thisItem);
      };

      for (thisItem in request.vals()) {
        ignore Map.put(results, Map.thash, thisItem.0, thisItem);
      };

      let finalresult = Iter.toArray<MetaDatum>(Map.vals(results));
      state.metadata := ? #Map(finalresult);
      return finalresult;
    };

    /// Creates a Vector with the default metadata and returns it.
    public func init_metadata() : MigrationTypes.Current.Value {
      let metadata = Vec.new<MigrationTypes.Current.MetaDatum>();
      Vec.add(
        metadata,
        (
          "icrc1:fee",
          #Nat(
            switch (state._fee) {
              case (null) 10000;
              case (?val) {
                switch (val) {
                  case (#Fixed(val)) val;
                  case (#Environment) 10000; //a lie as it is determined at runtime.
                };
              };
            }
          ),
        ),
      );
      Vec.add(
        metadata,
        (
          "icrc1:name",
          #Text(
            switch (state.name) {
              case (null) Principal.toText(canister);
              case (?val) val;
            }
          ),
        ),
      );

      Vec.add(
        metadata,
        (
          "icrc1:symbol",
          #Text(
            switch (state.symbol) {
              case (null) Principal.toText(canister);
              case (?val) val;
            }
          ),
        ),
      );
      Vec.add(metadata, ("icrc1:decimals", #Nat(Nat8.toNat(state.decimals))));

      switch (state.logo) {
        case (null) {};
        case (?val) {
          Vec.add(metadata, ("icrc1:logo", #Text(val)));
        };
      };

      let finalmetadata = register_metadata(Vec.toArray(metadata));

      #Map(finalmetadata);
    };

    /// Updates ledger information such as approval limitations with the provided request.
    /// - Parameters:
    ///     - request: `[UpdateLedgerInfoRequest]` - A list of requests containing the updates to be applied to the ledger.
    /// - Returns: `[Bool]` - An array of booleans indicating the success of each update request.
    public func update_ledger_info(request : [UpdateLedgerInfoRequest]) : [Bool] {

      //todo: Security at this layer?

      let results = Vec.new<Bool>();
      for (thisItem in request.vals()) {
        switch (thisItem) {

          case (#PermittedDrift(val)) { state.permitted_drift := val };
          case (#TransactionWindow(val)) { state.transaction_window := val };
          case (#Name(val)) { state.name := ?val };
          case (#Symbol(val)) { state.symbol := ?val };
          case (#Logo(val)) { state.logo := ?val };
          case (#Decimals(val)) { state.decimals := val };
          case (#MaxSupply(val)) { state.max_supply := val };
          case (#MaxMemo(val)) { state.max_memo := val };
          case (#MinBurnAmount(val)) { state.min_burn_amount := val };
          case (#MintingAccount(val)) { state.minting_account := val };
          case (#MaxAccounts(val)) { state.max_accounts := val };
          case (#SettleToAccounts(val)) { state.settle_to_accounts := val };
          case (#FeeCollector(val)) {
            state.fee_collector := val;
            state.fee_collector_emitted := false;
          };
          case (#Metadata(val)) {
            let md = metadata();
            let results = Map.new<Text, MetaDatum>();
            for (thisItem in md.vals()) {
              ignore Map.put(results, Map.thash, thisItem.0, thisItem);
            };
            switch (val.1) {
              case (?item) {
                ignore Map.put(results, Map.thash, val.0, (val.0, item));
              };
              case (null) {
                ignore Map.remove(results, Map.thash, val.0);
              };
            };

            let finalresult = Iter.toArray<MetaDatum>(Map.vals(results));
            state.metadata := ? #Map(finalresult);
          };
          case (#Fee(fee)) {
            state._fee := ?fee;
          };
        };
        Vec.add(results, true);
      };

      ignore init_metadata();
      return Vec.toArray(results);
    };

    /// `total_supply`
    ///
    /// Returns the current total supply of the circulating tokens by subtracting the number of burned tokens from the minted tokens.
    ///
    /// Returns:
    /// `Balance`: The total number of tokens currently in circulation.
    public func total_supply() : MigrationTypes.Current.Balance {
      state._minted_tokens - state._burned_tokens;
    };

    /// `minted_supply`
    ///
    /// Returns the total number of tokens that have been minted since the inception of the ledger.
    ///
    /// Returns:
    /// `Balance`: The total number of tokens minted.
    public func minted_supply() : MigrationTypes.Current.Balance {
      state._minted_tokens;
    };

    /// `burned_supply`
    ///
    /// Returns the total number of tokens that have been burned since the inception of the ledger.
    ///
    /// Returns:
    /// `Balance`: The total number of tokens burned.
    public func burned_supply() : MigrationTypes.Current.Balance {
      state._burned_tokens;
    };

    /// `max_supply`
    ///
    /// Returns the maximum supply of tokens that the ledger can support.
    /// If no maximum supply is set, the function returns `null`.
    ///
    /// Returns:
    /// `?Balance`: The maximum number of tokens that can exist, or `null` if there is no limit.
    public func max_supply() : ?MigrationTypes.Current.Balance {
      state.max_supply;
    };

    /// `minting_account`
    ///
    /// Retrieves the account designated for minting operations. If tokens are sent to this account, they are considered burned.
    ///
    /// Returns:
    /// `Account`: The account with the permission to mint and burn tokens.
    public func minting_account() : MigrationTypes.Current.Account {
      state.minting_account;
    };

    /// `balance_of`
    ///
    /// Retrieves the balance of the specified account.
    ///
    /// Parameters:
    /// - `account`: The account whose balance is being requested.
    ///
    /// Returns:
    /// `Balance`: The number of tokens currently held in the account.
    public func balance_of(account : MigrationTypes.Current.Account) : MigrationTypes.Current.Balance {
      Utils.get_balance(state.accounts, account);
    };

    /// `supported_standards`
    ///
    /// Provides a list of standards supported by the ledger, indicating compliance with various ICRC standards.
    ///
    /// Returns:
    /// `[SupportedStandard]`: An array of supported standards including their names and URLs.
    public func supported_standards() : [MigrationTypes.Current.SupportedStandard] {
      switch (state.supported_standards) {
        case (?val) {
          Vec.toArray(val);
        };
        case (null) {
          let base = Utils.init_standards();
          state.supported_standards := ?base;
          Vec.toArray(base);
        };
      };

    };

    /// `register_supported_standards`
    ///
    /// Adds a supported standard.
    ///
    /// Returns:
    /// `[SupportedStandard]`: An array of supported standards including their names and URLs.
    public func register_supported_standards(req : MigrationTypes.Current.SupportedStandard) : Bool {
      let current_standards = switch (state.supported_standards) {
        case (?val) val;
        case (null) {
          let base = Utils.init_standards();
          state.supported_standards := ?base;
          base;
        };
      };

      debug if (debug_channel.standards) D.print("registering a standard " # debug_show (req, Vec.toArray(current_standards)));

      let new_vec = Vec.new<MigrationTypes.Current.SupportedStandard>();
      var bFound = false;

      for (thisItem in Vec.vals(current_standards)) {
        if (thisItem.name == req.name) {
          debug if (debug_channel.standards) D.print("replacing standard");
          bFound := true;
          Vec.add(new_vec, req);
        } else {
          Vec.add(new_vec, thisItem);
        };
      };

      if (bFound == false) {
        Vec.add(new_vec, req);
      };

      state.supported_standards := ?new_vec;

      return true;
    };

    /// `add_local_ledger`
    ///
    /// Adds a transaction to the local transaction log and returns its index.
    ///
    /// Parameters:
    /// - `tx`: The transaction to add to the log.
    ///
    /// Returns:
    /// `Nat`: The index at which the transaction was added in the local log.
    public func add_local_ledger(tx : Transaction) : Nat {
      Vec.add(state.local_transactions, tx);
      Vec.size(state.local_transactions) - 1;
    };

    /// `transfer`
    ///
    /// Processes a token transfer request according to the provided arguments, handling both regular transfers and special cases like minting and burning.
    ///
    /// Parameters:
    /// - `args`: Details about the transfer including source, destination, amount, and other relevant data.
    /// - `caller`: The principal of the caller initiating the transfer.
    /// - `system_override`: A boolean that, if true, allows bypassing certain checks (reserved for system operations like cleaning up small balances).
    ///
    /// Returns:
    /// `TransferResult`: The result of the attempt to transfer tokens, either indicating success or providing error information.
    ///
    /// Warning: This function traps. we highly suggest using transfer_tokens to manage the returns and awaitstate change
    public func transfer(caller : Principal, args : MigrationTypes.Current.TransferArgs) : async* MigrationTypes.Current.TransferResult {
      return switch (await* transfer_tokens(caller, args, false, null)) {
        case (#trappable(val)) val;
        case (#awaited(val)) val;
        case (#err(#trappable(err))) D.trap(err);
        case (#err(#awaited(err))) D.trap(err);
      };
    };

    /// `transfer_tokens`
    ///
    /// Processes a token transfer request according to the provided arguments, handling both regular transfers and special cases like minting and burning.
    ///
    /// Parameters:
    /// - `args`: Details about the transfer including source, destination, amount, and other relevant data.
    /// - `caller`: The principal of the caller initiating the transfer.
    /// - `system_override`: A boolean that, if true, allows bypassing certain checks (reserved for system operations like cleaning up small balances).
    ///
    /// Returns:
    /// `TransferResult`: The result of the attempt to transfer tokens, either indicating success or providing error information.
    public func transfer_tokens(
      caller : Principal,
      args : MigrationTypes.Current.TransferArgs,
      system_override : Bool,
      can_transfer : CanTransfer,
    ) : async* Star.Star<MigrationTypes.Current.TransferResult, Text> {

      debug if (debug_channel.announce) D.print("in transfer");

      let from = {
        owner = caller;
        subaccount = args.from_subaccount;
      };

      let tx_kind = if (account_eq(from, state.minting_account)) {
        #mint;
      } else if (account_eq(args.to, state.minting_account)) {
        #burn;
      } else {
        #transfer;
      };

      let tx_req = Utils.create_transfer_req(args, caller, tx_kind);

      //when we create the transfer we should calculate the required fee. This should only be done once and used throughout the rest of the calcualtion

      let calculated_fee = switch (tx_req.kind) {
        case (#transfer) {
          get_fee(args);
        };
        case (_) {
          0;
        };
      };

      debug if (debug_channel.transfer) D.print("validating");
      switch (validate_request(tx_req, calculated_fee, system_override)) {
        case (#err(errorType)) {
          return #trappable(#Err(errorType));
        };
        case (#ok(_)) {};
      };

      let txMap = transfer_req_to_value(tx_req);
      let txTopMap = transfer_req_to_value_top(calculated_fee, tx_req);

      let pre_notification = {
        tx_req with
        calculated_fee = calculated_fee;
      };

      var bAwaited = false;

      let (finaltx, finaltxtop, notification) : (Value, ?Value, TransactionRequestNotification) = switch (await* handleCanTransfer(txMap, ?txTopMap, pre_notification, can_transfer)) {
        case (#trappable(val)) val;
        case (#awaited(val)) {
          bAwaited := true;
          debug if (debug_channel.transfer) D.print("handleCanTransfer awaited something " # debug_show (val));
          let override_fee = val.2.calculated_fee;
          //revalidate
          switch (validate_request(val.2, override_fee, system_override)) {
            case (#err(errorType)) {
              return #awaited(#Err(errorType));
            };
            case (#ok(_)) {};
          };
          val;
        };
        case (#err(val)) {
          debug if (debug_channel.transfer) D.print("handleCanTransfer gave us an error of " # debug_show (val));
          return val;
        };
      };

      let { amount; to } = notification;

      debug if (debug_channel.transfer) D.print("Moving tokens");

      var finaltxtop_var = finaltxtop;
      let final_fee = notification.calculated_fee;

      // process transaction
      switch (notification.kind) {
        case (#mint) {
          Utils.mint_balance(state, to, amount);
        };
        case (#burn) {
          Utils.burn_balance(state, from, amount);
        };
        case (#transfer) {
          Utils.transfer_balance(state, notification);

          // burn fee
          if (final_fee > 0) {
            switch (state.fee_collector) {
              case (null) {
                Utils.burn_balance(state, from, final_fee);
              };
              case (?val) {
                finaltxtop_var := switch (handleFeeCollector(final_fee, val, notification, finaltxtop)) {
                  case (#ok(val)) val;
                  case (#err(err)) {
                    if (bAwaited) {
                      return #awaited(#Err(#GenericError({ error_code = 6453; message = err })));
                    } else {
                      return #trappable(#Err(#GenericError({ error_code = 6453; message = err })));
                    };
                  };
                };
              };
            };
          };
        };
      };

      // store transaction
      let index = handleAddRecordToLedger(finaltx, finaltxtop_var, notification);

      let tx_final = Utils.req_to_tx(notification, index);

      if (calculated_fee > 0) setFeeCollectorBlock(index);

      //add trx for dedupe
      let trxhash = Blob.fromArray(RepIndy.hash_val(finaltx));

      debug if (debug_channel.transfer) D.print("attempting to add recent" # debug_show (trxhash, finaltx));

      ignore Map.put<Blob, (Nat64, Nat)>(state.recent_transactions, Map.bhash, trxhash, (get_time64(), index));

      handleBroadcastToListeners(tx_final, index);

      handleCleanUp();

      debug if (debug_channel.transfer) D.print("done transfer");
      if (bAwaited) {
        #awaited(#Ok(index));
      } else {
        #trappable(#Ok(index));
      };
    };

    /// Notifies all registered listeners about a token transfer event.
    ///
    /// Parameters:
    /// - `tx_final`: The final transaction that occurred on the ledger.
    /// - `index`: The index of the final transaction in the ledger.
    ///
    /// Returns:
    /// - Nothing (unit type).
    ///
    /// Remarks:
    /// - The function goes through the vector of registered token-transferred listeners and invokes their callback functions with the transaction details.
    public func handleBroadcastToListeners(tx_final : Transaction, index : Nat) : () {
      debug if (debug_channel.transfer) D.print("attempting to call listeners" # debug_show (Vec.size(token_transferred_listeners)));
      for (thisItem in Vec.vals(token_transferred_listeners)) {
        thisItem.1 (tx_final, index);
      };
    };

    /// Manages the transfer of the transaction fee to the designated fee collector account.
    ///
    /// Parameters:
    /// - `final_fee`: The fee to be transferred.
    /// - `fee_collector`: The account information of the fee collector.
    /// - `notification`: Notification containing the information about the transfer request and calculated fee.
    /// - `txtop`: Optional top layer information for transaction logging.
    ///
    /// Returns:
    /// - `Result<?Value, Text>`: The result of the fee transfer operation containing updated top layer information or an error message.
    ///
    /// Remarks:
    /// - If fee collection is enabled, this function is responsible for transferring the fee and updating the transaction information with fee collector details.
    public func handleFeeCollector(final_fee : Nat, fee_collector : Account, notification : TransactionRequestNotification, txtop : ?Value) : Result.Result<?Value, Text> {
      var finaltxtop_var = txtop;
      if (final_fee > 0) {
        if (state.fee_collector_emitted) {
          finaltxtop_var := switch (Utils.insert_map(finaltxtop_var, "fee_collector_block", #Nat(state.fee_collector_block))) {
            case (#ok(val)) ?val;
            case (#err(err)) return #err("unreachable map addition");
          };
        } else {
          finaltxtop_var := switch (Utils.insert_map(finaltxtop_var, "fee_collector", Utils.accountToValue(fee_collector))) {
            case (#ok(val)) ?val;
            case (#err(err)) return #err("unreachable map addition");
          };
        };

        Utils.transfer_balance(
          state,
          {
            notification with
            kind = #transfer;
            to = fee_collector;
            amount = final_fee;
          },
        );
      };

      #ok(finaltxtop_var);
    };

    /// Adds a transfer record to the ledger.
    ///
    /// Parameters:
    /// - `finaltx`: The transaction value to be added.
    /// - `finaltxtop`: Optional top layer data for the transaction log.
    /// - `notification`: The notification containing final transfer details.
    ///
    /// Returns:
    /// - `Nat`: The index of the added transaction record.
    ///
    /// Remarks:
    /// - Based on the environment settings, the transfer may be added to a local transaction log or processed through an external function for ledger recording.
    public func handleAddRecordToLedger(finaltx : Value, finaltxtop : ?Value, notification : TransactionRequestNotification) : Nat {
      switch (environment.add_ledger_transaction) {
        case (?add_ledger_transaction) {
          add_ledger_transaction(finaltx, finaltxtop);
        };
        case (null) {
          let tx = Utils.req_to_tx(notification, Vec.size(state.local_transactions));
          add_local_ledger(tx);
        };
      };
    };

    /// Sets the block index for the fee collector, ensuring it is set only once.
    ///
    /// Parameters:
    /// - `index`: The index of the transaction block related to fee collection.
    ///
    /// Returns:
    /// - Nothing (unit type).
    ///
    /// Remarks:
    /// - This function is used when fee collection pertains to a specific block transaction, recording its occurrence.
    public func setFeeCollectorBlock(index : Nat) {
      switch (state.fee_collector) {
        case (?val) {

          if (state.fee_collector_emitted) {} else {
            state.fee_collector_block := index;
            state.fee_collector_emitted := true;
          };

        };
        case (null) {};
      };
    };

    /// Checks if the ledger has too many accounts and triggers an account cleanup if necessary.
    ///
    /// Returns:
    /// - Nothing (unit type).
    ///
    /// Remarks:
    /// - If the ledger grows beyond 'max_accounts', older small balances are transferred to the minting account to tidy up the ledger.
    public func handleCleanUp() {
      debug if (debug_channel.transfer) D.print("cleaning");
      cleanUpRecents();
      switch (state.cleaning_timer) {
        case (null) {
          //only need one active timer
          debug if (debug_channel.transfer) D.print("setting clean up timer");
          state.cleaning_timer := ?Timer.setTimer(#seconds(0), checkAccounts);
        };
        case (_) {};
      };
    };

    /// Evaluates additional transfer validation rules if provided.
    ///
    /// Parameters:
    /// - `txMap`: Value representing the transfer.
    /// - `txTopMap`: Optional additional data for the transfer log.
    /// - `pre_notification`: The pre-transfer notification containing initial transfer information.
    /// - `canTransfer`: Optional rules to validate the transfer further.
    ///
    /// Returns:
    /// - A star-patterned response that may either contain the updated data or errors.
    ///
    /// Possible Responses:
    /// - Returns the original data if no additional rules are provided.
    /// - On calling a synchronous validation function, returns the result or any encountered error.
    /// - On calling an asynchronous validation function, either returns the result or goes into a waiting state for further handling.
    public func handleCanTransfer(txMap : Value, txTopMap : ?Value, pre_notification : TransactionRequestNotification, canTransfer : CanTransfer) : async* Star.Star<(Value, ?Value, TransactionRequestNotification), MigrationTypes.Current.TransferResult> {
      debug if (debug_channel.transfer) D.print("in handleCanTransfer awaited something ");
      switch (canTransfer) {
        case (null) {
          #trappable((txMap, txTopMap, pre_notification));
        };
        case (? #Sync(remote_func)) {
          switch (remote_func(txMap, txTopMap, pre_notification)) {
            case (#ok(val)) return #trappable((val.0, val.1, val.2));
            case (#err(tx)) return #err(#trappable(#Err(#GenericError({ error_code = 6453; message = tx }))));
          };
        };
        case (? #Async(remote_func)) {
          debug if (debug_channel.transfer) D.print("in handleCanTransfer awaiting something ");
          switch (await* remote_func(txMap, txTopMap, pre_notification)) {
            case (#trappable(val)) #trappable((val.0, val.1, val.2));
            case (#awaited(val)) {
              #awaited((val.0, val.1, val.2));
            };
            case (#err(#awaited(tx))) {
              debug if (debug_channel.transfer) D.print("awaited error " # debug_show (tx));
              return #err(#awaited(#Err(#GenericError({ error_code = 6453; message = tx }))));
            };
            case (#err(#trappable(tx))) {
              debug if (debug_channel.transfer) D.print("trappable error " # debug_show (tx));
              return #err(#trappable(#Err(#GenericError({ error_code = 6453; message = tx }))));
            };
          };
        };
      };
    };

    /// `mint`
    ///
    /// Allows the minting account to create new tokens and add them to a specified beneficiary account.
    ///
    /// Parameters:
    /// - `args`: Minting arguments including the destination account and the amount to mint.
    /// - `caller`: The principal of the caller requesting the mint operation.
    ///
    /// Returns:
    /// `TransferResult`: The result of the mint operation, either indicating success or providing error information.
    ///
    /// Warning: This function traps. we highly suggest using transfer_tokens to manage the returns and awaitstate change
    public func mint(caller : Principal, args : MigrationTypes.Current.Mint) : async* MigrationTypes.Current.TransferResult {
      switch (await* mint_tokens(caller, args)) {
        case (#trappable(val)) val;
        case (#awaited(val)) val;
        case (#err(#trappable(err))) D.trap(err);
        case (#err(#awaited(err))) D.trap(err);
      };
    };

    /// `mint`
    ///
    /// Allows the minting account to create new tokens and add them to a specified beneficiary account.
    ///
    /// Parameters:
    /// - `args`: Minting arguments including the destination account and the amount to mint.
    /// - `caller`: The principal of the caller requesting the mint operation.
    ///
    /// Returns:
    /// `TransferResult`: The result of the mint operation, either indicating success or providing error information.
    public func mint_tokens(caller : Principal, args : MigrationTypes.Current.Mint) : async* Star.Star<MigrationTypes.Current.TransferResult, Text> {

      if (caller != state.minting_account.owner) {
        return #trappable(
          #Err(
            #GenericError {
              error_code = 401;
              message = "Unauthorized: Only the minting_account can mint tokens.";
            }
          )
        );
      };

      let transfer_args : MigrationTypes.Current.TransferArgs = {
        args with from_subaccount = state.minting_account.subaccount;
        fee = null;
      };
      //todo: override on initial mint?
      await* transfer_tokens(caller, transfer_args, false, null);
    };

    /// `burn`
    ///
    /// Allows an account to burn tokens by transferring them to the minting account and removing them from the total token supply.
    ///
    /// Parameters:
    /// - `args`: Burning arguments including the amount to burn.
    /// - `caller`: The principal of the caller requesting the burn operation.
    ///
    /// Returns:
    /// `TransferResult`: The result of the burn operation, either indicating success or providing error information.
    /// Warning: This function traps. we highly suggest using transfer_tokens to manage the returns and awaitstate change
    public func burn(caller : Principal, args : MigrationTypes.Current.BurnArgs) : async* MigrationTypes.Current.TransferResult {
      switch (await* burn_tokens(caller, args, false)) {
        case (#trappable(val)) val;
        case (#awaited(val)) val;
        case (#err(#trappable(err))) D.trap(err);
        case (#err(#awaited(err))) D.trap(err);
      };
    };

    /// `burn`
    ///
    /// Allows an account to burn tokens by transferring them to the minting account and removing them from the total token supply.
    ///
    /// Parameters:
    /// - `args`: Burning arguments including the amount to burn.
    /// - `caller`: The principal of the caller requesting the burn operation.
    /// - `system_override`: A boolean that allows bypassing the minimum burn amount check if true. Reserved for system operations.
    ///
    /// Returns:
    /// `TransferResult`: The result of the burn operation, either indicating success or providing error information.
    public func burn_tokens(caller : Principal, args : MigrationTypes.Current.BurnArgs, system_override : Bool) : async* Star.Star<MigrationTypes.Current.TransferResult, Text> {
      let transfer_args : MigrationTypes.Current.TransferArgs = {
        args with
        to = state.minting_account;
        fee : ?Balance = null;
      };

      await* transfer_tokens(caller, transfer_args, system_override, null);
    };

    /// # testMemo
    ///
    /// Validates the size of the memo field to ensure it doesn't exceed the allowed number of bytes.
    ///
    /// ## Parameters
    ///
    /// - `val`: `?Blob` - The memo blob to be tested. This parameter can be `null` if no memo is provided.
    ///
    /// ## Returns
    ///
    /// `??Blob` - An optional optional blob which will return `null` if the blob size exceeds the
    /// allowed maximum, or the blob itself if it's of a valid size.
    ///
    /// ## Remarks
    ///
    /// This function compares the size of the memo blob against the `max_memo` limit defined in the ledger's environment state.
    ///
    public func testMemo(val : ?Blob) : ??Blob {
      switch (val) {
        case (null) return ?null;
        case (?val) {
          let max_memo = state.max_memo;
          if (val.size() > max_memo) {
            return null;
          };
          return ??val;
        };
      };
    };

    /// `is_too_old`
    ///
    /// Checks whether the `created_at_time` of a transfer request is too old according to the ledger's permitted time range.
    ///
    /// Parameters:
    /// - `created_at_time`: The timestamp denoting when the transfer was initiated.
    ///
    /// Returns:
    /// `Bool`: True if the transaction is considered too old, false otherwise.
    public func is_too_old(created_at_time : Nat64) : Bool {
      debug if (debug_channel.validation) D.print("testing is_too_old");
      let current_time : Nat64 = get_time64();
      debug if (debug_channel.validation) D.print("current time is" # debug_show (current_time, state.transaction_window, state.permitted_drift));
      let lower_bound = current_time - state.transaction_window - state.permitted_drift;
      created_at_time < lower_bound;
    };

    /// `is_in_future`
    ///
    /// Determines if the `created_at_time` of a transfer request is set in the future relative to the ledger's clock.
    ///
    /// Parameters:
    /// - `created_at_time`: The timestamp to validate against the current ledger time.
    ///
    /// Returns:
    /// `Bool`: True if the timestamp is in the future, false otherwise.
    public func is_in_future(created_at_time : Nat64) : Bool {
      debug if (debug_channel.validation) D.print("testing is_in_future" # debug_show (created_at_time, state.permitted_drift, get_time64()));
      let current_time : Nat64 = get_time64();
      let upper_bound = current_time + state.permitted_drift;
      created_at_time > upper_bound;
    };

    /// `find_dupe`
    ///
    /// Searches for a duplicate transaction using the provided hash.
    ///
    /// Parameters:
    /// - `trxhash`: The hash of the transaction to find.
    ///
    /// Returns:
    /// - `?Nat`: An optional index of the duplicated transaction or null if no duplicate is found.
    public func find_dupe(trxhash : Blob) : ?Nat {
      switch (Map.get<Blob, (Nat64, Nat)>(state.recent_transactions, Map.bhash, trxhash)) {
        case (?found) {
          if (found.0 + state.permitted_drift + state.transaction_window > get_time64()) {
            return ?found.1;
          };
        };
        case (null) {};
      };
      return null;
    };

    /// `deduplicate`
    ///
    /// Checks if a transaction request is a duplicate of an existing transaction based on the hashing of its contents.
    /// If a duplicate is found, it returns an error with the transaction index.
    ///
    /// Parameters:
    /// - `tx_req`: The transaction request to check for duplication.
    ///
    /// Returns:
    /// - `Result<(), Nat>`: Returns `#ok` if no duplicate is found, or `#err` with the index of the duplicate.
    public func deduplicate(tx_req : MigrationTypes.Current.TransactionRequest) : Result.Result<(), Nat> {

      let trxhash = Blob.fromArray(RepIndy.hash_val(transfer_req_to_value(tx_req)));
      debug if (debug_channel.validation) D.print("attempting to deduplicate" # debug_show (trxhash, tx_req));

      switch (find_dupe(trxhash)) {
        case (?found) {
          return #err(found);
        };
        case (null) {};
      };
      #ok();
    };

    /// `cleanUpRecents`
    ///
    /// Iterates through and removes transactions from the 'recent transactions' index that are no longer within the permitted drift.
    public func cleanUpRecents() : () {
      label clean for (thisItem in Map.entries(state.recent_transactions)) {
        if (thisItem.1.0 + state.transaction_window < get_time64()) {
          //we can remove this item;
          ignore Map.remove(state.recent_transactions, Map.bhash, thisItem.0);
        } else {
          //items are inserted in order in this map so as soon as we hit a still valid item, the rest of the list should still be valid as well
          break clean;
        };
      };
    };

    /// `checkAccounts`
    ///
    /// Iterates over the ledger accounts and transfers balances below a set threshold to the minting account.
    /// It's meant to clean up small balances and is called periodically according to a set timer.
    public func checkAccounts() : async () {
      debug if (debug_channel.accounts) D.print("in check accounts");
      if (Map.size(state.accounts) > state.max_accounts) {
        debug if (debug_channel.accounts) D.print("cleaning accounts");
        let comp = func(a : (Account, Nat), b : (Account, Nat)) : Order.Order {
          return Nat.compare(a.1, b.1);
        };
        label clean for (thisItem in Iter.sort(Map.entries(state.accounts), comp)) {
          debug if (debug_channel.accounts) D.print("inspecting item" # debug_show (thisItem));
          let result = await* transfer_tokens(
            thisItem.0.owner,
            {
              from_subaccount = thisItem.0.subaccount;
              to = state.minting_account;
              amount = thisItem.1;
              fee = null;
              memo = ?Text.encodeUtf8("clean");
              created_at_time = null;
            },
            true,
            null,
          );

          debug if (debug_channel.accounts) D.print("inspecting result " # debug_show (result));

          switch (result) {
            case (#err(_)) {
              //don't waste cycles. something is wrong
              //todo: add notification
              return;
            };
            case (_) {};
          };

          if (Map.size(state.accounts) <= state.settle_to_accounts) {
            break clean;
          };
        };
      };
    };

    /// `validate_fee`
    ///
    /// Validates the fee specified in a transaction request against the calculated fee based on the ledger's fee policy.
    ///
    /// Parameters:
    /// - `calculated_fee`: The fee calculated by the ledger for a transaction.
    /// - `opt_fee`: The optional fee specified in the transaction request by the user.
    ///
    /// Returns:
    /// - `Bool`: True if the fee is valid, false if it doesn't meet the required threshold.
    public func validate_fee(
      calculated_fee : MigrationTypes.Current.Balance,
      opt_fee : ?MigrationTypes.Current.Balance,
    ) : Bool {
      switch (opt_fee) {
        case (?tx_fee) {
          if (tx_fee < calculated_fee) {
            return false;
          };
        };
        case (null) {};
      };

      true;
    };

    /// `get_fee`
    ///
    /// Retrieves the appropriate transfer fee for a given transaction request.
    ///
    /// Parameters:
    /// - `request`: The transfer request which includes the amount and potential fee parameters.
    ///
    /// Returns:
    /// - `Nat`: The required transfer fee for the specified transaction request.
    public func get_fee(request : TransferArgs) : Nat {
      switch (state._fee) {
        case (?fee) {
          switch (fee) {
            case (#Fixed(val)) {
              switch (request.fee) {
                case (null) val;
                case (?user_fee) {
                  Nat.max(val, user_fee);
                };
              };
            };
            case (#Environment) {
              switch (environment.get_fee) {
                case (?get_fee_env) {
                  let val = get_fee_env(state, environment, request);
                  switch (request.fee) {
                    case (null) val;
                    case (?user_fee) {
                      Nat.max(val, user_fee);
                    };
                  };
                };
                case (_) {
                  10000;
                };
              };
            };
          };
        };
        case (null) {
          10000;
        };
      };
    };

    /// # testCreatedAt
    ///
    /// Validates a provided creation timestamp to ensure it's neither too old nor too far into the future,
    /// relative to the ledger's time and a permissible drift amount.
    ///
    /// ## Parameters
    ///
    /// - `val`: `?Nat64` - The creation timestamp to be tested. Can be `null` for cases when the timestamp is not provided.
    /// - `environment`: `Environment` - The environment settings that provide context such as permitted drift and the current ledger time.
    ///
    /// ## Returns
    ///
    /// A variant indicating success or specific error conditions:
    /// - `#ok`: `?Nat64` - An optional containing the provided timestamp if valid.
    /// - `#Err`: `{#TooOld; #InTheFuture: Nat64}` - Error variant indicating if the timestamp is too old or too far in the future.
    ///
    /// ## Remarks
    ///
    /// This function uses the ledger's permissible drift value from the environment to assess timestamp validity.
    ///
    public func testCreatedAt(val : ?Nat64) : {
      #ok : ?Nat64;
      #Err : { #TooOld; #InTheFuture : Nat64 };

    } {
      switch (val) {
        case (null) return #ok(null);
        case (?val) {
          if (is_in_future(val)) {
            return #Err(#InTheFuture(get_time64()));
          };
          if (is_too_old(val)) {
            return #Err(#TooOld);
          };
          return #ok(?val);
        };
      };
    };

    /// `validate_request`
    ///
    /// Perform checks against a transfer request to ensure it meets all the criteria for a valid and secure transfer.
    /// Checks include account validation, memo size, balance sufficiency, mint constraints, burn constraints, and deduplication.
    ///
    /// Parameters:
    /// - `tx_req`: The transaction request to validate.
    /// - `calculated_fee`: The calculated fee for the transaction.
    /// - `system_override`: If true, allows bypassing certain checks for system-level operations.
    ///
    /// Returns:
    /// - `Result<(), TransferError>`: Returns `#ok` if the request is valid, or `#err` with the appropriate error if any check fails.
    public func validate_request(
      tx_req : MigrationTypes.Current.TransactionRequest,
      calculated_fee : MigrationTypes.Current.Balance,
      system_override : Bool,
    ) : Result.Result<(), MigrationTypes.Current.TransferError> {

      debug if (debug_channel.validation) D.print("in validate_request");

      if (tx_req.from == tx_req.to) {
        return #err(
          #GenericError({
            error_code = 1;
            message = "The sender cannot have the same account as the recipient.";
          })
        );
      };

      if (not Account.validate(tx_req.from)) {
        return #err(
          #GenericError({
            error_code = 2;
            message = "Invalid account entered for sender. " # debug_show (tx_req.from);
          })
        );
      };

      if (not Account.validate(tx_req.to)) {
        return #err(
          #GenericError({
            error_code = 3;
            message = "Invalid account entered for recipient " # debug_show (tx_req.to);
          })
        );
      };

      debug if (debug_channel.validation) D.print("Checking memo");

      if (testMemo(tx_req.memo) == null) {
        return #err(
          #GenericError({
            error_code = 4;
            message = "Memo must not be more than " # debug_show (state.max_memo) # " bytes";
          })
        );
      };

      if (tx_req.amount == 0) {
        return #err(
          #GenericError({
            error_code = 5;
            message = "Amount must be greater than 0";
          })
        );
      };

      debug if (debug_channel.validation) D.print("starting filter");
      label filter switch (tx_req.kind) {
        case (#transfer) {
          debug if (debug_channel.validation) D.print("validating fee");
          if (not validate_fee(calculated_fee, tx_req.fee)) {
            return #err(
              #BadFee {
                expected_fee = calculated_fee;
              }
            );
          };

          let final_fee = switch (tx_req.fee) {
            case (null) calculated_fee;
            case (?val) val;
          };

          debug if (debug_channel.validation) D.print("getting balance");
          let balance : MigrationTypes.Current.Balance = Utils.get_balance(
            state.accounts,
            tx_req.from,
          );

          debug if (debug_channel.validation) D.print("found balance" # debug_show (balance));

          if (tx_req.amount + final_fee > balance) {
            return #err(#InsufficientFunds { balance });
          };
        };

        case (#mint) {

          let ?max_supply = state.max_supply else break filter;

          if (max_supply < state._minted_tokens + tx_req.amount) {
            let remaining_tokens = (max_supply - state._minted_tokens) : Nat;

            return #err(
              #GenericError({
                error_code = 6;
                message = "Cannot mint more than " # Nat.toText(remaining_tokens) # " tokens";
              })
            );
          };

        };
        case (#burn) {

          let balance : MigrationTypes.Current.Balance = Utils.get_balance(
            state.accounts,
            tx_req.from,
          );

          if (balance < tx_req.amount) {
            return #err(#InsufficientFunds { balance });
          };

          let ?min_burn_amount = state.min_burn_amount else break filter;

          if (system_override == false and tx_req.to == state.minting_account and tx_req.amount < min_burn_amount) {
            return #err(
              #BadBurn { min_burn_amount = min_burn_amount }
            );
          };
        };
      };

      debug if (debug_channel.validation) D.print("testing Time");
      switch (testCreatedAt(tx_req.created_at_time)) {
        case (#ok(val)) {
          switch (val) {
            case (null) {};
            case (?val) {
              //according to icrc-1, if created at time is null, don't deduplicate.
              switch (deduplicate(tx_req)) {
                case (#err(tx_index)) {
                  return #err(
                    #Duplicate {
                      duplicate_of = tx_index;
                    }
                  );
                };
                case (_) {};
              };
            };
          };
        };
        case (#Err(#TooOld)) {
          return #err(#TooOld);
        };
        case (#Err(#InTheFuture(val))) {
          return #err(
            #CreatedInFuture {
              ledger_time = get_time64();
            }
          );
        };
      };

      debug if (debug_channel.validation) D.print("done validate");
      #ok();
    };

    /// `transfer_req_to_value`
    ///
    /// Converts a transaction request into a `Value` type that can be processed by an ICRC-3 transaction log.
    ///
    /// Parameters:
    /// - `request`: The transaction request to convert.
    ///
    /// Returns:
    /// - `Value`: The transaction request converted to a `Value` type suitable for logs.
    public func transfer_req_to_value(request : TransactionRequest) : Value {
      let trx = Vec.new<(Text, Value)>();

      Vec.add(trx, ("amt", #Nat(request.amount)));

      switch (request.kind) {
        case (#mint) {
          Vec.add(trx, ("op", #Text("mint")));
          Vec.add(trx, ("to", Utils.accountToValue(request.to)));
        };
        case (#burn) {
          Vec.add(trx, ("op", #Text("burn")));
          Vec.add(trx, ("from", Utils.accountToValue(request.from)));
        };
        case (#transfer) {
          Vec.add(trx, ("op", #Text("xfer")));
          Vec.add(trx, ("to", Utils.accountToValue(request.to)));
          Vec.add(trx, ("from", Utils.accountToValue(request.from)));
        };
      };

      switch (request.fee) {
        case (null) {};
        case (?val) {
          Vec.add(trx, ("fee", #Nat(val)));
        };
      };

      switch (request.created_at_time) {
        case (null) {};
        case (?val) {
          Vec.add(trx, ("ts", #Nat(Nat64.toNat(val))));
        };
      };

      switch (request.memo) {
        case (null) {};
        case (?val) {
          Vec.add(trx, ("memo", #Blob(val)));
        };
      };

      let vTrx = #Map(Vec.toArray(trx));

      return vTrx;
    };

    /// `get_time64`
    ///
    /// Retrieves the current time in nanoseconds in a 64-bit unsigned integer format.
    ///
    /// Returns:
    /// - `Nat64`: The current ledger time.
    public func get_time64() : Nat64 {
      return Utils.get_time64(environment);
    };

    /// `transfer_req_to_value_top`
    ///
    /// Converts a transaction request with an additional layer that includes calculated fee information, meant for ICRC-3 transaction log top layer.
    ///
    /// Parameters:
    /// - `calculated_fee`: The calculated fee for the transaction to include.
    /// - `request`: The transaction request to convert.
    ///
    /// Returns:
    /// - `Value`: The transaction request converted to a top layer `Value` type suitable for logs.
    public func transfer_req_to_value_top(calculated_fee : MigrationTypes.Current.Balance, request : TransactionRequest) : Value {
      let trx = Vec.new<(Text, Value)>();

      switch (request.fee) {
        case (null) {
          if (calculated_fee > 0) {
            Vec.add(trx, ("fee", #Nat(calculated_fee)));
          };
        };
        case (?val) {};
      };

      Vec.add(trx, ("ts", #Nat(Nat64.toNat(get_time64()))));

      let vTrx = #Map(Vec.toArray(trx));

      return vTrx;
    };

    //events

    type Listener<T> = (Text, T);

    /// Generic function to register a listener.
    ///
    /// Parameters:
    ///     namespace: Text - The namespace identifying the listener.
    ///     remote_func: T - A callback function to be invoked.
    ///     listeners: Vec<Listener<T>> - The list of listeners.
    public func register_listener<T>(namespace : Text, remote_func : T, listeners : Vec.Vector<Listener<T>>) {
      let listener : Listener<T> = (namespace, remote_func);
      switch (
        Vec.indexOf<Listener<T>>(
          listener,
          listeners,
          func(a : Listener<T>, b : Listener<T>) : Bool {
            Text.equal(a.0, b.0);
          },
        )
      ) {
        case (?index) {
          Vec.put<Listener<T>>(listeners, index, listener);
        };
        case (null) {
          Vec.add<Listener<T>>(listeners, listener);
        };
      };
    };

    /// `register_listener`
    ///
    /// Registers a new listener or updates an existing one in the provided `listeners` vector.
    ///
    /// Parameters:
    /// - `namespace`: A unique namespace used to identify the listener.
    /// - `remote_func`: The listener's callback function.
    /// - `listeners`: The vector of existing listeners that the new listener will be added to or updated in.
    public func register_token_transferred_listener(namespace : Text, remote_func : TokenTransferredListener) {
      register_listener<TokenTransferredListener>(namespace, remote_func, token_transferred_listeners);
    };
  };
};
