---
title: Account Management
---

# Creating an account
[Accounts](../../concepts/accounts.md) in Stellar are public/private key pairs. Accounts are identified by the public key and anyone who has access to the private key can submit transactions on the account's behalf.

Every account must maintain a minimum balance of lumens. This is currently 20 lumens for a brand new account. You can read more about [minimum balance here](../../concepts/fees.md#minimum-balance).

There are two steps to creating an account:
- generating the account address.
- funding the account.

## Generating the Address
The account address is simply an ed25519 public key. There are a few ways to generate a new public/private key pair.

Using stellar-core:
```
> stellar-core --genseed
Secret seed: SBASQVH4UXF7JITE4ZWTQ3S43SEACMJPQWTIMWAUYRI2P6CITIRJM4ZX
Public: GBLGVUHXI6K3FWMN7W33GZ6IDJDIAVC4RK7S42MPHUIN6HTULECM3OXT
```

Using js-stellar-sdk:
```
var StellarSdk = require('js-stellar-sdk')
var keypair = StellarSdk.Keypair.random();
console.log("Address: "+keypair.address());
console.log("Seed: "+keypair.seed());
```

Remember to keep your seed safe. Anyone with access to the seed can take any funds held in the account.

## Funding the account
Once you have an address for the account you want to create you must fund it with lumens. You can do this using the [create account](../../concepts/list-of-operations.md#create-account) operation sent by an existing account.
Here is an example of using the js-stellar-sdk:
```
var StellarSdk = require('stellar-sdk')

// create the server connection object
var server = new StellarSdk.Server({hostname:'horizon-testnet.stellar.org', secure: true, port: 443});
// uncomment below if you want to submit the transaction to the live network
// StellarSdk.Network.usePublicNetwork();

var fundingAccountAddress="GCE... enter your real address here";
var fundingAccountSecret="SDJ... enter your real secret here";

var newAccountAddress="GCE... enter your real address here";

server.loadAccount(fundingAccountAddress)
    .then(function (account) {
        // build the transaction
        var transaction = new StellarSdk.TransactionBuilder(account)
            // this operation funds the new account with XLM
            .addOperation(StellarSdk.Operation.createAccount({
                destination: newAccountAddress,
                startingBalance: "200"
            }))
            .build();
            
        // sign the transaction
        transaction.sign(StellarSdk.Keypair.fromSeed(fundingAccountSecret)); 
        
        return server.submitTransaction(transaction);
    })
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        console.error(err);
    });
```


## Multi-sig accounts
If you have an account that needs to be used by multiple parties or that you only want to be used if multiple people agree then you want to add additional signers to the account. You can read more about making Stellar accounts require [multi-signatures here](../../concepts/multi-sig.md).



# Deleting an account
Once you no longer need the account you can delete it and recover any lumens that were held in the account. You do this with the [merge account](../../concepts/list-of-operations.md#account-merge) operation.

Example using the js-stellar-sdk:
```
var StellarSdk = require('stellar-sdk')

// create the server connection object
var server = new StellarSdk.Server({hostname:'horizon-testnet.stellar.org', secure: true, port: 443});
// uncomment below if you want to submit the transaction to the live network
// StellarSdk.Network.usePublicNetwork();

var oldAccountAddress="GCE... enter your real address here";
var oldAccountSecret="SDJ... enter your real secret here";

var newAccountAddress="GCE... enter your real address here";

server.loadAccount(oldAccountAddress)
    .then(function (account) {
        // build the transaction
        var transaction = new StellarSdk.TransactionBuilder(account)
            .addOperation(StellarSdk.Operation.accountMerge({
                destination: newAccountAddress
            }))
            .build();
            
        // sign the transaction
        transaction.sign(StellarSdk.Keypair.fromSeed(oldAccountSecret)); 
        
        return server.submitTransaction(transaction);
    })
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        console.error(err);
    });
```
