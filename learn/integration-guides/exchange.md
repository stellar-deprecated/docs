---
title: Exchange Guide
---

# Adding Stellar to your Exchange
This guide will walk you through the integration steps to add Stellar to your exchange. This example uses Node.js and the [JS Stellar SDK](https://github.com/stellar/js-stellar-sdk), but it should be easy to adapt to other languages.

There are many ways to architect an exchange. This guide uses the following design:
 - `cold wallet`: One Stellar account that holds the majority of customer deposits offline.
 - `hot wallet`: One Stellar account that holds a small amount of customer deposits online and is used to payout to withdrawal requests.
 - `customerID`: Each user has a customerID, used to correlate incoming deposits with a particular user's account on the exchange.

The two main integration points to Stellar for an exchange are:<br>
1) Listening for deposit transactions from the Stellar network<br>
2) Submitting withdrawal transactions to the Stellar network

## Setup

### Operational
*(optional)* Set up [Stellar Core](https://github.com/stellar/stellar-core/blob/master/docs/admin.md)<br>
*(optional)* Set up [Horizon](https://github.com/stellar/horizon/blob/master/docs/admin.md)<br>
If your exchange doesn't see a lot of volume, you don't need to set up your own instances of Stellar Core and Horizon. Instead, use one of the Stellar.org public-facing Horizon servers.
```
  test net: {hostname:'horizon-testnet.stellar.org', secure:true, port:443};
  live: {hostname:'horizon.stellar.org', secure:true, port:443};
```

### Cold wallet
A cold wallet is typically used to keep the bulk of customer funds secure. A cold wallet is a Stellar account whose secret keys are not on any device that touches the Internet. Transactions are manually initiated by a human and signed locally on the offline machine—a local install of `js-stellar-sdk` creates a `tx_blob` containing the signed transaction. This `tx_blob` can be transported to a machine connected to the Internet via offline methods (e.g., USB or by hand). This design makes the cold wallet secret key much harder to compromise.

To learn how to create a cold wallet account, see [account management](./account-management.md).

### Hot wallet
A hot wallet contains a more limited amount of funds than a cold wallet. A hot wallet is a Stellar account used on a machine that is connected to the Internet. It handles the day-to-day sending and receiving of lumens. The limited amount of funds in a hot wallet restricts loss in the event of a security breach.

To learn how to create a hot wallet account, see [account management](./account-management.md).

### Database
- Need to create a table for pending withdrawals, `StellarTransactions`.
- Need to create a table to hold the latest cursor position of the deposit stream, `StellarCursor`.
- Need to add a row to your users table that creates a unique `customerID` for each user.
- Need to populate the customerID row.

```
CREATE TABLE StellarTransactions (UserID INT, Destination varchar(56), XLMAmount INT, state varchar(8));
CREATE TABLE StellarCursor (cursor INT);
INSERT INTO StellarCursor (cursor) values (0);
```

Possible values for `StellarTransactions.state` are "pending", "done", "error".


### Code

This is the code to run in order to run an exchange. The following sections describe each step.

For this guide, we use placeholder functions for steps that involve querying or writing to the exchange database. Each database library connects differently, so we abstract away those details.

```js
// Config your server
var config;
config.hotWallet = "your hot wallet address";
config.hotWalletSeed = "your hot wallet seed";

// You can use Stellar.org's instance of Horizon or your own
config.horizon = {hostname:'horizon-testnet.stellar.org', secure:true, port:443};

// Include the JS Stellar SDK
// It provides a client-side interface to Horizon
var StellarSdk = require('stellar-sdk');

// Initialize the Stellar SDK with the Horizon instance
// You want to connect to
var server = new StellarSdk.Server(config.horizon);

// Get the latest cursor position
var last_token = latestFromDB("StellarCursor");

// Listen for payments from where you last stopped
server.payments()
  .forAccount(config.hotWallet)
  .cursor(last_token)
  .stream({onmessage: handlePaymentResponse});

// Load the account sequence number from Horizon and return the account
server.loadAccount(config.hotWallet)
  .then(function (account) {
    setInterval(function() {
     // Every 30 seconds process any pending transactions
     submitPendingTransactions(account)
    }, 30 * 1000);
  })
```

## Listening for deposits
When a user wants to deposit lumens in your exchange, instruct them to send XLM to your hot wallet address with the customerID in the memo field of the transaction.

You must listen for payments to the hot wallet account and credit any user that sends XLM there. Here's code that listens for these payments:

```js
// Start listening for payments from where you last stopped
var last_token = latestFromDB("StellarCursor");

server.payments()
  .forAccount(config.hotWallet)
  .cursor(last_token)
  .stream({onmessage: handlePaymentResponse});
```


For every payment received by the hot wallet, you must:<br>
-check the memo field to determine which user sent the deposit.<br>
-record the cursor in the `StellarCursor` table so you can resume payment processing where you left off.<br>
-credit the user's account in the DB with the number of XLM they sent to deposit.

So, you pass this function as the `onmessage` option when you stream payments:

```js
function handlePaymentResponse(record) {

  record.transaction()
    .then(function(txn) {
      var customer = txn.memo;

      // If this isn't a payment to the hotWallet, skip
      if (record.to != config.hotWallet) {
        return;
      }
      if (record.asset_type != 'native') {
         // If you are a XLM exchange and the customer sends
         // you a non-native asset, some options for handling it are
         // 1. Trade the asset to native and credit that amount
         // 2. Send it back to the customer  
      } else {
        // Credit the customer in the memo field
        if (checkExists(customer, "ExchangeUsers")) {
          // Store the amount the customer has paid you in your database
          store([record.amount, customer], "StellarDeposits");
          // Store the cursor in your database
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


## Submitting withdrawals
When a user requests a lumen withdrawal from your exchange, you must generate a Stellar transaction to send them the lumens.  

The function `handleRequestWithdrawal` will queue up a transaction in the exchange's `StellarTransactions` table whenever a withdrawal is requested.

```js
function handleRequestWithdrawal(userID,amountLumens,destinationAddress) {
  // Read the user's balance from the exchange's database
  var userBalance = getBalance('userID');

  // Check that user has the required lumens
  if (amountLumens <= userBalance) {

    // Debit the user's internal lumen balance by the amount of lumens they are withdrawing
    store([userID, userBalance - amountLumens], "UserBalances");

    // Save the transaction information in the StellarTransactions table
    store([userID, destinationAddress, amountLumens, "pending"], "StellarTransactions");
  } else {
    // If the user doesn't have enough XLM, you can alert them
  }
}
```

Then, you should run `submitPendingTransactions`, which will check `StellarTransactions` for pending transactions and submit them.

```js
// This is the function that handles submitting a single transaction

function submitTransaction(exchangeAccount, destinationAddress, amountLumens) {
  // Check to see if the destination address exists
  server.loadAccount(destinationAddress)

    // If so, continue by submitting a transaction to the destination
    .then(function(account) {
      var transaction = new StellarSdk.Transaction(exchangeAccount)
        .addOperation(StellarSdk.Operation.payment({
          destination: destinationAddress,
          asset: StellarLib.Asset.native(),
          amount: amountLumens
        }))
        // Sign the transaction
        .addSigner(StellarSdk.Keypair.fromSeed(config.hotWalletSeed))
        .build();
      return server.submitTransaction(transaction);
    })

    //But if the destination doesn't exist...
    .catch(StellarSdk.NotFoundError, function(err) {
      // create the account and fund it
      var transaction = StellarSdk.TransactionBuilder(exchangeAccount)
        .addOperation(StellarSdk.Operation.createAccount({
          destination: destinationAddress,
          // Creating an account requires funding it with XLM
          startingBalance: amountLumens
        }))
        .addSigner(StellarSdk.Keypair.fromSeed(config.hotWalletSeed))
        .build();
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

function submitPendingTransactions(exchangeAccount) {

  // See what transactions in the db are still pending
  pendingTransactions = querySQL("SELECT * FROM StellarTransactions WHERE state =`pending`");

  while (pendingTransactions.length > 0) {
    var txn = pendingTransactions.shift();
    var destinationAddress = txn[1];
    var amountLumens = txn[2];

    submitTransaction(exchangeAccount, destinationAddress, amountLumens);
  }
}
```

## Going further...
### Federation
The federation protocol allows you to give your users easy addresses—e.g., bob*yourexchange.com—rather than cumbersome raw addresses such as: GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ?19327

For more information, check out the [federation guide](../concepts/federation.md).

### Gateway
If you're an exchange, it's easy to become a Stellar gateway as well. The integration points are very similar, with the same level of difficulty. Becoming a gateway could potentially expand your business.

To learn more about what it means to be a gateway, see the [gateway guide](../concepts/gateways.md).
