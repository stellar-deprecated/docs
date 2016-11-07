---
title: Operations
---

[Transactions](./transactions.md) are made up of a [list of operations](./list-of-operations.md). Each
operation is an individual command that mutates the ledger.

Here are the possible operation types:
- [Create Account](./list-of-operations.md#create-account)
- [Payment](./list-of-operations.md#payment)
- [Path Payment](./list-of-operations.md#path-payment)
- [Manage Offer](./list-of-operations.md#manage-offer)
- [Create Passive Offer](./list-of-operations.md#create-passive-offer)
- [Set Options](./list-of-operations.md#set-options)
- [Change Trust](./list-of-operations.md#change-trust)
- [Allow Trust](./list-of-operations.md#allow-trust)
- [Account Merge](./list-of-operations.md#account-merge)
- [Inflation](./list-of-operations.md#inflation)
- [Manage Data](./list-of-operations.md#manage-data)

Operations are executed on behalf of the source account specified in the
transaction, unless there is an override defined for the operation.

## Thresholds

Each operation falls under a specific threshold category: low, medium, or high.
Thresholds define the level of privilege an operation needs in order to succeed.

* Low Security:
  * AllowTrustTx
  * Used to allow other signers to allow people to hold credit from this
   account but not issue credit.
* Medium Security:
  * All else
* High Security:
  * SetOptions for Signer and threshold
  * Used to change the Set of signers and the thresholds.

## Validity of an operation

There are two places in a [transaction life cycle](./transactions.md#life-cycle) when operations can fail. The first time is when a transaction is submitted to the network. The node to which the transaction is submitted checks the validity of the operation: in the **validity check**, the node performs some cursory checks to make sure the transaction is properly formed before including it in its transaction set and forwarding the transaction to the rest of the network.

The validity check only looks at the state of the source account. It ensures that:
1) the outer transaction has enough signatures for the source account of the operation to meet the threshold for that operation.
2) Operations-specific validity checks pass. These checks are ones that would stay true regardless of the ledger state—for example, are the parameters within the expected bounds? Checks that depend on ledger state don't happen until apply time—for example, a send operation won't check if you have enough balance to send until apply time.

Once a transaction passes this first validity check, it is propagated to the network and eventually included in a transaction set. As part of a transaction set, the transaction is applied to the ledger. At that point a fee is taken from the source account. Operations are attempted in the order they occur in the transaction. If any operation fails, the whole transaction fails and the effects of previous operations are rolled back.


## Result

For each operation, there is a matching result type. In the case of success, this result allows users to gather information about the effects of the operation. In the case of failure, it allows users to learn more about the error.

Stellar Core queues results in the txhistory table for other components to derive data from. This txhistory table is used by the history module in Stellar Core for uploading the history into long-term storage. It can also be used by external processes such as Horizon to gather the network history they need.

## Transactions involving multiple accounts

Typically transactions only involve operations on a single account. For example, if account A wanted to send lumens to account B, only account A needs to authorize the transaction.

It's possible, however, to compose a transaction that includes operations on multiple accounts. In this case, to authorize the operations, the transaction envelope must include signatures of every account in question. For example, you can make a transaction where accounts A and B both send to account C. This transaction would need authorization from both account A and B before it's submitted to the network.


## Examples
### 1. Exchange without third party

  Anush wants to send Bridget some XLM (Operation 1) in exchange for BTC (Operation 2).

  A transaction is constructed:
  * source = `Anush_account`
  * Operation 1
    * source = _null_
    * Payment send XLM --> `Bridget_account`
  * Operation 2
    * source = _`Bridget_account`
    * Payment send BTC --> `Anush_account`

   Signatures required:
  * Operation 1: requires signatures from `Anush_account` (the operation inherits
    the source account from the transaction) to meet medium threshold
  * Operation 2: requires signatures for `Bridget_account` to meet medium threshold
  * The transaction requires signatures for `Anush_account` to meet low threshold since `Anush_account` is the
    source for the entire transaction.

Therefore, if both `Anush_account` and `Bridget_account` sign the transaction, it will be validated.  
Other, more complex ways of submitting this transaction are possible, but signing with those two accounts is sufficient.

### 2. Workers

   An anchor wants to divide the processing of their online ("base") account between machines. That way, each machine will submit transactions from its local account and keep track of its own sequence number. For more on transaction sequence numbers, please refer to [the transactions doc](./transactions.md).

   * Each machine gets a private/key pair associated with it. Let's say there are only 3 machines: Machine_1, Machine_2, and Machine_3. (In practice, there can be as many machines as the anchor wants.)
   * All three machines are added as Signers to the anchor's base account "baseAccount", with
     a weight that gives them medium rights. The worker machines can then sign on behalf of the base account. (For more on signing, please refer to the [multisig documentation](multi-sig.md).)
   * When a machine (say Machine_2) wants to submit a transaction to the network, it constructs the transaction:
      * source=_public key for Machine_2_
      * sequence number=_sequence number of Machine_2's account_
      * Operation
        * source=_baseAccount_
        * Payment send an asset --> destination account
   * sign it with the private key of Machine_2.

   The benefit of this scheme is that each machine can increment its sequence number and submit a transaction without invalidating any transactions submitted by the other machines.  Recall from the [transactions doc](transactions.md) that all transactions from a source account have their own specific sequence number.  Using worker machines, each with an account, allows this anchor to submit as many transactions as possible without sequence number collisions.

### 3. Long-lived transactions

Transactions that require multiple parties to sign, such as the exchange transaction between Anush and Bridget from example #1, can take an arbitrarily long time. Because all transactions are constructed with specific sequence numbers, waiting on the signatures can block Anush's account. To avoid this situation, a scheme similar to Example #2 can be used.

  Anush would create a temporary account `Anush_temp`, fund `Anush_temp` with XLM, and add the `Anush_account` public key as signer to `Anush_temp` with a weight crossing at least the low threshold.

  A transaction is then constructed:
  * source=_Anush_temp_
  * sequence number=_Anush_temp seq num_
  * Operation 1
    * source=_Anush_account_
    * Payment send XLM -> Bridget_account
  * Operation 2
    * source=_Bridget_account_
    * Payment send BTC -> Anush_account

  The transaction would have to be signed by both Anush_account and Bridget_account, but the sequence
  number consumed will be from account Anush_temp.

  If `Anush_account` wants to recover the XLM balance from `Anush_temp`, an additional operation "Operation 3" can be included in the transaction. If you want to do this, `Anush_temp` must add `Anush_account` as a signer with a weight that crosses the high threshold:
  * Operation 3
    * source=_null_
    * Account Merge -> "Anush_account"
