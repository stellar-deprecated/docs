---
title: Operations
---

[Transactions](./transactions.md) are made up of a [list of operations](./list-of-operations.md).
Each operation is an individual command that mutates the ledger.

Here are the possible operation types:
- [Create Account](./list-of-operations.md#create-account)
- [Payment](./list-of-operations.md#payment)
- [Path Payment Strict Send](./list-of-operations.md#path-payment-strict-send)
- [Path Payment Strict Receive](./list-of-operations.md#path-payment-strict-receive)
- [Manage Buy Offer](./list-of-operations.md#manage-buy-offer)
- [Manage Sell Offer](./list-of-operations.md#manage-sell-offer)
- [Create Passive Sell Offer](./list-of-operations.md#create-passive-sell-offer)
- [Set Options](./list-of-operations.md#set-options)
- [Change Trust](./list-of-operations.md#change-trust)
- [Allow Trust](./list-of-operations.md#allow-trust)
- [Account Merge](./list-of-operations.md#account-merge)
- [Manage Data](./list-of-operations.md#manage-data)
- [Bump Sequence](./list-of-operations.md#bump-sequence)

Operations are executed on behalf of the source account specified in the
transaction, unless there is an override defined for the operation.

## Thresholds

Each operation falls under a specific threshold category: low, medium, or high.
Thresholds define the level of privilege an operation needs in order to succeed.

* Low Security:
  * `AllowTrust`
  * `BumpSequence`
* Medium Security:
  * Everything Else (`Payment`, `ChangeTrust`, etc.).
* High Security:
  * `AccountMerge`
  * `SetOptions` (only when changing signers and the thresholds for each category).


## Validity of an Operation

When an operation is submitted as a part of a transaction to the network, the node to which the
transaction is initially submitted checks the validity of each operation before attempting to
include the entire transaction in a candidate transaction set. For more details on this process,
see the [lifecycle of a transaction][tx-lifecycle].

The operation validity checks at this level of the protocol are intended to be fast and simple,
leaving more intensive checks to be applied after fees have been consumed. The following conditions
determine whether an operation is valid or not:

1. The signatures on the transaction are valid for the operation. This includes:
   * The signatures are from valid signers for the source account of the operation.
   * The combined weight of all signatures for the source account _of the operation_ meet the
     threshold for the operation.
2. The operation itself is well formed. Typically this means checking the parameters for the
   operation to see if they're in a valid format.
   * For example, only positive values can be set for the amount of a payment operation.
3. The operation must be valid in the current protocol version of the network. Many newer
   operations are only valid when the current protocol version is greater than or equal to the
   version where the operation was first introduced, for example `ManageBuyOffer` in Stellar
   Protocol 11.

## Result

For each operation, there is a matching result type. In the case of success, this result allows
users to gather information about the effects of the operation. In the case of failure, it allows
users to learn more about the error.

## Examples
### 1. Exchanging without a third party

Anush wants to send Bridget some XLM (Operation 1) in exchange for BTC (Operation 2).

The following transaction is constructed:
* Source Account = `Anush_account`
* Operation 1
  * Source Account = `null` (Inferred to be `Anush_account` from the transaction source account)
  * Payment (XLM) --> `Bridget_account`
* Operation 2
  * Source Account = `Bridget_account`
  * Payment (BTC) --> `Anush_account`

**Signatures**
* Operation 1: Requires signatures from `Anush_account` (the operation inherits
  the source account from the transaction) to meet medium threshold for a `Payment` operation.
* Operation 2: Requires signatures for `Bridget_account` to meet medium threshold for a `Payment`
  operation.
* Transaction: Requires signatures for `Anush_account` to meet low threshold since `Anush_account`
  is the source for the entire transaction.

Therefore, if both `Anush_account` and `Bridget_account` sign the transaction, it will be
validated. Other, more complex ways of submitting this transaction are possible (typically
involving [multi-sig](./multi-sig.md)), but signing with those two accounts is sufficient.

### 2. Workers

An anchor wants to divide the processing of their online ("base") account between machines. That
way, each machine will submit transactions from its local account and keep track of its own
[sequence number](./transactions.md#sequence-number).

* Each machine gets a key pair associated with it. For this example, let's say there are 3
  machines: `Machine_1`, `Machine_2`, and `Machine_3`.
* All three machines are added as Signers to the anchor's base account `BaseAccount`, with
  a weight that gives each individual key the ability to perform medium security transactions. The
  worker machines can then sign on behalf of the base account. For more on signing, please refer
  to our [multisig documentation](multi-sig.md).
* When a machine (say `Machine_2`) wants to submit a transaction to the network, it constructs the
  following transaction:
  * Source Account = `Machine_2`
  * Sequence Number = Sequence number of `Machine_2`'s account
  * Operation 1
    * Source Account = `BaseAccount`
    * Payment (USD) --> `DestinationAccount`

**Signatures**
* Operation 1: Requires the signatures from `BaseAccount` to meet medium threshold for a `Payment`
  operation. Since `Machine_2` is a signer on `BaseAccount` which meets medium threshold, the
  signature is valid and sufficient.
* Transaction: Requires signatures for `Machine_2` to meet low threshold since `Machine_2` is the
  source for the entire transaction. Without changing the thresholds for `Machine_2`,
  `Machine_2`'s key will already be able to perform up to high security operations, and will be
  valid and sufficient.

The benefit of this scheme is that each machine can increment its sequence number and submit a
transaction without invalidating any transactions submitted by the other machines. Recall from our
[transactions](transactions.md) documentation that all transactions from a source account have
their own specific sequence number. Using worker machines, each with their own separate account,
allows an anchor to submit as many transactions as possible without sequence number collisions.

### 3. Long-lived Transactions

Transactions that require multiple parties to sign, such as the exchange transaction between Anush
and Bridget from example #1, can take an arbitrarily long time. Because all transactions are
constructed with specific sequence numbers, waiting on the signatures can block Anush's account. To
avoid this situation, a scheme similar to Example #2 can be used.

Anush would create a temporary account `Anush_temp`, fund `Anush_temp` with XLM, and add the
`Anush_account` public key as signer to `Anush_temp` with a weight crossing at least the low
threshold.

A transaction is then constructed:
* Source Account = `Anush_temp`
* Sequence Number = Sequence number of `Anush_temp`'s account
* Operation 1
  * Source Account = `Anush_account`
  * Payment (XLM) -> `Bridget_account`
* Operation 2
  * Source Account = `Bridget_account`
  * Payment (BTC) -> `Anush_account`

**Signatures**
* Operation 1: Requires the signatures from `Anush_account` to meet the medium threshold for a
  `Payment` operation.
* Operation 2: Requires the signatures from `Bridget_account` to meet the medium threshold for a
  `Payment` operation.
* Transaction: Requires the signatures for `Anush_temp` to meet low threshold since `Anush_temp` is
  the source for the entire transaction.

All of these requirements would be met by having `Anush_account` and `Bridget_account` with the
current setup, but with the additional benefit that the sequence number consumed will be from
account `Anush_temp`. This allows `Anush_account` to continue to perform other operations while
awaiting signature.

If `Anush_account` wants to recover the XLM balance from `Anush_temp` used to fund the account, an
additional operation "Operation 3" can be included in the transaction. If you want to do this,
`Anush_temp` must add `Anush_account` as a signer with a weight that crosses the high threshold:
  * Operation 3
    * Source Account = `null` (Inferred to be `Anush_temp` from the transaction source account)
    * Account Merge -> `Anush_account`

This will ultimately merge `Anush_temp`'s balance into `Anush_account`.

[tx-lifecycle]: ./transactions.md#life-cycle
