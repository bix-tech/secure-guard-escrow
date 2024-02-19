// please do not import any types from your project outside migrations folder here
// it can lead to bugs when you change those types later, because migration types should not be changed
// you should also avoid importing these types anywhere in your project directly from here
// use MigrationTypes.Current property instead

import Blob "mo:base/Blob";
import D "mo:base/Debug";
import Order "mo:base/Order";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import MapLib "mo:map9/Map";
import SetLib "mo:map9/Set";
import Star "mo:star/star";
import VecLib "mo:vector";

module {

  /// `TxIndex`
  ///
  /// A type alias representing the index of a transaction in the transaction log.  
  public type TxIndex = Nat;

  public let Vector = VecLib;
  public let Map = MapLib;
  public let Set = SetLib;


  /// `State`
  ///
  /// Represents the mutable state of the ICRC-1 token ledger, including all necessary variables for its operation.
  /// It records various aspects of the ledger, like burned and minted tokens, time restrictions for transactions,
  /// account information, and environmental settings for fee calculations and more.
  public type State = {
    var _burned_tokens : Nat;
    var _minted_tokens : Nat;
    var permitted_drift : Nat64;
    var transaction_window : Nat64;
    var accounts : Accounts;
    var cleaning_timer : ?Nat;
    var name: ?Text;
    var symbol: ?Text;
    var logo: ?Text;
    var decimals: Nat8;
    var _fee: ?Fee;
    var max_supply: ?Nat;
    var max_memo : Nat;
    var min_burn_amount : ?Nat;
    var minting_account : Account;
    var metadata : ?Value;
    var supported_standards : ?Vector.Vector<SupportedStandard>;
    var local_transactions : Vector.Vector<Transaction>;
    var recent_transactions : Map.Map<Blob, (Nat64, Nat)>;
    var max_accounts : Nat;
    var settle_to_accounts : Nat;
    var fee_collector : ?Account;
    var fee_collector_block : Nat;
    var fee_collector_emitted : Bool;

  };

  /// `Accounts`
  ///
  /// A mapping from `Account` to `Balance`, used to store the token balances of all accounts in the ledger.
  public type Accounts = Map.Map<Account, Balance>;

  /// `Stats`
  ///
  /// Represents collected statistics about the ledger, such as the total number of accounts.
  public type Stats = {
    accounts: Nat;
  };

  /// `Fee`
  ///
  /// Represents the fee structure for a transaction. It could be a `Fixed` fee amount or derived from the
  /// `Environment` at the time of the transaction.
  public type Fee = {
    #Fixed: Nat;
    #Environment;
  };

  /// `Environment`
  ///
  /// A record that encapsulates various external dependencies and settings that the ledger relies on
  /// for fee calculations, timestamp retrieval, and inter-canister communication.
  /// can_transfer supports evaluating the transfer from both sync and async function.
  public type Environment = {
    get_time : ?(() -> Int);
    get_fee : ?((State, Environment, TransferArgs) -> Balance);
    add_ledger_transaction: ?((Value, ?Value) -> Nat);
  };

  public type CanTransfer = ?{
    #Sync : ((trx: Value, trxtop: ?Value, notification: TransactionRequestNotification) -> Result.Result<(trx: Value, trxtop: ?Value, notification: TransactionRequestNotification), Text>);
    #Async : ((trx: Value, trxtop: ?Value, notification: TransactionRequestNotification) -> async* Star.Star<(trx: Value, trxtop: ?Value, notification: TransactionRequestNotification), Text>);
  };

  /// `Value`
  ///
  /// Represents a value that can hold different types. It's used to represent ledger metadata, block data,
  /// or values that change type depending on the context.
  public type Value = { #Nat : Nat; #Int : Int; #Blob : Blob; #Text : Text; #Array : [Value]; #Map: [(Text, Value)] };

  /// `BlockIndex`
  ///
  /// A type alias representing the index of a block in the block log.
  public type BlockIndex = Nat;

  /// `Subaccount`
  ///
  /// A blob representing a subaccount identifier, which, when combined with a principal, uniquely identifies an account on the ledger.
  public type Subaccount = Blob;

  /// `Balance`
  ///
  /// A type alias representing the balance of an account, expressed in the smallest unit of the token.
  public type Balance = Nat;

  /// `Account`
  ///
  /// Represents an account on the ledger, comprising an owner (principal) and an optional subaccount identifier.
  public type Account = {
      owner : Principal;
      subaccount : ?Subaccount;
  };

  /// `SupportedStandard`
  ///
  /// Describes a standard that the token ledger supports, with its name and URL for more information.
  public type SupportedStandard = {
      name : Text;
      url : Text;
  };

  public type UpdateLedgerInfoRequest = {
      #PermittedDrift : Nat64;
      #TransactionWindow : Nat64;
      #Name : Text;
      #Symbol : Text;
      #Logo : Text;
      #Decimals : Nat8;
      #MaxSupply: ?Nat;
      #MaxMemo : Nat;
      #MinBurnAmount : ?Nat;
      #MintingAccount : Account;
      #MaxAccounts : Nat;
      #SettleToAccounts : Nat;
      #FeeCollector: ?Account;
      #Metadata : (Text, ?Value);
      #Fee: Fee;

  };

  /// `Memo`
  ///
  /// A type alias for a blob used to store arbitrary data in a transaction memo field.
  public type Memo = Blob;

  /// `Timestamp`
  ///
  /// Represents a point in time, encoded as the number of nanoseconds elapsed since the Unix epoch (UTC timezone).
  public type Timestamp = Nat64;

  /// `Duration`
  ///
  /// Represents an amount of time, expressed in nanoseconds.
  public type Duration = Nat64;

  /// `TxLog`
  ///
  /// A vector holding a log of transactions for the ledger.
  public type TxLog = Vector.Vector<Transaction>;

  /// `MetaDatum`
  ///
  /// Represents a single metadata entry as a key-value pair.
  public type MetaDatum = (Text, Value);

  /// `MetaData`
  ///
  /// A collection of metadata entries in a `Value` variant format, encapsulating settings and properties related to the ledger.
  public type MetaData = Value;

  /// `TxKind`
  ///
  /// Categorizes transactions into types such as minting, burning, and transferring.
  public type TxKind = {
      /// Minting operation, which increases the total token supply.
      #mint;
      /// Burning operation, which decreases the total token supply.∏
      #burn;
      /// Transferring operation, moving tokens between accounts.
      #transfer;
  };

  /// `Mint`
  ///
  /// Describes a minting operation where new tokens are created.
  public type Mint = {
    to: Account;               // The account receiving the newly minted tokens.
    amount: Balance;           // The number of tokens to mint.
    memo: ?Memo;               // An optional memo accompanying the minting operation.
    created_at_time: ?Timestamp; // The time the mint operation was created.
  };

  /// `BurnArgs`
  ///
  /// Arguments provided to initiate a burn operation.
  public type BurnArgs = {
    from_subaccount: ?Subaccount; // The subaccount from which tokens are burned.
    amount: Balance;              // The number of tokens to burn.
    memo: ?Memo;                  // An optional memo accompanying the burn operation.
    created_at_time: ?Timestamp;  // The time the burn operation was created.
  };

  /// `Burn`
  ///
  /// Represents the burn operation, specifying token removal from supply.
  public type Burn = {
    from: Account;                // The account from which tokens are burned.
    amount: Balance;              // The number of tokens to burn.
    memo: ?Memo;                  // An optional memo accompanying the burn operation.
    created_at_time: ?Timestamp;  // The time the burn operation was created.
  };

  /// `TransferArgs`
  ///
  /// Arguments for a transfer operation.
  public type TransferArgs = {
    from_subaccount: ?Subaccount; // The subaccount from which tokens are deducted.
    to: Account;                  // The account to which tokens are credited.
    amount: Balance;              // The number of tokens to transfer.
    fee: ?Balance;                // The optional fee paid for the transfer.
    memo: ?Memo;                  // An optional memo for record-keeping purposes.
    created_at_time: ?Timestamp;  // The timestamp denoting the creation time of the transaction.
  };

  /// `Transfer`
  ///
  /// Describes the details of a token transfer between accounts.
  public type Transfer = {
      from: Account;                // The sending account.
      to: Account;                  // The receiving account.
      amount: Balance;              // The number of tokens to transfer.
      fee: ?Balance;                // The optional fee that may be applied to the transfer.
      memo: ?Memo;                  // An optional memo for record-keeping purposes.
      created_at_time: ?Timestamp;  // The timestamp denoting the creation time of the transaction.
  };

  /// `TransactionRequest`
  ///
  /// Internal representation of a transaction request.
  public type TransactionRequest = {
      kind : TxKind;
      from : Account;
      to : Account;
      amount : Balance;
      fee : ?Balance;
      memo : ?Blob;
      created_at_time : ?Nat64;
  };

  /// `TransactionRequestNotification`
  ///
  /// Represents the notification for a transaction request, including the fee calculated by the ledger.
  public type TransactionRequestNotification = {
      kind : TxKind;
      from : Account;
      to : Account;
      amount : Balance;
      fee : ?Balance;
      calculated_fee: Nat;
      memo : ?Blob;
      created_at_time : ?Nat64;
  };

  // `Transaction`
  ///
  /// Captures all the relevant information of a ledger transaction, including its type,
  /// associated mint or burn or transfer details, and its position in the transaction log.
  public type Transaction = {
    kind: Text;                  // The type of transaction ('mint', 'burn', 'transfer').
    mint: ?Mint;                 // Present if this is a mint transaction.
    burn: ?Burn;                 // Present if this is a burn transaction.
    transfer: ?Transfer;         // Present if this is a transfer transaction.
    index: TxIndex;              // The index of the transaction in the ledger.
    timestamp: Timestamp;        // The timestamp when the transaction was processed.
  };

  // `TimeError`
  ///
  /// Enumerates potential timing-related errors that can occur during transaction processing,
  /// such as transactions being too old or created in the future from the ledger's perspective.
  public type TimeError = {
    #TooOld;                                 // Error indicating the transaction is too old.
    #CreatedInFuture: { ledger_time: Timestamp };   // Error indicating the transaction has a future creation time.
  };

  /// `TransferError`
  ///
  /// Describes possible errors that can occur during transfer processing.
  public type TransferError = TimeError or {
      #BadFee : { expected_fee : Balance };
      #BadBurn : { min_burn_amount : Balance };
      #InsufficientFunds : { balance : Balance };
      #Duplicate : { duplicate_of : TxIndex };
      #TemporarilyUnavailable;
      #GenericError : { error_code : Nat; message : Text };
  };
  
  /// `TransferResult`
  ///
  /// Encapsulates the result of a transfer operation, which can be either the index of the completed transaction
  /// or an error indicating why the transfer could not be processed.
  public type TransferResult = {
      #Ok : TxIndex;
      #Err : TransferError;
  };

  /// `account_hash32`
  ///
  /// Produces a 32-bit hash of an `Account` for efficient storage or lookups.
  ///
  /// Parameters:
  /// - `a`: The `Account` to hash.
  ///
  /// Returns:
  /// - `Nat32`: A 32-bit hash value representing the account.
  public func account_hash32(a : Account) : Nat32{
    var accumulator = Map.phash.0(a.owner);
    switch(a.subaccount){
      case(null){
        accumulator +%= Map.bhash.0(nullBlob);
      };
      case(?val){
        accumulator +%= Map.bhash.0(val);
      };
    };
    return accumulator;
  };

  let nullBlob  : Blob = "\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00";

  /// `account_eq`
  ///
  /// Compares two `Account` instances for equality.
  ///
  /// Parameters:
  /// - `a`: First `Account` to compare.
  /// - `b`: Second `Account` to compare.
  ///
  /// Returns:
  /// - `Bool`: True if accounts are equal, False otherwise.
  public func account_eq(a : Account, b : Account) : Bool{
    
    if(a.owner != b.owner) return false;
    switch(a.subaccount, b.subaccount){
      case(null, null){};
      case(?vala, ?valb){
        if(vala != valb) return false;
      };
      case(null,?val){
        if(not(nullBlob == val)){
          return false;
        }
      };
      case(?val,null){
        if(not(nullBlob == val)){
          return false;
        }
      };
    };
    return true;
  };

  /// `account_compare`
  ///
  /// Orders two `Account` instances.
  ///
  /// Parameters:
  /// - `a`: First `Account` to compare.
  /// - `b`: Second `Account` to compare.
  ///
  /// Returns:
  /// - `Order.Order`: An ordering indication relative to the accounts.
  public func account_compare(a : Account, b : Account) : Order.Order {
    if(a.owner == b.owner){
      switch(a.subaccount, b.subaccount){
        case(null, null) return #equal;
        case(?vala, ?valb) return Blob.compare(vala,valb);
        case(null, ?valb){
          if(valb == nullBlob) return #equal;
         return #less;
        };
        case(?vala, null){
          if(vala == nullBlob) return #equal;
          return #greater;
        }
      };
    } else return Principal.compare(a.owner, b.owner);
  };

  public let ahash = (account_hash32, account_eq);


  /// `TxCandidBlob`
  ///
  /// Represents transaction data encoded as a Candid binary blob.
  public type TxCandidBlob = Blob;

  /// `InitArgs`
  ///
  /// Encapsulates initial arguments for setting up an ICRC-1 token canister, including token details and operational constraints.
  public type InitArgs = {
      name : ?Text;
      symbol : ?Text;
      logo : ?Text;
      decimals : Nat8;
      fee : ?Fee;
      minting_account : ?Account;
      max_supply : ?Balance;
      min_burn_amount : ?Balance;
      max_memo : ?Nat;
      /// optional settings for the icrc1 canister
      advanced_settings: ?AdvancedSettings;
      metadata: ?Value;
      fee_collector: ?Account;
      transaction_window : ?Timestamp;
      permitted_drift : ?Timestamp;
      max_accounts: ?Nat;
      settle_to_accounts: ?Nat;
  };

  /// `AdvancedSettings`
  ///
  /// Provides additional settings that may be necessary for canister initialization, such as data necessary for migration from another ledger service.
  public type AdvancedSettings = {
      /// needed if a token ever needs to be migrated to a new canister
      burned_tokens : Balance; 
      minted_tokens : Balance;
      fee_collector_block : Nat;
      fee_collector_emitted : Bool;
      existing_balances: [(Account, Balance)]; //only used for migration..do not use
      local_transactions: [Transaction];
      
  };

  /// `AccountBalances`
  ///
  /// Maps accounts to their corresponding balances, effectively modeling the ledger's state of holdings.
  public type AccountBalances = Accounts;

  /// `TokenTransferredListener`
  ///
  /// Represents a callback function type that notifiers will implement to be alerted to token transfer events.
  public type TokenTransferredListener = (Transaction, trxid: Nat) -> ();
};