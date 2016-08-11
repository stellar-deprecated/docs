---
title: Fees
---

The Stellar network imposes small fees on transactions and minimum balances on accounts in order to prevent people from overtaxing the network and to aid in prioritization.

There are two special values used to calculate fees:

1. The **base fee** (100 stroops) is used in transaction fees.
2. The **base reserve** (10 XLM) is used in minimum account balances.


## Transaction Fee

The fee for a transaction is the number of operations the transaction contains multiplied by the **base fee**, which is **100 stroops** (0.00001 XLM).

```math-formula
([# of operations] * [base fee])
```

For example, a transaction that allows trust on an account’s trustline and sends a payment to it (2 operations) would have a fee of $$2 * [base fee] = 200 stroops$$.

The fee is deducted from the transaction’s [source account](./transactions.md#source-account), regardless of what accounts are involved in each operation.


### Surge Pricing

Each Stellar node usually limits the number of transactions in its nominated transaction set at ledger close. (If the network decides on a larger transaction set, a node will still apply it.) 

*Surge pricing* allows nodes to prioritize transactions. When too many transactions are submitted for a particlar ledger, each node chooses the transactions with the highest fees to nominate for the transaction set. Transactions that don't make the cut are held for a future ledger, when fewer transactions are being processed.

See [transaction life cycle](./transactions.md#life-cycle) for more information.


## Minimum Account Balance

All Stellar accounts must maintain a minimum balance of lumens. Any transaction that would reduce an account's balance to less than the minimum will be rejected with an `INSUFFICIENT_BALANCE` error.

The minimum balance is calculated using the **base reserve,** which is **10 XLM**:

```math-formula
(2 + [# of entries]) * [base reserve]
```

The minimum balance for a basic account is $$2 * [base reserve]$$. Each additional entry costs the base reserve. Entries include:

- Trustlines
- Offers
- Signers
- Data entries

For example, an account with 1 trustline and 2 offers would have a minimum balance of $$(2 + 3) * [base reserve] = 50 XLM$$.


## Fee Changes

The **base reserve** and **base fee** can change, but should not do so more than once every several years. For the most part, you can think of them as fixed values. When they are changed, the change works by the same consensus process as any transaction. You can look up the current fees by [checking the details of the latest ledger](../../horizon/reference/endpoints/ledgers-single.md).
