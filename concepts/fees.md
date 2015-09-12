#Fees

Transaction fees are charged per transaction, to the account attached to the transaction.

It’s the responsibility of the originator of the transaction to craft a transaction with an appropriate fee. 

The entire Stellar network decides during consensus what the minimum **base fee** should be. 
This base fee is per operation. Therefore, the total minimum fee for a given transaction is simply the base fee multiplied by the number of operations that transaction has.

Currently the base fee is set to 1000 stroops (0.001 XLM).

## Surge pricing
Each Stellar node by default limits the number of transactions that it will include in its nominated transaction set at ledger close. (If the network decides on a larger transaction set, a node will still apply it.) 

**Surge pricing** allows nodes to prioritize transactions. Each node can process a limited number of transactions in a given ledger—let's say their limit is a little above the number N. In order not to be overwhelmed, each node chooses the N transactions with the highest fees for a particular ledger. The node nominates these transactions to be in the transaction set for that ledger close. 

Transactions that don't make the cut are held for a future ledger, when there are fewer transactions trying to be processed and the low-fee transactions can make it in. 

See [transaction life cycle](./transactions.md#life-cycle) for more information.

## Minimum balance

In order to prevent unbounded account creation, accounts must maintain a minimum lumen balance. The network will reject transactions if applying the transaction would reduce an account's balance to less than its minimum balance—e.g., via fees or balance transfer.

The minimum balance is determined by the number of entries attached to an account.

Initially, an account is a basic account and has no additional entries attached to it.

Additional entries are:
* trustlines
* offers
* signers

Currently the base reserve amount is set to 10,000,000 stroops (10 XLM) and can evolve via consensus. For more details, see [versioning] (./versioning.md).

You can calculate an account's minimum balance using the following formula:
(2 + number_of_additional_entries)*base_reserve

A basic account therefore needs to maintain a minimum balance of 20,000,000 stroops = 20 XLM.

An account with 1 trustline and 2 offers would require a minimum balance of (2+3)*10,000,000 = 50,000,000 stroops or 50 lumens.

