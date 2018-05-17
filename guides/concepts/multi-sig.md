---
title: Multisignature
---

## Transaction signatures
Stellar uses **signatures** as authorization. Transactions always need authorization from at least one public key in order
to be considered valid. Generally, transactions only need authorization from the public key of the source account.

Transaction signatures are created by cryptographically signing the transaction object contents with a secret key. Stellar
currently uses the ed25519 signature scheme, but there's also a mechanism for adding additional types of public/private
key schemes. A transaction with an attached signature is considered to have authorization from that public key.

In two cases, a transaction may need more than one signature. If the transaction has operations that affect more than one
account, it will need authorization from every account in question. A transaction will also need additional signatures if
the account associated with the transaction has multiple public keys. For examples, see the [operations guide](./operations.md#examples).

## Thresholds
[Operations](./operations.md) fall under a specific threshold category: low, medium, or high.
The threshold for a given level can be set to any number from 0-255. This threshold is the amount of signature weight required to authorize an operation at that level.

Let's say Diyang sets the medium threshold on one of her accounts to 4. If that account submits a transaction that includes a payment operation (medium security), the transaction's threshold is 4--the signature weights on it need to be greater than or equal to 4 in order to run. If Diyang's master key--the key corresponding to the public key that identifies the account she owns--has a weight less than 4, she cannot authorize a transaction without other signers.

Once the signature threshold is met if there are any leftover signatures then the transaction is regarded as having too many signatures which results in a failed transaction even if the remaining signatures are valid, i.e. for a transaction signed with N signatures, if the threshold is reached using K signatures then the transaction will fail if N > K.

Each account can set its own threshold values. By default all thresholds levels are set to 0, and the master key is set to weight 1. The [Set Options](./list-of-operations.md#set-options) operation allows you to change the weight of the master key and to add other signing keys with different weights.

Low Security:
 * [Allow Trust](./list-of-operations.md#allow-trust) operation
 * Used to allow people to hold credit from this account without exposing the key that enables sending payments from this account.

Medium Security:
 * All other operations

High Security:
 * [Set Options](./list-of-operations.md#set-options) to change the signers or the thresholds
 * Allows you to create a set of signers that give or revoke access to the account.



## Additional signing keys
Accounts are identified by a public key. The private key that corresponds to this public key is called the **master key**. Additional signing keys can be added to the account using the [Set Options](./list-of-operations.md#set-options) operation.

If the weight of the master key is ever updated to 0, the master key is considered to be an invalid key and you cannot sign any transactions with it (even for operations with a threshold value of 0). If there are other signers listed on the account, they can still continue to sign transactions.

"Signers" refers to the master key or to any signing keys added later. A signer is defined as the pair: public key, weight. 

Each additional signer beyond the master key increases the account's [minimum balance](./fees.md#minimum-account-balance).

## Alternate Signature Types
To enable some advanced smart contract features there are a couple of additional signature types. These signature types also have weights and can be added and removed similarly to normal signature types. But rather than check a cryptographic signature for authorization they have a different method of proving validity to the network.

### Pre-authorized Transaction
It is possible for an account to pre-authorize a particular transaction by adding the hash of the future transaction as a "signer" on the account. To do that you need to prepare the transaction beforehand with proper sequence number. Then you can obtain the hash of this transaction and add it as signer to account.

Signers of this type are automatically removed from the account when a matching transaction is properly applied. In case of error, or when matching transaction is never submitted, the signer remains and must be manually removed using the [Set Options](./list-of-operations.md#set-options) operation.

This type of signer is especially useful in escrow accounts. You can pre-authorize two different transactions. Both could have the same sequence number but different destinations. This means that only one of them can be executed.

### Hash(x)
Adding a signature of type hash(x) allows anyone who knows `x` to sign the transaction. This type of signer is especially useful in [atomic cross-chain swaps](https://en.bitcoin.it/wiki/Atomic_cross-chain_trading) which are needed for inter-blockchain protocols like [lightning networks](https://lightning.network).

First, create a random 256 bit value, which we call `x`. The SHA256 hash of that value can be added as a signer of type hash(x). Then in order to authorize a transaction, `x` is added as one of the signatures of the transaction.
Keep in mind that `x` will be known to the world as soon as a transaction is submitted to the network with `x` as a signature. This means anyone will be able to sign for that account with the hash(x) signer at that point. Often you want there to be additional signers so someone must have a particular secret key and know `x` in order to reach the weight threshold required to authorize transactions on the account.



## Envelopes
A transaction **envelope** wraps a transaction with a set of signatures. The transaction object is the thing that the signers are actually signing. Technically, a transaction envelope is the thing that is passed around the network and included in transaction sets.

## Authorization
To determine if a transaction has the necessary authorization to run, the weights of all the signatures in the transaction envelope are added up. If this sum is equal to or greater than the threshold (see below) set for that operation type, then the operation is authorized.

This scheme is very flexible. You can require many signers to authorize payments from a particular account. You can have an account that any number of people can authorize for. You can have a master key that grants access or revokes access from others. It supports any m of n setup.


## Operations
### Example 1: Anchors
> You run an anchor that would like to keep its issuing key offline. That way, it's less likely a bad actor can get ahold of the anchor's key and start issuing credit improperly. However, your anchor needs to authorize people holding credit by running the `Allow Trust` operation. Before you issue credit to an account, you need to verify that account is OK.

Multisig allows you to do all of this without exposing the master key of your anchor. You can add another signing key
to your account with the operation `Set Options`.  This additional key should have a weight below your anchor account's
medium threshold. Since `Allow Trust` is a low-threshold operation, this extra key authorizes users to hold your anchor's
credit. But, since `Payment` is a medium-threshold operation, this key does not allow anyone who compromises your anchor to issue credit.

Your account setup:
```
  master key weight: 2
  additional signing key weight: 1
  low threshold: 0
  medium threshold: 2
  high threshold: 2
```

### Example 2: Joint Accounts
> You want to set up a joint account with Bilal and Carina such that any of you can authorize a payment. You also want to set up the account so that, if you choose to change signers (e.g., remove or add someone), a high-threshold operation, all 3 of you must agree. You add Bilal and Carina as signers to the joint account. You also ensure that it takes all of your key weights to clear the high threshold but only one to clear the medium threshold.

Joint account setup:
```
  master key weight: 1
  low threshold: 0
  medium threshold: 0
  high threshold: 3
  Bilal's signing key weight: 1
  Carina's signing key weight: 1
```

### Example 3: Company Accounts
> Your company wants to set up an account that requires 3 of 6 employees to agree to *any* transaction from that account.

Company account setup:
```
  master key weight: 0 (Turned off so this account can't do anything without an employee)
  low threshold: 3
  medium threshold: 3
  high threshold: 3
  Employee 1 key weight: 1
  Employee 2 key weight: 1
  Employee 3 key weight: 1
  Employee 4 key weight: 1
  Employee 5 key weight: 1
  Employee 6 key weight: 1
```

### Example 4: Expense Accounts
> You fully control an expense account, but you want your two coworkers Diyuan and Emil to be able to authorize transactions
from this account. You add Diyuan and Emil's signing keys to the expense account. If either Diyuan or Emil leave the company,
you can remove their signing key, a high-threshold operation.

Expense account setup:
```
  master key weight: 3
  low: 0
  medium: 0
  high: 3
  Diyuan's key weight: 1
  Emil's key weight: 1
```

### Example 5: Custom Currencies
> You want to issue a custom currency and ensure that no more will ever be created. You make a source account and issue
the maximum amount of currency to a holding account. Then you set the master weight of the source account to below the
medium threshold--the source account can no longer issue currency.

Source account setup:
```
  master key weight: 0
  low threshold: 0
  medium threshold: 0
  high threshold: 0
```
Note that even though the thresholds are 0 here, the master key cannot successfully sign a transaction because it's own weight is 0, which makes it an invalid signing key.
