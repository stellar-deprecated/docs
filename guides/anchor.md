---
title: Become an Anchor
---

# Becoming a Stellar Anchor
This guide will walk you through the integration steps to become a Stellar anchor. If you're not yet familiar with the concept of an [anchor](https://www.stellar.org/how-it-works/stellar-basics/explainers/#Anchors_trust_and_credit), please start [here](https://www.stellar.org/learn/#how-it-works). This example uses Node.js and the [JS Stellar SDK](https://github.com/stellar/js-stellar-sdk), but it should be easy to adapt to other languages.

There are many ways to architect an anchor. This guide uses the following design:
 - `issuing account`: One Stellar account that is kept offline for increased safety.
 - `base account`: One Stellar account that holds a balance of anchor credit. The anchor uses it to handle redemptions from and to send credit to users.
 - `customerID`: Each user has a customerID, used to correlate incoming payments with a particular user's account on the anchor.

The two main integration points to Stellar for an anchor are:<br>
1) Listening for redemption payments from the Stellar network<br>
2) Submitting payments into the Stellar network when you need to issue credit to users

## Setup

### Operational
* *(optional)* Set up [Stellar Core](https://www.stellar.org/developers/stellar-core/software/admin.html)
* *(optional)* Set up [Horizon](https://www.stellar.org/developers/horizon/reference/index.html)

If your anchor doesn't see a lot of volume, you don't need to set up your own instances of Stellar Core and Horizon. Instead, use one of the Stellar.org public-facing Horizon servers.
```json
{
  "testnet": "https://horizon-testnet.stellar.org",
  "live": "https://horizon.stellar.org"
}
```

### Issuing account
The issuing account can issue credit from the anchor. It is very important to maintain the security of this account. Keeping its secret key on a machine that doesn't have Internet access can help. Transactions are manually initiated by a human and are signed locally on the offline machine—a local install of js-stellar-sdk creates a tx_blob containing the signed transaction. This tx_blob can be transported to a machine connected to the Internet via offline methods (e.g. QRcode, USB or by hand). This design makes the issuing account key much harder to compromise.

### Base account
People will frequently be redeeming and purchasing credit from your anchor, and you don't want these processes to involve the issuing account directly. Instead, create a `base account` that trusts the issuing account and holds a limited amount of credit issued by it. These funds are sent out to users as needed. A base account contains a limited amount of funds to restrict loss in the event of a security breach.

### Database
- Need to create a table for pending payments, `StellarPayments`.
- Need to create a table to hold the latest cursor position of the redemption stream, `StellarCursor`.
- Need to add a row to your users table that creates a unique `customerID` for each user.
- Need to populate the customerID row.

```
CREATE TABLE StellarPayments (UserID INT, Destination varchar(56), AssetAmount INT, AssetCode varchar(4), AssetIssuer varchar(56), state varchar(8));
CREATE TABLE StellarCursor (id INT, cursor varchar(50)); // id - AUTO_INCREMENT field
```

### Code
This is the code to run in order to run an anchor. The following sections describe each step.

For this guide, we use placeholder functions for steps that involve querying or writing to the anchor database. Each database library connects differently, so we abstract away those details.

```js
// Config your server
var config = {};
config.baseAccount="your base account address";
config.baseAccountSeed="your seed";

// You can use Stellar.org's instance of Horizon or your own
config.horizon='https://horizon-testnet.stellar.org';

// Include the JS Stellar SDK
// It provides a client-side interface to Horizon
var StellarSdk = require('stellar-sdk');

// Initialize the Stellar SDK with the Horizon instance
// you want to connect to
var server = new StellarSdk.Server(config.horizon);

// Specify the non-native assets you'll accept
var assets = [new StellarSDK.Asset(code, issuer), ...]

// Get the latest cursor position
var lastToken = latestFromDB("StellarCursor");

// Listen for payments from where you last stopped
// GET https://horizon-testnet.stellar.org/accounts/{config.baseAccount}/payments?cursor={lastToken}
let callBuilder = server.payments().forAccount(config.baseAccount);

// If no cursor has been saved yet, don't add cursor parameter
if (lastToken) {
  callBuilder.cursor(lastToken);
}

callBuilder.stream({onmessage: handlePaymentResponse});

// Load the account sequence number from Horizon and return the account
// GET https://horizon-testnet.stellar.org/accounts/{config.baseAccount}
server.loadAccount(config.baseAccount)
  .then(function (account) {
     submitPendingTransactions(account);
  })
```

## Listening for redemptions
When a user wants to redeem your anchor's credit, instruct them to send the credit to your base account address with the customerID included in the memo field of the transaction.

You must listen for payments to the base account and record any user that sends credit there. Here's code that listens for these payments:

```js
// start listening for payments from where you last stopped
var lastToken = latestFromDB("StellarCursor");

// GET https://horizon-testnet.stellar.org/accounts/{config.baseAccount}/payments?cursor={last_token}
let callBuilder = server.payments().forAccount(config.baseAccount);

// If no cursor has been saved yet, don't add cursor parameter
if (lastToken) {
  callBuilder.cursor(lastToken);
}

callBuilder.stream({onmessage: handlePaymentResponse});
```
For every payment received by the base account, you must:

- check the memo field to determine which user sent the deposit.
- record the cursor in the StellarCursor table so you can resume payment processing where you left off,
- credit the user's account in the DB with the amount of the asset they sent to deposit.

So, you pass this function as the `onmessage` callback when you stream payments:
```js

function handlePaymentResponse(record) {
  // This callback will be called for sent payments too.
  // We want to process incoming payments only.
  if (record.to != config.baseAccount) {
    return;
  }

  // As an anchor, you shouldn't be getting native lumens
  if (record.asset_type != 'native') {
    return;
  }

  var paymentAsset = new StellarSdk.Asset(record.asset_code, record.issuer);

  if (!assets.contains(paymentAsset)) {
     // If you are an anchor for certain assets and the customer sends
     // you assets you don't accept, some options for handling it are
     // 1. Trade the asset to your asset and credit that amount
     // 2. Send it back to the customer
  }

  // GET https://horizon-testnet.stellar.org/transaction/{id of transaction this payment is part of}
  record.transaction()
    .then(function(txn) {
      var customer = txn.memo;

      // Credit the customer in the memo field
      if (checkExists(customer, "ExchangeUsers")) {
        // Update in an atomic transaction
        db.transaction(function() {
          // Store the amount the customer has paid you in your database
          store([record.amount, customer, paymentAsset.getCode(), paymentAsset.getIssuer()], "StellarDeposits");
          // Keep the cursor
          store(record.paging_token, "StellarCursor");
         });
      } else {
        // If customer cannot be found, you can raise an error,
        // add them to your customers list and credit them,
        // or do anything else appropriate to your needs
        console.log(customer);
      }
    })
    .catch(function(err) {
      // Process error
    });
}
```




## Issuing credit
When a user requests credit from your anchor, you must generate a Stellar transaction in order to send it to them.


Whenever a withdrawal is requested, the function `handleRequestWithdrawal` will queue up a transaction in your `StellarPayments` table.


```js
function handleRequestWithdrawal(userID, assetAmount, assetCode, assetIssuer, destinationAddress) {
  // This should be done in an atomic transaction
  db.transaction(function() {
    // Read the user's balance from the anchor's database
    var userBalance = getBalance('userID', assetCode, assetIssuer);

    // Check that user has the required amount
    if (assetAmount <= userBalance) {
      // Debit  the user's internal lumen balance by the amount of lumens they are withdrawing
      store([userID, userBalance - assetAmount, assetCode, assetIssuer], "UserBalances");
      // Save the transaction information in the StellarWithrawals table
      store([userID, destinationAddress, assetAmount, assetCode, assetIssuer, "pending"], "StellarPayments");
    } else {
      // If the user doesn't have required amount, you can alert them
    }
  });
}
```

Then, you should run `submitPendingTransactions`, which will check `StellarTransactions` for pending transactions and submit them.

```js
// This is the function that handles submitting a single transaction
function submitTransaction(sourceAccount, destinationAddress, amount, asset) {
  // Update transaction state to sending so it won't be
  // resubmitted in case of the failure.
  updateRecord('sending', "StellarTransactions");

  // Check to see if the destination address exists
  // GET https://horizon-testnet.stellar.org/accounts/{destinationAccount}
  server.loadAccount(destinationAddress)
    // If so, continue by submitting a transaction to the destination
    .then(function(account) {
      var transaction = new StellarSdk.Transaction(sourceAccount)
        .addOperation(StellarSdk.Operation.payment({
          destination: destinationAddress,
          asset: asset
          amount: amount
        }))
        // Sign the transaction
        .build();

      transaction.sign(StellarSdk.Keypair.fromSeed(config.baseAccountSeed));

      // POST https://horizon-testnet.stellar.org/transactions
      return server.submitTransaction(transaction)
        .then(function(transactionResult) {
          updateRecord('done', "StellarTransactions");
        })
        .catch(function(err) {
          // Catch errors, most likely with the network or your transaction.
          // You may need to fetch the current sequence number of baseAccount account.
          updateRecord('error', "StellarTransactions");
        });
    })
    .catch(StellarSdk.NotFoundError, function(err) {
      // If destination cannot be found, you can raise an error,
      // because the account must exist and have a trustline.
      console.log(err);
    });
}


// This function handles submitting all pending transactions, and calls the previous one
// This function should be run in the background continuously
function submitPendingTransactions(sourceAccount) {
  // See what transactions in the DB are still pending
  pendingTransactions = querySQL("SELECT * FROM StellarTransactions WHERE state =`pending`");

  while (pendingTransactions.length > 0) {
    var txn = pendingTransactions.pop();

    // This function is async so it won't block. For simplicity we're using
    // ES7 `await` keyword but you should create a "promise waterfall" so
    // `setTimeout` line below is executed after all transactions are submitted.
    // If you won't do it will be possible to send a transaction twice or more.
    await submitTransaction(sourceAccount, txn.destinationAddress, txn.amount, txn.asset);
  }

  // Wait 30 seconds and process next batch of transactions.
  setTimeout(function() {
    submitPendingTransactions(sourceAccount);
  }, 30*1000);
}
```

## Going further...
### Federation
The federation protocol allows you to give your users easy addresses—e.g., `bob*youranchor.com` — rather than cumbersome raw addresses such as: `GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ`.

For more information, check out the [federation guide](./concepts/federation.md).

### Restricting who can hold your credit
By default, anyone can hold your credit. You can, however, restrict holders to accounts that have been authorized by you.

To learn more about restricting who can hold your credit, see the `flags` section of the [accounts guide](./concepts/accounts.md).
