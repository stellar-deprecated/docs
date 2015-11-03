---
title: Channels
---
*Method for submitting transactions to the network at a high rate*

If you are submitting [transactions](../concepts/transactions.md) to the network at a high rate you must be careful that the transactions are submitted in the correct order of their sequence numbers. This can be problematic since typically you are submitting through Horizon and there is no guarantee that a given transaction is received by [stellar-core](https://github.com/stellar/stellar-core) until ledger close. This means that they can reach stellar-core out of order and will bounce with a bad sequence error. If you do wait for ledger close to avoid this issue that will greatly reduce the rate you can submit transactions to the network.

The way to avoid this is with the concept of **channels**.

A channel is simply another account that is used not to send the funds but as the "source" account of the transaction. You can then use one common account (your hot wallet) as the source of the payment [operation](../concepts/operation.md) inside the transaction. Then the channel account will consume the sequence number even though the funds are being sent from your hot wallet. 

Channels take advantage of the fact that the "source" account of a transaction can be different than the source account of the operations inside the transaction. With this set up you can make as many channels as you need to maintain your desired transaction rate.

You of course will have to sign the transaction with both the hot wallet key and the channel key. 

For example:
```
// create payment from hotwallet to customerAddress
var transaction = new StellarSdk.TransactionBuilder(channelAccounts[channelIndex])
            .addOperation(StellarSdk.Operation.payment({
                source: hotWallet.address(),
                destination: customerAddress,
	    asset: StellarSdk.Asset.native(),
                amount: amountToSend
            }))
            .build();

        transaction.sign(hotWalletKey);
        transaction.sign(channelKeys[channelIndex]);

``` 
