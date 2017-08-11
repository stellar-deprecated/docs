---
title: Channels
---
*Method for submitting transactions to the network at a high rate*

If you are submitting [transactions](./concepts/transactions.md) to the network at a high rate or from different processes you must be careful that the transactions are submitted in the correct order of their sequence numbers. This can be problematic since typically you are submitting through Horizon and there is no guarantee that a given transaction is received by [stellar-core](https://github.com/stellar/stellar-core) until ledger close. This means that they can reach stellar-core out of order and will bounce with a bad sequence error. If you do wait for ledger close to avoid this issue that will greatly reduce the rate you can submit transactions to the network.

The way to avoid this is with the concept of **channels**.

A channel is simply another Stellar account that is used not to send the funds but as the "source" account of the transaction. Remember transactions in Stellar each have a source account that can be different than the accounts being effected by the operations in the transaction. The source account of the transaction pays the fee and consumes a sequence number. You can then use one common account (your base account) to make the payment [operation](./concepts/operations.md) inside each transaction. The various channel accounts will consume their sequence numbers even though the funds are being sent from your base account. 

Channels take advantage of the fact that the "source" account of a transaction can be different than the source account of the operations inside the transaction. With this set up you can make as many channels as you need to maintain your desired transaction rate.

You of course will have to sign the transaction with both the base account key and the channel account key.  

For example:
```
StellarSdk.Network.useTestNetwork();
// channelAccounts[] is an array of accountIDs, one for each channel
// channelKeys[] is an array of secret keys, one for each channel
// channelIndex is the channel you want to send this transaction over

// create payment from baseAccount to customerAddress
var transaction =
  new StellarSdk.TransactionBuilder(channelAccounts[channelIndex])
    .addOperation(StellarSdk.Operation.payment({
      source: baseAccount.address(),
      destination: customerAddress,
      asset: StellarSdk.Asset.native(),
      amount: amountToSend
    }))
    .build();

  transaction.sign(baseAccountKey);   // base account must sign to approve the payment
  transaction.sign(channelKeys[channelIndex]);  // channel must sign to approve it being the source of the transaction
``` 
