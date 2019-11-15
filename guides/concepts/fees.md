---
title: Transaction Fees, Minimum Balances, and Surge Pricing
---

To prevent ledger spam and maintain the efficiency of the network, Stellar requires small [transaction fees](#transaction-fees) and [minimum balances on accounts](#minimum-account-balance).  Transaction fees are also used to prioritize transactions when the network enters [surge pricing mode](#surge-pricing).

## Transaction Fees

Stellar [transactions](https://www.stellar.org/developers/guides/concepts/transactions.html) can contain anywhere from 1 to a defined limit of 100 [operations](https://www.stellar.org/developers/guides/concepts/operations.html).  The fee for a given transaction is equal to the number of operations the transaction contains multiplied by the [base fee](#base-fee) for a given ledger.  

```
Transaction fee = # of operations * base fee
```

Stellar deducts the entire fee from the transaction’s [source account](./transactions.md#source-account), regardless of which accounts are involved in each operation or who signed the transaction.

### Base Fee

The base fee for a given ledger is determined dynamically using a version of a [VCG auction](https://en.wikipedia.org/wiki/Vickrey%E2%80%93Clarke%E2%80%93Groves_auction).  When you submit a transaction to the network, you specify the *maximum base fee* you’re willing to pay per operation, but you’re actually charged the *lowest possible fee* based on network activity.   

When network activity is below capacity, you pay the network minimum, which is currently **100 stroops (0.00001 XLM)** per operation. 

### Surge Pricing

When the number of operations submitted to a ledger exceeds network capacity (**currently 1,000 ops/ledger**), the network enters surge pricing mode, which uses market dynamics to decide which submissions are included. Essentially, submissions that offer a higher fee per operation make it onto the ledger first.

If there’s a tie — in other words multiple transactions that offer the same base fee are competing for the same limited space in the ledger — the transactions are (pseudo-randomly) shuffled, and transactions at the top of the heap make the ledger.  The rest of the transactions, the ones that didn’t make the cut, are pushed on to the next ledger, or discarded if they’ve been waiting for too long.  If your transaction is discarded, Horizon will return a [timeout error](https://www.stellar.org/developers/horizon/reference/errors/timeout.html).  For more information, see [transaction life cycle](./transactions.md#life-cycle).  

The goal of the transaction pricing specification, which you can read in full [here](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0005.md), is to maximize network throughput while minimizing transaction fees. 

### Fee Stats and Fee Strategy

The general rule of thumb: choose the highest fee you're willing to pay to ensure your transaction makes the ledger.  Wallet developers may want to offer users a chance to specify their own base fee, though it may make more sense to set a persistent global base fee multiple orders of magnitude above the market rate — 0.1 XLM, for instance — since the average user probably won't care if they’re paying 0.8 cents or 0.00008 cents.

If you keep getting a [timeout error](https://www.stellar.org/developers/horizon/reference/errors/timeout.html) when you submit a transaction, you may need to increase your base fee, or wait until network activity abates and re-submit your transaction.  To help inform that decision, you can consult the Horizon [`/fee_stats`](https://www.stellar.org/developers/horizon/reference/endpoints/fee-stats.html) endpoint, which provides detailed information about per-operation fee stats for the last five ledgers.  You can find the same information on the fee stats panel of the [dashboard](https://dashboard.stellar.org/).  All three of the SDF-maintained SDKs also allow you to poll the `/fee_stats` endpoint: [Go](https://godoc.org/github.com/stellar/go/clients/horizonclient#Client.FeeStats), [Java](https://stellar.github.io/java-stellar-sdk/), [Javascript](https://stellar.github.io/js-stellar-sdk/Server.html#feeStats).   

### Fee Pool

The fee pool is the lot of lumens collected from [transaction fees](./fees.md#transaction-fee).

Since the disabling of the inflation mechanism fees are retained in the fee pool and are no longer redistributed. 

The inflation mechanism was disabled (see [CAP-0026](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0026.md)) in protocol version 12, which was approved by validators on 10/28/19. After this date no further inflation payouts were made.    

## Minimum Account Balance

All Stellar accounts must maintain a minimum balance of lumens. The minimum balance is calculated using the **base reserve,** which is currently **0.5 XLM**:

```
Minimum Balance = (2 + # of entries) * base reserve
```

The absolute minimum balance for an account is 1 XLM, which is equal to `(2 + 0 entries) * 0.5 base reserve`. Each additional entry reserves an additional 0.5 XLM. Entries include:

- Trustlines
- Offers
- Signers
- Data entries

For example, an account with 1 trustline and 2 offers would have a minimum balance of `(2 + 3 entries) * 0.5 base reserve = 2.5 XLM`.

Any transaction that would reduce an account's balance to less than the minimum will be rejected with an `INSUFFICIENT_BALANCE` error.  Likewise, lumen selling liabilities that would reduce an account's balance to less than the minimum plus lumen selling liabilities will be rejected with an `INSUFFICIENT_BALANCE` error.

The minimum balance is held in reserve, and closing an entry frees up the associated base reserve.  For instance: if you zero-out a non-lumen balance and close the associated trustline, the 0.5 XLM base reserve that secured that trustline is added to your available balance. 



## Changes to Transaction Fees and Minimum Balances

Ledger limits, the base reserve, and the minimum base fee can change, but should not do so more than once every several years. For the most part, you can think of them as fixed values. When they are changed, the change works by the same consensus process as any transaction. For details, see [versioning](https://www.stellar.org/developers/guides/concepts/versioning.html).

