---
title: Multisig
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

Each account can set its own threshold values. By default all thresholds levels are set to 0, and the master key is set to weight 1. 

Let's say Diyang sets the medium threshold on one of her accounts to 4. If that account submits a transaction that includes a payment operation (medium security), the transaction's threshold is 4--the signature weights on it need to exceed 4 in order to run.  If Diyang's master key--the key corresponding to the public key that identifies the account she owns--has a weight below 4, she cannot authorize a transaction without other signers.

* Low Security:
 * [Allow Trust](./list-of-operations.md#allow-trust) operation
 * Used to allow people to hold credit from this account without exposing the key that enables sending payments from this account. 
* Medium Security:
 * All other operations
* High Security:
 * [Set Options](./list-of-operations.md#set-options) to change the signers or the thresholds
 * Allows you to create a set of signers that give or revoke access to the account.

The [Set Options](./list-of-operations.md#set-options) operation allows you to change the weight of the master key and to add other signing keys with different weights.



## Additional signing keys
Accounts are identified by a public key. The private key that corresponds to this public key is called the **master key**. Additional signing keys can be added to the account using the [Set Options](./list-of-operations.md#set-options) operation. 

"Signers" refers to the master key or to any signing keys added later. A signer is defined as the pair: public key, weight.  

Each additional signer beyond the master key increases the account's [minimum balance](./fees.md#minimum-balance).


## Envelopes
A transaction **envelope** wraps a transaction with a set of signatures. The transaction object is the thing that the signers are actually signing. Technically, a transaction envelope is the thing that is passed around the network and included in transaction sets. 

## Authorization
To determine if a transaction has the necessary authorization to run, the weights of all the signatures in the transaction envelope are added up. If this sum is equal to or greater than the threshold (see below) set for that operation type, then the operation is authorized.

This scheme is very flexible. You can require many signers to authorize payments from a particular account. You can have an account that any number of people can authorize for. You can have a master key that grants access or revokes access from others. It supports any m of n setup.


## Operations
### Examples
1. You run a gateway that would like to keep its issuing key offline. That way, it's less likely a bad actor can get a hold of the gateway's key and start issuing credit improperly. However, your gateway needs to authorize people holding credit by running the `Allow Trust` operation. Before you issue credit to an account, you need to verify that account is OK.

Multisig allows you to do all of this without exposing the master key of your gateway. You can add another signing key
to your account with the operation `Set Options`.  This additional key should have a weight below your gateway account's
medium threshold. Since `Allow Trust` is a low-threshold operation, this extra key authorizes users to hold your gateway's
credit. But, since `Payment` is a medium-threshold operation, this key does not allow anyone who compromises your gateway to issue credit.

Your account setup: 
  master key weight:3
  additional signing key weight: 1
  low threshold:0 
  medium threshold:2
  high threshold:2

2. You want to set up a joint account with Bilal and Carina such that any of you can authorize a payment. You also want to set up the account so that, if you choose to change signers (e.g., remove or add someone), a high-threshold operation, all 3 of you must agree. You add Bilal and Carina as signers to the joint account. You also ensure that it takes all of your key weights to clear the high threshold but only one to clear the medium threshold. 

Joint account setup:
  master key weight: 1
  low threshold: 0
  medium threshold: 0
  high threshold: 3
  Bilal's signing key weight: 1
  Carina's signing key weight: 1


3. Your company wants to set up an account that requires 3 of 6 employees to agree to *any* transaction from that account.

Company account setup:
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


4. You fully control an expense account, but you want your two coworkers Diyuan and Emil to be able to authorize transactions
from this account. You add Diyuan and Emil's signing keys to the expense account. If either Diyuan or Emil leave the company,
you can remove their signing key, a high-threshold operation.

Expense account setup: 
  master key weight: 3
  low: 0
  medium: 0
  high: 3
  Diyuan's key weight: 1
  Emil's key weight: 1


5. You want to issue a custom currency and ensure that no more will ever be created. You make a source account and issue
the maximum amount of currency to a holding account. Then you set the master weight of the source account to below the
medium threshold--the source account can no longer issue currency.

Source account setup:
  master key weight: 0
  low threshold: 0
  medium threshold: 0
  high threshold: 0

