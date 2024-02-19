# icrc1.mo

## Warning: This is an alpha release and this code has not been audited. Use at your own risk

This repo contains the implementation of the 
[ICRC-1](https://github.com/dfinity/ICRC-1) token standard. 

Much of this library has been forked from https://github.com/NatLabs/icrc1.  Most of the logic was originally written in that library. We have forked it sync it with our other icrc2.mo, icrc3.mo, icrc7.mo, and icrc30.mo libraries.  The archive functionality has been removed to simplify the code(use icrc3.mo) and we have added a few features like fee_collector found in the SNS core ledger.

This library does not contain a full-featured, scalable, implementation of the library, please see [https://github.com/PanIndustrial-Org/ICRC_fungible](https://github.com/PanIndustrial-Org/ICRC_fungible) for an implementation example that includes support for ICRC 2 and 3.

## Install
```
mops add icrc1-mo
```

## Testing
Since this item contains asyn test you need to use an actor to test it.  See /tests/ICRC1/ICRC1.ActorTest.mo

```
make actor-test
```

## Usage
```motoko
import ICRC1 "mo:icrc1.mo";

## Initialization

This ICRC1 class uses a migration pattern as laid out in https://github.com/ZhenyaUsenko/motoko-migrations, but encapsulates the pattern in the Class+ pattern as described at https://forum.dfinity.org/t/writing-motoko-stable-libraries/21201 . As a result, when you insatiate the class you need to pass the stable memory state into the class:

```

stable var icrc1_migration_state = ICRC1.init(ICRC1.initialState() , #v0_1_0(#id), _args, init_msg.caller);

  let #v0_1_0(#data(icrc1_state_current)) = icrc1_migration_state;

  private var _icrc1 : ?ICRC1.ICRC1 = null;

  private func get_icrc1_environment() : ICRC1.Environment{
    ?{
      get_time = ?Time.now;
      get_fee = null;
      add_ledger_transaction = icrc3().add_record; //define and instantiate icrc3 as indicated in the icrc3-mo package
    };
  };

  func icrc1() : ICRC1.ICRC1 {
    switch(_icrc3){
      case(null){
        let initclass : ICRC1.ICRC1 = ICRC1.ICRC1(?icrc1_migration_state, Principal.fromActor(this), get_icrc1_environment());
        _icrc1 := ?initclass;
        initclass;
      };
      case(?val) val;
    };
  };

```
The above pattern will allow your class to call icrc1().XXXXX to easily access the stable state of your class and you will not have to worry about pre or post upgrade methods.

Init args:

```

  public type Fee = {
    #Fixed: Nat; //a fixed fee per transaction
    #Environment; //ask the environment for a fee based on the transaction details
  };

   public type AdvancedSettings = {
        /// needed if a token ever needs to be migrated to a new canister
        burned_tokens : Balance; //Number of previously burned tokens
        minted_tokens : Balance; //Number of previously minted tokens
        fee_collector_block : ?Nat; //Previously declared fee_collector_block  
        existing_balances: [(Account, Balance)]; //only used for migration..do not use
        local_transactions: [Transaction]; //only used for migration..do not use
        //custom config
        
    };

  public type InitArgs = {
        name : ?Text; //name of the token
        symbol : ?Text; //symbol of the token
        decimals : Nat8; //number of decimals
        logo : ?Text; //text based URL of the logo. Can be a data url
        fee : ?Fee; // fee setup
        minting_account : ?Account; //define a minting account, defaults to caller of canister initialization with null subaccount
        max_supply : ?Balance; //max supply for the token
        min_burn_amount : ?Balance; //a min burn amount to apply
        max_memo : ?Nat; //max size of the memo field, defaults to 384
        /// optional settings for the icrc1 canister
        advanced_settings: ?AdvancedSettings;
        metadata: ?Value; //Initial metadata in a #Map
        fee_collector: ?Account; //specify a fee collector account
        transaction_window : ?Timestamp; //time during which transactions should be deduplicated. Nanoseconds. Default 86_400_000_000_000
        permitted_drift : ?Timestamp; //time transactions can drift from canister time. Nanoseconds. Default 60_000_000_000
        max_accounts: ?Nat; Default 5_000_000
        settle_to_accounts: ?Nat; Default 4_990_000
    };
```

### Environment

The environment pattern lets you pass dynamic information about your environment to the class.

```
public type Environment = {
    get_time : ?(() -> Int); // override system time, useful for testing
    get_fee : ?((State, Environment, TransferArgs) -> Balance); //assign a dynamic fee at runtime
    add_ledger_transaction: ?((Value, ?Value) -> Nat); //called when a transaction needs to be added to the ledger.  Used to provide compatibility with ICRC3 based transaction logs. When used in conjunction with ICRC3.mo you will get an ICRC3 compatible transaction log complete with self archiving.
    
  };
```
## Deduplication

The class uses a Representational Independent Hash map to keep track of duplicate transactions within the permitted drift timeline.  The hash of the "tx" value is used such that provided memos and created_at_time will keep deduplication from triggering.

## Event system

### Subscriptions

The class has a register_token_transferred_listener endpoint that allows other objects to register an event listener and be notified whenever a token event occurs from one user to another.

The events are synchronous and cannot directly make calls to other canisters.  We suggest using them to set timers if notifications need to be sent using the Timers API.

```

    public type Burn = {
        from : Account;
        amount : Balance;
        memo : ?Blob;
        created_at_time : ?Nat64;
    };

    public type Mint = {
        to : Account;
        amount : Balance;
        memo : ?Blob;
        created_at_time : ?Nat64;
    };
    public type Transaction = {
        kind : Text;
        mint : ?Mint;
        burn : ?Burn;
        transfer : ?Transfer;
        index : TxIndex;
        timestamp : Timestamp;
    };
    public type Transfer = {
        from : Account;
        to : Account;
        amount : Balance;
        fee : ?Balance;
        memo : ?Blob;
        created_at_time : ?Nat64;
    };

  public type TokenTransferredListener = (TransferNotification, trxid: Nat) -> ();

```

### Overrides

The user may assign a function to intercept each transaction type just before it is committed to the transaction log.  These functions are optional. The user may manipulate the values and return them to the processing transaction and the new values will be used for the transaction block information and for notifying subscribed components.

By returning an #err from these functions you will effectively cancel the transaction and the caller will receive back a #GenericError for that request with the message you provide.

Wire these functions up by including them in the call to transfer_tokens as the last parameter.

```

 can_transfer : ?{ //intercept transfers and modify them or cancel them at runtime. Note: If you update the notification you must also update the trx and trxtop manually
      #Sync : ((trx: Value, trxtop: ?Value, notification: TransactionRequest) -> Result.Result<(trx: Value, trxtop: ?Value, notification: TransactionRequest), Text>);
      #Async : ((trx: Value, trxtop: ?Value, notification: TransactionRequest) -> async* Star.Star<(trx: Value, trxtop: ?Value, notification: TransactionRequest), Text>);
    };
```

## Updating Ledger Settings with `update_ledger_info`

The `update_ledger_info` function in `icrc1.mo` allows you to modify various settings of the ICRC-1 token ledger after initialization. This function is essential for updating ledger parameters such as token name, symbol, decimals, fees, and other advanced settings. Below is a guide on how to use this function effectively.

### Function Prototype

```motoko
public func update_ledger_info(request: [UpdateLedgerInfoRequest]) : [Bool];
```

### Request Types

`UpdateLedgerInfoRequest` is an enumerated type that covers various ledger settings you can update. Each type corresponds to a specific ledger parameter:

- `#Name(Text)`: Update the token name.
- `#Symbol(Text)`: Update the token symbol.
- `#Decimals(Nat8)`: Update the number of decimals for token precision.
- `#Fee(Fee)`: Update the fee structure.
- `#MaxSupply(Nat)`: Update the maximum token supply.
- `#MinBurnAmount(?Nat)`: Update the minimum amount for token burning.
- `#MintingAccount(Account)`: Update the minting account.
- `#MaxAccounts(Nat)`: Update the max accounts allowed on the canister.
- `#SettleToAccounts(Nat)`: Update the number of accounts to reduce to if the canister goes over the max accounts.
- `#FeeCollector(?Account)`: set a fee collector for collecting fees.
- `#Metadata((Text, ?Value))`: Adds or removes a metadata value.


### Usage Example

Here's an example of how you can use `update_ledger_info` to update the token's name and symbol:

```motoko
import ICRC1 "mo:icrc1.mo";

// Assuming `icrc1` is an instance of your ICRC1 token
let updateRequests : [ICRC1.UpdateLedgerInfoRequest] = [
    #Name("New Token Name"),
    #Symbol("NTN")
];

let updateResults = icrc1.update_ledger_info(updateRequests);
```

### Return Value

The function returns an array of `Bool`, indicating the success or failure of each update request. 

### Important Considerations

- The function processes the requests in the order they are provided.
- It's crucial to check the returned array to ensure that all updates were successful.


### Metadata Synchronization

After updating ledger settings, it's recommended to verify that the changes are reflected in the token metadata. You can retrieve the updated metadata using the `metadata()` function and cross-verify the updates.


## References and other implementations
- [demergent-labs/ICRC-1 (Typescript)](https://github.com/demergent-labs/ICRC-1)
- [Ledger ref in Motoko](https://github.com/dfinity/ledger-ref/blob/main/src/Ledger.mo)
- [ICRC1 Rosetta API](https://github.com/dfinity/ic/blob/master/rs/rosetta-api/icrc1/ledger)


## Textual Representation of the ICRC-1 Accounts
This library implements the [Textual Representation](https://github.com/dfinity/ICRC-1/blob/main/standards/ICRC-1/README.md#textual-representation-of-accounts) format for accounts defined by the standard. It utilizes this implementation to encode each account into a sequence of bytes for improved hashing and comparison.
To help with this process, the library provides functions in the [ICRC1/Account](./src/ICRC1/Account.mo) module for [encoding](./docs/ICRC1/Account.md#encode), [decoding](./docs/ICRC1/Account.md#decode), [converting from text](./docs/ICRC1/Account.md#fromText), and [converting to text](./docs/ICRC1/Account.md#toText).


## Funding

This library was initially incentivized by [ICDevs](https://icdevs.org/). You can view more about the bounty on the [forum](https://forum.dfinity.org/t/completed-icdevs-org-bounty-26-icrc-1-motoko-up-to-10k/14868/54) or [website](https://icdevs.org/bounties/2022/08/14/ICRC-1-Motoko.html). The bounty was funded by The ICDevs.org community and the DFINITY Foundation and the award was paid to [@NatLabs](https://github.com/NatLabs). If you use this library and gain value from it, please consider a [donation](https://icdevs.org/donations.html) to ICDevs.