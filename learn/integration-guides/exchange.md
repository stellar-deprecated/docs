---
title: Exchange Guide
---

# Adding Stellar to your Exchange
This guide will walk you through the integration steps to add Stellar to your exchange. This example uses nodejs and the [JS Stellar SDK](https://github.com/stellar/js-stellar-sdk), but it should be easy to adapt to other languages.

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
If your exchange doesn't see a lot of volume, you don't need to set up your own instance of stellar-core and horizon. Use one of the Stellar.org public-facing Horizon servers instead.
``` 
 test net: {hostname:'horizon-testnet.stellar.org', secure:true, port:443}; 
 live: {hostname:'horizon.stellar.org', secure:true, port:443};
```

### Cold wallet
A cold wallet is typically used to keep the bulk of customer funds secure. A cold wallet is a Stellar account whose secret keys are not on any device that touches the Internet. Transactions are manually initiated by a human and signed locally on the offline machine—a local install of js-stellar-sdk creates a tx_blob containing the signed transaction. This tx_blob can be transported to a machine connected to the Internet via offline methods (e.g., USB or by hand). This design makes the cold wallet secret key much harder to compromise.

To learn how to create a cold wallet account, see [account management](./account-management.md).

### Hot wallet
A hot wallet contains a more limited amount of funds than a cold wallet. A hot wallet is a Stellar account used on a machine that is connected to the Internet. It handles the day-to-day sending and receiving of lumens. The limited amount of funds in a hot wallet restrict the amount lost in the event of a security breach.

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
The possible values for StellarTransactions.state are "pending", "done", "error".

### Code
Server setup:
```js
// Config your server
var config;
config.hotWallet="your hot wallet address";

// You can use Stellar.org's instance of horizon or your own
config.horizon={hostname:'horizon-testnet.stellar.org', secure:true, port:443};


// include the js-stellar-sdk
// it provides a client-side interface to horizon
var StellarSdk = require('stellar-sdk');

// initialize the Stellar SDK with the horizon instance
// you want to connect to
var server = new StellarSdk.Server(config.horizon);

// load the account sequence number from Horizon and return the account
server.loadAccount(config.hotWallet)
  .then(function (account) {
    setInterval(function() {
     // every 30 seconds process any pending transactions
     submitPendingTransactions(account)
    }, 30 * 1000);
  })

```

## Listening for deposits
When a user wants to deposit lumens in your exchange, instruct them to send XLM to your hot wallet address with the customerID in the memo field of the transaction.

You must listen for payments to the hot wallet account and credit any user that sends XLM there. How to listen for these payments:
```js

// start listening for payments from where you last stopped

var last_token = latestFromDB("StellarCursor");

server.payments()
  .forAccount(config.hotWallet)
  .cursor(last_token)
  .stream({onmessage: handlePaymentResponse});

```

For every payment received by the hot wallet, you must:<br>
-check the memo field to determine which user sent the deposit.<br>
-record the cursor in the StellarCursor table so you can resume payment processing where you left off.<br>
-credit the user's account in the DB with the number of XLM they sent to deposit.

```js

function handlePaymentResponse(record) {

  record.transaction()
    .then(function(resp) {
      var customer = txn.memo;
      if (record.to === config.hotWallet && record.asset_type === 'native') {
        // credit the customer in the memo field
        if (checkExists(customer, "ExchangeUsers")) {
          // Store the amount the customer has paid you in your database
          store([record.amount, customer], "StellarDeposits");
        } else {
          // if customer cannot be found, you can raise an error,
          // add them to your customers list and credit them,
          // or anything else appropriate to your needs
          console.log(customer);
        }
      } else if (record.asset_type != 'native') {
       // if you are a XLM exchange and the customer sends
       // you a non-native asset, some options for handling it are
       // 1. Trade the asset to native and credit that amount
       // 2. Send it back to the customer
      }

      // keep the cursor
      store(record.paging_token, "StellarCursor");
    })
    .catch(function(err) {
      // Process error
    })
}



```


## Submitting withdrawals
When a user requests a lumen withdrawal from your exchange, you must generate a Stellar transaction to send them the lumens.

```js
function handleRequestWithdrawal(userID,amountLumens,destinationAddress) {
  // read the user's balance from the exchange's database
  var userBalance = getBalance('userID');

  // check that user has the required lumens
  if (amountLumens <= userBalance) {

    // debit  the user's internal lumen balance by the amount of lumens they are withdrawing
    store([userID, userBalance - amountLumens], "UserBalances");

    // save the transaction information in the StellarTransactions table
    store([userID, destinationAddress, amountLumens, "pending"], "StellarTransactions");
  } else {
    // If the user doesn't have enough XLM, you can alert them
  }
}


}

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
        // sign the transaction
        .addSigner(StellarSdk.Keypair.fromSeed(exchangeSeed))
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
        .addSigner(StellarSdk.Keypair.fromSeed(exchangeSeed))
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

//on a timer
function submitPendingTransactions(exchangeAccount) {
  
  // see what transactions in the db are still pending
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
The federation protocol allows you to give your users easy addresses—e.g., bob*yourexchange.com—rather than cumbersome raw addresses such as GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ?19327

For more information, check out the [federation guide](../concepts/federation.md).

### Gateway
If you're an exchange, it's easy to become a Stellar gateway as well. The integration points are very similar, with the same level of difficulty. Becoming a gateway could potentially expand your business.

To learn more about what it means to be a gateway, see the [gateway guide](../concepts/gateways.md).



