---
title: Operations
---

[Transactions](./transactions.md) are made up of a [list of operations](./list-of-operations.md).
Each operation is an individual command that mutates the ledger.

Here are the possible operation types:
- [Create Account](./list-of-operations.md#create-account)
- [Payment](./list-of-operations.md#payment)
- [Path Payment](./list-of-operations.md#path-payment)
- [Manage Buy Offer](./list-of-operations.md#manage-buy-offer)
- [Manage Sell Offer](./list-of-operations.md#manage-sell-offer)
- [Create Passive Sell Offer](./list-of-operations.md#create-passive-sell-offer)
- [Set Options](./list-of-operations.md#set-options)
- [Change Trust](./list-of-operations.md#change-trust)
- [Allow Trust](./list-of-operations.md#allow-trust)
- [Account Merge](./list-of-operations.md#account-merge)
- [Inflation](./list-of-operations.md#inflation)
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
   * Are the signatures from valid signers for the source account?
   * Was the appropriate network passphrase part of the transaction hash that was signed by each of
     the signers? See [Networks](./networks.md) for more on network passphrases.
   * Does the combined weight of all signatures meet the low threshold for the source account? This
     is necessary in order for fees to be taken and the sequence number to be incremented later in
     the transaction lifecycle.
   * Does the combined weight of all signatures meet the threshold for the operation?
   * Are the signatures intended for the network that it is submitted on? This means that the
2. The operation itself is well formed. Typically this means checking the parameters for the
   operation to see if they're in a valid format.
   * For example, only positive values can be set for the amount of a payment operation.
3. Is the operation valid in the current protocol version of the network? Many newer operations are
   only valid when the current protocol version is greater than or equal to the version where the
   operation was first introduced, for example `ManageBuyOffer` in Stellar Protocol 11.

## Result

For each operation, there is a matching result type. In the case of success, this result allows
users to gather information about the effects of the operation. In the case of failure, it allows
users to learn more about the error.

## Examples
### 1. Exchange without third party

  Anush wants to send Bridget some XLM (Operation 1) in exchange for BTC (Operation 2).

  A transaction is constructed:
  * source = `Anush_account`
  * Operation 1
    * source = _null_
    * Payment send XLM --> `Bridget_account`
  * Operation 2
    * source = `Bridget_account`
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

[tx-lifecycle]: ./transactions.md#life-cycle
