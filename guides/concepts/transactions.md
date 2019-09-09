---
title: Transactions
---

Transactions are commands that modify the ledger state. Among other things, Transactions are used to send payments, enter
orders into the [distributed exchange](./exchange.md), change settings on accounts, and authorize another account to hold
your currency. If you think of the ledger as a database, then transactions are SQL commands.

## Transaction Attributes

Each transaction has the following attributes:
> #### Source Account
> This is the account that originates the transaction. The transaction must be signed
> by valid signers for this account, and they must collectively meet a low threshold for the
> account. In addition, the transaction fee must be paid by this account. The sequence number of
> this transaction is based off this account.
>
> #### Fee
> Each transaction sets a [fee](./fees.md#transaction-fee) that is paid by the source account.
>
> #### Sequence Number
> Each transaction has a sequence number associated with the source account. Transactions follow a
> strict ordering rule when it comes to processing transactions per account in order to prevent
> double-spending. When submitting a single transaction, you should submit a sequence number 1
> greater than the current sequence number. For example, if the sequence number on the account is
> 4, then the incoming transaction should have a sequence number of 5.
>
> However, if several transactions with the same source account make it into the same transaction
> set, they are ordered and applied according to sequence number. For example, if you submitted 3
> transactions that shared the same source account and the account is currently at sequence number
> 5, the transactions must have sequence numbers 6, 7, and 8.
>
> #### List of Operations
> Transactions contain an arbitrary list of [operations](./operations.md) inside them. Typically there is just one operation, but it's possible to have multiple (up to 100).  Operations are executed in order as one ACID transaction, meaning that either all operations are applied or none are.  If any operation fails, the whole transaction fails. If operations are on accounts other than the source account, then they require signatures of the accounts in question.
>
> #### List of Signatures
> Up to 20 signatures can be attached to a transaction. See [Multi-sig](./multi-sig.md) for more information. A transaction is considered invalid if it includes signatures that aren't needed to authorize the transaction—superfluous signatures aren't allowed.
>
> Signatures are required to authorize operations and to authorize changes to the source account (fee and sequence number).
>
> #### Memo
> The memo contains optional extra information. It is the responsibility of the client to interpret this value. Memos can be one of the following types:
>   - `MEMO_TEXT` : A string encoded using either ASCII or UTF-8, up to 28-bytes long.
>   - `MEMO_ID` :  A 64 bit unsigned integer.
>   - `MEMO_HASH` : A 32 byte hash.
>   - `MEMO_RETURN` : A 32 byte hash intended to be interpreted as the hash of the transaction the sender is refunding.
>
> #### Time Bounds
> The optional UNIX timestamp (in seconds), determined by ledger time, of a lower and upper bound
> of when this transaction will be valid. If a transaction is submitted too early or too late, it
> will fail to make it into the transaction set. `maxTime` equal `0` means that it's not set. _We
> highly advise for all transactions to use time bounds, and many SDKs enforce their usage._ If a
> transaction doesn't make it into the transaction set, it is kept around in memory in order to be
> added to the next transaction set on a best effort basis. Because of this behavior, we highly
> advise that all transactions are created with time bounds in order to invalidate transactions
> after a certain amount of time, especially if you plan to resubmit your transaction at a later
> time.

## Transaction Envelopes
Once a transaction is ready to be signed, the transaction object is wrapped in an object called a
`Transaction Envelope`, which contains the transaction as well as a set of signatures. Most
transaction envelopes only contain a single signature along with the transaction, but in
[multi-signature setups](./multi-sig.md) it can contain many signatures.

Ultimately, transaction envelopes are passed around the network and are included in transaction
sets, as opposed to raw Transaction objects.

It's of note that each signer signs the hash of the transaction object in addition to the network
passphrase. This is done to ensure that a given transaction can only be submitted to the intended
network by its signers. For more information, see [Networks](./networks.md).

## Validity of a Transaction

To determine if a transaction is valid, many checks take place over the course of the transaction's
lifecycle. The following conditions determine whether a transaction is valid:

* **Source Account** — The source account must exist on the ledger.
* **Fee** — The fee must be greater than or equal to the [network minimum fee](./fees.md) for the
  number of operations submitted as part of the transaction. Note that this does not guarantee that
  the transaction will be applied; it only guarantees that it is valid. In addition, the source
  account must be able to pay the fee specified. In the case where multiple transactions are
  submitted but only a subset of them can be paid for, they are checked for validity in order of
  sequence number.
* **Sequence Number** — For the transaction to be valid, the sequence number
  must be 1 greater than the sequence number stored in the source account [account
  entry](./accounts.md) _when the transaction is applied_. This means when checking the validity of
  multiple transactions with the same source account in a candidate transaction set, they must all
  be valid transactions and their sequence numbers must be offset by 1 from each other. When it
  comes to apply time, they are ordered and applied according to their sequence number.
  * For example, if your source account's sequence number is 5 and you submit 3 transactions, all
    transactions must be considered valid and their sequence numbers must be 6, 7, and 8 in order
    for any of them to make it into a candidate transaction set.
* **List of Operations** — Each operation must pass all of the [validity checks for an
  operation](./operations.md#validity-of-an-operation).
* **List of Signatures** — In addition to meeting the signature requirements of each operation in the
  transaction, the following requirements must be met for the transaction:
  * The appropriate network passphrase was part of the transaction hash that was signed by each of
    the signers. See [Networks](./networks.md) for more on network passphrases.
  * The combined weight of all signatures for the source account _of the transaction_ meets
    the low threshold for the source account. This is necessary in order for fees to be taken and
    the sequence number to be incremented later in the transaction lifecycle.
* **Memo** — The memo type must be a valid type, and the memo itself must be adhere to the formatting
  of the memo type.
* **Time Bounds** — The transaction must be submitted within the set time bounds of the
  transaction, otherwise it will be considered invalid.

## Transaction Lifecycle

1. **Creation (Transaction Creator)**: A user creates a transaction by setting the source
   account, sequence number, list of operations and their respective parameters, fee, and
   optionally a memo and timebounds.  You can try this out [using the Stellar
   Laboratory][lab-tx-create].

2. **Signing (Transaction Signers)**: Once the transaction is completely filled out, the
   transaction is formed into a transaction envelope, which contains the transaction itself and a
   list of signers. All the required signatures must be collected and added to the transaction
   envelope's list of signers.  Commonly it's just the signature of the account doing the
   transaction, but more complicated setups can require collecting [signatures from multiple
   parties](./multi-sig.md).

3. **Submitting (Transaction Submitter)**: After signing, the transaction must be valid and can now
   be submitted to the Stellar network. If the transaction is invalid, it will be immediately
   rejected by stellar-core based on [the validity rules of a
   transaction](#validity-of-a-transaction), the account's sequence number will not be incremented,
   and no fee will be consumed from the source account.  Multiple transactions for the same account
   can be submitted, provided each of their sequence numbers are off by one. If they are all valid,
   stellar-core will craft a transaction set with each of those transactions applied in sequence
   number order. Transactions are typically submitted using [horizon][horizon-tx-create], but you
   can also submit the transaction directly to an instance of
   [stellar-core](https://github.com/stellar/stellar-core).

4. **Propagating (Validator)**: Once stellar-core has determined that a transaction is valid, it
   will then propagate the transaction to all of the other servers to which it's connected. In this
   way, a valid transaction is flooded to the entire Stellar network.

5. **Crafting a candidate transaction set (Validator)**: When it's time to close the ledger, each
   stellar-core validator (a [stellar-core node][types-of-nodes] participating in consensus) takes
   all valid transactions it is aware since the last ledger close and collects them into a
   candidate transaction set. If it hears about any incoming transactions now, it puts them aside
   for the next ledger close. If the number of operations in the candidate transaction set is
   greater than the maximum number of operations per ledger, transactions will be prioritized by
   their fee for inclusion in the set.

6. **Nominating a transaction set (Validator)**: Once each validator has crafted a candidate
   transaction set, the set is nominated to the network.

7. **Stellar Consensus Protocol (SCP) determines the final transaction set (Validator Network)**:
   SCP resolves any differences between candidate transaction sets, and ultimately determining a
   single transaction set to apply, the close time of the ledger, and any upgrades to the protocol
   that need to be applied network wide at apply time.
   * If a transaction doesn't make it into the transaction set, it is kept around in memory in
     order to be added to the next transaction set on a best effort basis.
   * If a transaction is kept in memory after a certain number of ledger closes, it will be banned
     for several additional ledgers. This means no attempt will be made to include it in a
     candidate transaction set additional ledgers during this time.

8. **Transaction apply order is determined (Validator Network)**: Once SCP agrees on a particular
   transaction set, the apply order in computed for the transaction set. This both shuffles the
   order of the set in order to create uncertainty for competing transactions, and maintains the
   order of sequence numbers for multiple transactions per account.

9. **Fees are collected (Validator)**: [Fees](./fees.md) are collected for all transactions
   simultaneously.

10. **Application (Validator)**: Each transaction is applied in the order previously determined.
    For each transaction, the account's sequence number is consumed (increased by 1), the
    transaction's validity is checked again, and each operation is applied in the order they occur
    in the transaction. Operations may fail at this stage due to errors that can occur outside of
    the transaction and operation validity checks. For example, an insufficient balance for a
    payment is not checked at submission, and would fail at this time. If any operation fails, the
    entire transaction will fail, and all previous operations will be rolled back.

11. **Protocol Upgrades (Validator)**: Finally, upgrades are run if an upgrade took place. This
    can include arbitrary logic[^1] to upgrade the ledger state for protocol upgrades, along with
    ledger header modifications including the protocol version, base fee, maximum number of
    operations per ledger, etc. Once this has completed, the life cycle begins anew.

## Possible Errors

Transaction can fail with one of the errors in a table below. Error reference for operations can be
found in [List of operations](./list-of-operations.md) doc.

| Error | Code | Description |
| --- | --- | --- |
| FAILED | -1 | One of the operations failed (check [List of operations](./list-of-operations.md) for errors). |
| TOO_EARLY | -2 | Ledger `closeTime` before `minTime` value in the transaction. |
| TOO_LATE | -3 | Ledger `closeTime` after `maxTime` value in the transaction. |
| MISSING_OPERATION | -4 | No operation was specified. |
| BAD_SEQ | -5 | Sequence number does not match source account. |
| BAD_AUTH | -6 | Too few valid signatures / wrong network. |
| INSUFFICIENT_BALANCE | -7 | Fee would bring account below [minimum reserve](./fees.md). |
| NO_ACCOUNT | -8 | Source account not found. |
| INSUFFICIENT_FEE | -9 | [Fee](./fees.md) is too small. |
| BAD_AUTH_EXTRA | -10 | Unused signatures attached to transaction. |
| INTERNAL_ERROR | -11 | An unknown error occured. |

[horizon-tx-create]: https://www.stellar.org/developers/horizon/reference/transactions-create.html
[lab-tx-create]: https://www.stellar.org/laboratory/#txbuilder?network=test
[types-of-nodes]: https://www.stellar.org/developers/stellar-core/software/admin.html#level-of-participation-to-the-network
[^1]: For an example of protocol upgrade logic, see [CAP-0003](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0003.md#upgrading-the-protocol-version).
