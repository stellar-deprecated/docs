Stellar Transaction Robustness
==============================

- Introduction is still under progress
- Importance of transaction robustness

To submit transactions safely and reliably, these transactions should be idempotence meaning that it can be applied multiple times without changing the end result. An example of idempotence is the absolute value function. abs(x) = abs(abs(x))

- Software should also be built in a way that it can crash/restart at any moment and transactions won't be disrupted

- This guide only talks about reliability when sending transactions using Stellar. Internal gateway best practices are outside the scope of this document. For more information, visit documentABCDEF, a guide on gateway security.

## Transaction sequence number
- Each transaction has a sequence number
- The sequence number is automatically generated if not explicitly specified
- Transactions must be applied in the sequence number order. Tx with seq#3 can't be applied to the ledger. until tx with seq#2 is applied.

A transaction with an explicit sequencence number can be sent multiple times (and to multiple stellard instances) without the risk of funds being send multiple times.

### Signing and saving transaction
Transactions should be signed and saved to persistent storage. If the transaction doesn't go through correctly, it can be retrieved from the disk and sent again.

Signing a transaction locally allows one to send it to other stellard servers without sending keys. This is useful in the event that a local stellard instance is not available.

## Implementation example
### Startup
The network may have changed since they last Every time the gateway signing software starts up, it should do a few tasks that gets it up to speed.

1. Get the next ledger to start signing transactions at. Save the sequence number as a local variable. It is the bigger of the following:
    - `account_info`->account_data->Sequence
    - latest pending transaction sequence number + 1 (if none pending, then use the account_info method)
    - **??? Is this the correct way of doing it???**
2. For each pending transaction, see if the transaction has been applied to a ledger
    - Applied: Mark the transaction as completed
    - Not applied: Submit the transaction and listen

### Preparing the transaction
1. Make sure that the transaction is valid
2. Build the tx json
3. `sign` the transaction with the tx json
4. Save the blob and tx hash in persistent storage. (tx_blob is used for submitting, hash is used to check if applied to ledger)
5. Increment the local variable for the sequence number
6. Save this signed transaction and [locally] mark it as pending

### Submitting a transaction
1. `submit` the tx blob
2. `subscribe` and wait for the transaction is applied to the ledger
    - If the transaction doesn't make it after several transactions, submit it again
    - Note: Transactions often makes it into the next ledger so waiting for 2 or 3 is safe
3. After the transaction makes it to the ledger, mark it as completed

### Footnotes
- It is best if the software submits transactions in the order of their sequence numbers
- Unsuccessful transactions such as those sending to users without enough trust extended will still use up the fee and take up a sequence number.
-
- Invalid transactions will make it through
- Blocking and scaling: multiple hot wallets
