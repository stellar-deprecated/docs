---
title: Inflation
---

The Stellar distributed network has a built-in, fixed, nominal [inflation](#inflation) mechanism. New lumens are added to the network at the rate of 1% each year. Each week, the protocol distributes these lumens to any account that gets over .05% of the "votes" from other accounts in the network. 

## How inflation voting works 
Using the [set options](./list-of-operations.md#set-options) operation, every account selects another account as its **inflation destination**, or nominee to receive new currency. The inflation destination will persist until changed with another set options operation. 

Voting is weighted according to the number of lumens the voting account holds. For example, if account A has 120 lumens and sets its inflation destination to B, the network counts 120 votes for B.

The distribution of new lumens is limited to once a week. Inflation is run in response to an [inflation operation](./list-of-operations.md#inflation) that anyone can submit to the network. This operation will fail if the inflation sequence number isn't one after the last sequence number. It will also fail if (sequence number * 1 week) of time hasn't elapsed since the network start date.  

Each time inflation is run, the lumens used to pay transaction [fees](./fees.md#transaction-fee) since the last voting round are also included in the total lumens distributed.

When inflation is run, nodes carry out the following algorithm:

 1. Calculate the `inflation pool` by (number of lumens in existence)*(weekly inflation rate) + fee pool.
 2. Calculate the `MIN_VOTE` by (number of lumens in existence)*.0005. This is .05% of the existing lumens, the minimum amount of votes needed to get any part of the inflation pool.
 2. Tally the votes for each account based on the **inflation destination** set for every account.
 3. Determine which accounts exceeded the `MIN_VOTE`. These accounts are the winners.
 4. The winners each get their prorata share of the inflation pool. For example, if a winner gets 2% of the votes, it will get 2% of the inflation pool.
 5. Return any unallocated lumens to the fee pool. 
