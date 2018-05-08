---
title: Transactions
---

Transactions are commands that modify the ledger state. Among other things, Transactions are used to send payments, enter
orders into the [distributed exchange](./exchange.md), change settings on accounts, and authorize another account to hold
your currency. If you think of the ledger as a database, then transactions are SQL commands.


Each transaction has the following attributes:
> #### Source account
> This is the account that originates the transaction. The transaction must be signed by this account, and the transaction fee must be paid by this account. The sequence number of this transaction is based off this account.
>
> #### Fee
> Each transaction sets a [fee](./fees.md#transaction-fee) that is paid by the source account. If this fee is below the network minimum the transaction will fail. The more operations in the transaction, the greater the required fee.
>
> #### Sequence number
> Each transaction has a sequence number. Transactions follow a strict ordering rule when it comes to processing of transactions per account. For the transaction to be valid, the sequence number must be 1 greater than the sequence number stored in the source [account entry](./accounts.md) when the transaction is applied. After the transaction is applied, the source account's stored sequence number is incremented by 1. If the sequence number on the account is 4, then the incoming transaction should have a sequence number of 5. After the transaction is applied, the sequence number on the account is bumped to 5.
>
> Note that if several transactions with the same source account make it into the same transaction set, they are ordered and applied according to sequence number. For example, if 3 transactions are submitted and the account is at sequence number 5, the transactions must have sequence numbers 6, 7, and 8.
>
> #### List of operations
> Transactions contain an arbitrary list of [operations](./operations.md) inside them. Typically there is just one operation, but it's possible to have multiple (up to 100).  Operations are executed in order as one ACID transaction, meaning that either all operations are applied or none are.  If any operation fails, the whole transaction fails. If operations are on accounts other than the source account, then they require signatures of the accounts in question.
>
> #### List of signatures
> Up to 20 signatures can be attached to a transaction. See [Multi-sig](./multi-sig.md) for more information. A transaction is considered invalid if it includes signatures that aren't needed to authorize the transaction—superfluous signatures aren't allowed.
>
> #### Memo
> *optional* The memo contains optional extra information. It is the responsibility of the client to interpret this value. Memos can be one of the following types:
>   - `MEMO_TEXT` : A string encoded using either ASCII or UTF-8, up to 28-bytes long.
>   - `MEMO_ID` :  A 64 bit unsigned integer.
>   - `MEMO_HASH` : A 32 byte hash.
>   - `MEMO_RETURN` : A 32 byte hash intended to be interpreted as the hash of the transaction the sender is refunding.
>
> #### Time bounds
> *optional* The UNIX timestamp (in seconds), determined by ledger time, of a lower and upper bound of when this transaction will be valid. If a transaction is submitted too early or too late, it will fail to make it into the transaction set. `maxTime` equal `0` means that it's not set.

## Transaction sets

Between ledger closings, all the nodes in the network are collecting transactions. When it is time to close the next ledger, the nodes collect these transactions into a transaction set. SCP is run by the network to reach agreement on which transaction set to apply to the last ledger.

## Life cycle

1. **Creation**: The user creates a transaction, fills out all the fields, gives it the correct sequence number, adds whatever operations it wants, etc. Try it with [js-stellar-sdk](https://www.stellar.org/developers/js-stellar-sdk/learn/).

2. **Signing**: Once the transaction is filled out, all the needed signatures must be collected and added to the transaction envelope. Commonly it's just the signature of the account doing the transaction, but more complicated setups can require collecting signatures from multiple parties. See [multi-sig](./multi-sig.md).

3. **Submitting**: After signing, the transaction should be valid and can now be submitted to the Stellar network. Transactions are typically submitted using [horizon](https://www.stellar.org/developers/horizon/reference/transactions-create.html), but you can also submit the transaction directly to an instance of [stellar-core](https://github.com/stellar/stellar-core).

4. **Propagating**: Once stellar-core receives a transaction, either given to it by a user or another stellar-core, it does preliminary checks to see if the transaction is valid. Among other checks, it makes sure that the transaction is correctly formed and the source account has enough to cover the transaction fee. Stellar-core doesn't check things that require inspecting the state of the ledger beyond looking up the source account—e.g., that the destination account to which the transaction is trying to send exists, that the account has enough of this asset to sell, that it's a valid path.
If the preliminary checks pass, then stellar-core propagates the transaction to all the other servers to which it's connected. In this way, a valid transaction is flooded to the whole Stellar network.

5. **Including in a transaction set**: When it's time to close the ledger, stellar-core takes all the transactions it has heard about since last ledger close and collects them into a transaction set. If it hears about any incoming transactions now, it puts them aside for next ledger close.
Stellar-core nominates the transaction set it has collected. SCP resolves the differences between the various transaction sets proposed and decides on the one transaction set that the network will apply.

6. **Application**: Once SCP agrees on a particular transaction set, that set is applied to the ledger. At this point, a fee is taken from the source account for every transaction in that set. Operations are attempted in the order they occur in the transaction. If any operation fails, the whole transaction fails, and the effects of previous operations in that transaction are rolled back. After all the transactions in the set are applied, a new ledger is created and the process starts over.

## Possible Errors

Transaction can fail with one of the errors in a table below. Error reference for operations can be found in [List of operations](./list-of-operations.md) doc.

|Error| Code| Description|
| --- | --- | --- |
|FAILED| -1| One of the operations failed (check [List of operations](./list-of-operations.md) for errors).|
|TOO_EARLY| -2| Ledger `closeTime` before `minTime` value in the transaction.|
|TOO_LATE| -3| Ledger `closeTime` after `maxTime` value in the transaction.|
|MISSING_OPERATION| -4| No operation was specified.|
|BAD_SEQ| -5| Sequence number does not match source account.|
|BAD_AUTH| -6| Too few valid signatures / wrong network.|
|INSUFFICIENT_BALANCE| -7| Fee would bring account below [minimum reserve](./fees.md).|
|NO_ACCOUNT| -8| Source account not found.|
|INSUFFICIENT_FEE| -9| [Fee](./fees.md) is too small.|
|BAD_AUTH_EXTRA| -10| Unused signatures attached to transaction.|
|INTERNAL_ERROR| -11| An unknown error occured.|
