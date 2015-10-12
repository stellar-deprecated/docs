---
title: Gateway Guide
---

# Becoming a Stellar gateway
This guide will walk you through the integration steps necessary to become a Stellar [gateway](../concepts/gateway.md). We assume you are already familiar with the concept of a gateway. This example is using Node.js and the [js-stellar-sdk](https://github.com/stellar/js-stellar-sdk) but should be easy to adapt to other languages.

There are many ways to architect a gateway. This guide is using the following design:
 - There is one Stellar account that is the `issuing account` of the gateway. It is kept offline for increased safety.
 - There is one Stellar account controlled by the gateway that holds a balance of gateway credit. It is used to handle redemptions from and to send credit to users. It is referred to as the `hot wallet`.
 - Each user is given a `customerID` that is used to correlate incoming payments with a particular user's account on the gateway.

The two main integration points to Stellar for an exchange are:<br>
1) Listening for redemption payments from the Stellar network.<br>
2) Submitting payments into the Stellar network when you need to issue credit to users.

## Setup

### Operational
*(optional)* Set up [stellar-core](https://github.com/stellar/stellar-core/blob/master/docs/admin.md)
*(optional)* Set up [Horizon](https://github.com/stellar/horizon/blob/master/docs/admin.md)
If your gateway doesn't see a lot of volume it is possible to avoid setting up your own instance of stellar-core and horizon and to use the SDF public facing horizon server.
```
 test net: {hostname:'horizon-testnet.stellar.org', secure:true, port:443};
 live: {hostname:'horizon.stellar.org', secure:true, port:443};
```

### Issuing Account
The Issuing Account is the account that is able to issue more credit from the gateway. It is very important to keep this account secure. One thing that can help is to keep its secret key on a machine that doesn't have internet access. In order to use the account, transactions are manually initiated by a human and are signed locally on the offline machine. This is possible using a local install of js-stellar-sdk to create a tx_blob containing the signed transaction. This tx_blob can be transported to a machine connected to the internet via offline methods such as a usb stick. This makes the issuing account key much harder to compromise. See [Account Management](./account-management.md) for how to create the issuing account.



### Hot wallet
Since people will frequently be redeeming and purchasing credit from your gateway you don't want these processes to involve the issuing account directly. They way to manage this is to create a `hot wallet` account that trusts the issuing account and holds a limited amount of credit issued by the issuing account. These funds are then used to send out to users as needed. A hot wallet has a limited amount of funds to limit the loss in the event of a security breach. See [Account Management](./account-management.md) for how to create a hot wallet account.


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
This is the code to run in order to run a gateway.  Each step will be described in following sections.

For this guide, we will use placeholder functions for steps that involve querying or writing to the gateway database.  Each database library connects differently, so we will abstract away those details.

```js

// Config your server
var config;
config.hotWallet="your hot wallet address";
config.hotWalletSeed="your seed";

// You can use SDF's instance of horizon or your own
config.horizon={hostname:'horizon-testnet.stellar.org', secure:true, port:443};

// include the js-stellar-sdk
// it provides a client side interface to horizon
var StellarSdk = require('stellar-sdk');

// initialize the the Stellar SDK with the horizon instance
// you want to connect to
var server = new StellarSdk.Server(config.horizon);

// Specify the non-native assets you'll accept
var assets = [new StellarSDK.Asset(code, issuer), ...]

// Get the latest cursor position
var last_token = latestFromDB("StellarCursor");

// Listen for payments from where you last stopped
server.payments()
  .forAccount(config.hotWallet)
  .cursor(last_token)
  .stream({onmessage: handlePaymentResponse});

// load the account sequence number from Horizon and return the account
server.loadAccount(config.hotWallet)
  .then(function (account) {
    setInterval(function() {
     // every 30 seconds process any pending transactions
     submitPendingTransactions(account)
    }, 30 * 1000);
  })


```

## Listening for Redemptions
When a user wants to redeem your gateway's credit you should instruct them to send the credit to your hot wallet address with the customerID included in the memo field of the transaction.
This means you must listen for payments to the hot wallet account and record any user that sends credit there.

Here is how you listen for these payments:
```js

// start listening for payments from where you last stopped

var last_token = latestFromDB("StellarCursor");

server.payments()
  .forAccount(config.hotWallet)
  .cursor(last_token)
  .stream({onmessage: handlePaymentResponse});

```
For every payment received by the hot wallet, you must:

-check the memo field to determine which user sent the deposit.
-record the cursor in the StellarCursor table so you can resume payment processing where you left off.
-credit the user's account in the DB with the amount of the asset they sent to deposit.

So, you pass this function as the `onmessage` option when you stream payments:

```js

function handlePaymentResponse(record) {

  // As a gateway, you shouldn't be getting native lumens
  var paymentAsset = record.asset_type != 'native'?
    new StellarSdk.Asset(record.asset_code, record.issuer) :
    return;

  record.transaction()
    .then(function(txn) {
      var customer = txn.memo;
      if (record.to != config.hotWallet) {
        return;
      }
      if (!assets.include(paymentAsset)) {
         // if you are a gateway for certain assets and the customer sends
         // you assets you don't accept, some options for handling it are
         // 1. Trade the asset to your asset and credit that amount
         // 2. Send it back to the customer
      } else {
        // credit the customer in the memo field
        if (checkExists(customer, "ExchangeUsers")) {
          // Store the amount the customer has paid you in your database
          store([record.amount, customer, paymentAsset.getCode(), paymentAsset.getIssuer()], "StellarDeposits");
          // keep the cursor
          store(record.paging_token, "StellarCursor");
        } else {
          // if customer cannot be found, you can raise an error,
          // add them to your customers list and credit them,
          // or anything else appropriate to your needs
          console.log(customer);
        }
      }
    })
    .catch(function(err) {
      // Process error
    });
}

```




## Issuing Credit
When a user requests credit from your gateway, you must generate a Stellar transaction in order to send it to them.


The function `handleRequestWithdrawal` will queue up a transaction in your `StellarPayments` table whenever a withdrawal is requested.


```
function handleRequestWithdrawal(userID, assetAmount, assetCode, assetIssuer, destinationAddress) {

  // read the user's balance from the gateway's database
  var userBalance = getBalance('userID', assetCode, assetIssuer);

  // check that user has the required lumens
  if (assetAmount <= userBalance) {

    // debit  the user's internal lumen balance by the amount of lumens they are withdrawing
    store([userID, userBalance - assetAmount, assetCode, assetIssuer], "UserBalances");

    // save the transaction information in the StellarWithrawals table
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
  server.loadAccount(destinationAddress)

    // If so, continue by submitting a transaction to the destination
    .then(function(account) {
      var transaction = new StellarSdk.Transaction(sourceAccount)
        .addOperation(StellarSdk.Operation.payment({
          destination: destinationAddress,
          asset: StellarLib.Asset.native(),
          amount: amountLumens
        }))
        // sign the transaction
        .addSigner(StellarSdk.Keypair.fromSeed(config.hotWalletSeed))
        .build();
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


// This function handles submitting all pending transactions, and calls the previous one.
// This should be run in the background continuously

function submitPendingTransactions(sourceAccount) {

  // see what transactions in the db are still pending
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
The Federation protocol allows you to give your users easy addresses something like bob*yourgateway.com rather than cumbersome raw addresses like: GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ?19327
Check out the [federation guide](../concepts/federation.md) for more information.

### Restricting who can hold your credit
By default anyone can hold your credit. It is possible to restrict this to only accounts that have been authorized by you. See the `flags` section of the [accounts guide](../concepts/accounts.md) for more information about this.




