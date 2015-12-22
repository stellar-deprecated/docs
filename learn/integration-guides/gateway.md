---
title: Gateway Guide
---

# Becoming a Stellar Gateway
This guide will walk you through the integration steps to become a Stellar gateway. If you're not yet familiar with the concept of a gateway, please start [here](../concepts/gateway.md). This example uses Node.js and the [JS Stellar SDK](https://github.com/stellar/js-stellar-sdk), but it should be easy to adapt to other languages.

There are many ways to architect a gateway. This guide uses the following design:
 - `issuing account`: One Stellar account that is kept offline for increased safety.
 - `hot wallet`: One Stellar account that holds a balance of gateway credit. The gateway uses it to handle redemptions from and to send credit to users.
 - `customerID`: Each user has a customerID, used to correlate incoming payments with a particular user's account on the gateway.

The two main integration points to Stellar for a gateway are:<br>
1) Listening for redemption payments from the Stellar network<br>
2) Submitting payments into the Stellar network when you need to issue credit to users

## Setup

### Operational
*(optional)* Set up [Stellar Core](https://github.com/stellar/stellar-core/blob/master/docs/admin.md)
*(optional)* Set up [Horizon](https://github.com/stellar/horizon/blob/master/docs/admin.md)
If your gateway doesn't see a lot of volume, you don't need to set up your own instances of Stellar Core and Horizon. Instead, use one of the Stellar.org public-facing Horizon servers.
```
  test net: {hostname:'horizon-testnet.stellar.org', secure:true, port:443};
  live: {hostname:'horizon.stellar.org', secure:true, port:443};
```

### Issuing account
The issuing account can issue credit from the gateway. It is very important to maintain the security of this account. Keeping its secret key on a machine that doesn't have Internet access can help. Transactions are manually initiated by a human and are signed locally on the offline machine—a local install of js-stellar-sdk creates a tx_blob containing the signed transaction. This tx_blob can be transported to a machine connected to the Internet via offline methods (e.g., USB or by hand). This design makes the issuing account key much harder to compromise.

To learn how to create the issuing account, see [account management](./building-blocks/account-management.md).

### Hot wallet
People will frequently be redeeming and purchasing credit from your gateway, and you don't want these processes to involve the issuing account directly. Instead, create a `hot wallet` account that trusts the issuing account and holds a limited amount of credit issued by it. These funds are sent out to users as needed. A hot wallet contains a limited amount of funds to restrict loss in the event of a security breach.

To learn how to create a hot wallet account, see [account management](./building-blocks/account-management.md).

### Database
- Need to create a table for pending payments, `StellarPayments`.
- Need to create a table to hold the latest cursor position of the redemption stream, `StellarCursor`.
- Need to add a row to your users table that creates a unique `customerID` for each user.
- Need to populate the customerID row.

```
CREATE TABLE StellarPayments (UserID INT, Destination varchar(56), AssetAmount INT, AssetCode varchar(4), AssetIssuer varchar(56), state varchar(8));
CREATE TABLE StellarCursor (cursor INT);
INSERT INTO StellarCursor (cursor) values (0);
```


### Code
This is the code to run in order to run a gateway. The following sections describe each step.

For this guide, we use placeholder functions for steps that involve querying or writing to the gateway database. Each database library connects differently, so we abstract away those details.

```js
// Config your server
var config;
config.hotWallet="your hot wallet address";
config.hotWalletSeed="your seed";

// You can use Stellar.org's instance of Horizon or your own
config.horizon={hostname:'horizon-testnet.stellar.org', secure:true, port:443};

// Include the JS Stellar SDK
// It provides a client-side interface to Horizon
var StellarSdk = require('stellar-sdk');

// Initialize the Stellar SDK with the Horizon instance
// you want to connect to
var server = new StellarSdk.Server(config.horizon);

// Specify the non-native assets you'll accept
var assets = [new StellarSDK.Asset(code, issuer), ...]

// Get the latest cursor position
var last_token = latestFromDB("StellarCursor");

// Listen for payments from where you last stopped
// GET https://horizon-testnet.stellar.org/accounts/{config.hotWallet}/payments?cursor={last_token}
server.payments()
  .forAccount(config.hotWallet)
  .cursor(last_token)
  .stream({onmessage: handlePaymentResponse});

// Load the account sequence number from Horizon and return the account
// GET https://horizon-testnet.stellar.org/accounts/{config.hotWallet}
server.loadAccount(config.hotWallet)
  .then(function (account) {
    setInterval(function() {
     // Every 30 seconds process any pending transactions
     submitPendingTransactions(account)
    }, 30 * 1000);
  })
```

## Listening for redemptions
When a user wants to redeem your gateway's credit, instruct them to send the credit to your hot wallet address with the customerID included in the memo field of the transaction.

You must listen for payments to the hot wallet account and record any user that sends credit there. Here's code that listens for these payments:

```js
// start listening for payments from where you last stopped

var last_token = latestFromDB("StellarCursor");

// GET https://horizon-testnet.stellar.org/accounts/{config.hotWallet}/payments?cursor={last_token}
server.payments()
  .forAccount(config.hotWallet)
  .cursor(last_token)
  .stream({onmessage: handlePaymentResponse});
```
For every payment received by the hot wallet, you must:

- check the memo field to determine which user sent the deposit.
- record the cursor in the StellarCursor table so you can resume payment processing where you left off.
- credit the user's account in the DB with the amount of the asset they sent to deposit.

So, you pass this function as the `onmessage` option when you stream payments:
```js

function handlePaymentResponse(record) {

  // As a gateway, you shouldn't be getting native lumens
  var paymentAsset = record.asset_type != 'native'?
    new StellarSdk.Asset(record.asset_code, record.issuer) :
    return;

  // GET https://horizon-testnet.stellar.org/transaction/{id of transaction this payment is part of}
  record.transaction()
    .then(function(txn) {
      var customer = txn.memo;
      if (record.to != config.hotWallet) {
        return;
      }
      if (!assets.include(paymentAsset)) {
         // If you are a gateway for certain assets and the customer sends
         // you assets you don't accept, some options for handling it are
         // 1. Trade the asset to your asset and credit that amount
         // 2. Send it back to the customer
      } else {
        // Credit the customer in the memo field
        if (checkExists(customer, "ExchangeUsers")) {
          // Store the amount the customer has paid you in your database
          store([record.amount, customer, paymentAsset.getCode(), paymentAsset.getIssuer()], "StellarDeposits");
          // Keep the cursor
          store(record.paging_token, "StellarCursor");
        } else {
          // If customer cannot be found, you can raise an error,
          // add them to your customers list and credit them,
          // or do anything else appropriate to your needs
          console.log(customer);
        }
      }
    })
    .catch(function(err) {
      // Process error
    });
}
```




## Issuing credit
When a user requests credit from your gateway, you must generate a Stellar transaction in order to send it to them.


Whenever a withdrawal is requested, the function `handleRequestWithdrawal` will queue up a transaction in your `StellarPayments` table.


```js
function handleRequestWithdrawal(userID, assetAmount, assetCode, assetIssuer, destinationAddress) {

  // Read the user's balance from the gateway's database
  var userBalance = getBalance('userID', assetCode, assetIssuer);

  // Check that user has the required lumens
  if (assetAmount <= userBalance) {

    // Debit  the user's internal lumen balance by the amount of lumens they are withdrawing
    store([userID, userBalance - assetAmount, assetCode, assetIssuer], "UserBalances");

    // Save the transaction information in the StellarWithrawals table
    store([userID, destinationAddress, assetAmount, assetCode, assetIssuer, "pending"], "StellarPayments");
  } else {
    // If the user doesn't have enough XLM, you can alert them
  }
}
```

Then, you should run `submitPendingTransactions`, which will check `StellarTransactions` for pending transactions and submit them.

```js
// This is the function that handles submitting a single transaction

function submitTransaction(sourceAccount, destinationAddress, amountLumens) {
  // Check to see if the destination address exists
  // GET https://horizon-testnet.stellar.org/accounts/{destinationAccount}
  server.loadAccount(destinationAddress)

    // If so, continue by submitting a transaction to the destination
    .then(function(account) {
      var transaction = new StellarSdk.Transaction(sourceAccount)
        .addOperation(StellarSdk.Operation.payment({
          destination: destinationAddress,
          asset: StellarLib.Asset.native(),
          amount: amountLumens
        }))
        // Sign the transaction
        .addSigner(StellarSdk.Keypair.fromSeed(config.hotWalletSeed))
        .build();
      // POST https://horizon-testnet.stellar.org/transactions
      return server.submitTransaction(transaction);
    })

    //But if the destination doesn't exist...
    .catch(StellarSdk.NotFoundError, function(err) {
      // create the account and fund it
      var transaction = StellarSdk.TransactionBuilder(sourceAccount)
        .addOperation(StellarSdk.Operation.createAccount({
          destination: destinationAddress,
          // Creating an account requires funding it with XLM
          startingBalance: amountLumens
        }))
        .addSigner(StellarSdk.Keypair.fromSeed(config.hotWalletSeed))
        .build();
      // POST https://horizon-testnet.stellar.org/transactions
      return server.submitTransaction(transaction);
    })

    // Submit the transaction created in either case
    .then(function(transactionResult) {
      if (transactionResult.ledger) {
        updateRecord(txn.pop().push('done'), "StellarTransactions");
      } else {
        updateRecord(txn.pop().push('error'), "StellarTransactions");
      }
    })
    .catch(function(err) {
      // Catch errors, most likely with the network or your transaction
    });
}


// This function handles submitting all pending transactions, and calls the previous one
// This function should be run in the background continuously

function submitPendingTransactions(sourceAccount) {

  // See what transactions in the DB are still pending
  pendingTransactions = querySQL("SELECT * FROM StellarTransactions WHERE state =`pending`");

  while (pendingTransactions.length > 0) {
    var txn = pendingTransactions.shift();
    var destinationAddress = txn[1];
    var amountLumens = txn[2];

    submitTransaction(sourceAccount, destinationAddress, amountLumens);
  }
}
```



## Going further...
### Federation
The federation protocol allows you to give your users easy addresses—e.g., bob*yourgateway.com—rather than cumbersome raw addresses such as: GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ?19327

For more information, check out the [federation guide](../concepts/federation.md).

### Restricting who can hold your credit
By default, anyone can hold your credit. You can, however, restrict holders to accounts that have been authorized by you.

To learn more about restricting who can hold your credit, see the `flags` section of the [accounts guide](../concepts/accounts.md).
