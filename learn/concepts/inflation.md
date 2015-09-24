---
title: Inflation
---

The Stellar distributed network has a built-in, fixed nominal inflation mechanism. 1% new lumens are added to the network each year. These lumens are distributed weekly by the protocol. They are received by any account that gets over .05% of the "votes" from other accounts in the network. 

In inflation voting, every account selects another account as its **inflation destination**, or nominee to receive new currency. This is done with the [set options](./list-of-operations.md#set-options) operation. The inflation destination will stay set until changed with another set options operation. Voting is weighted according to the number of lumens the voting account holds. For example, if account A has 120 lumens and sets its inflation destination to B, the network counts 120 votes for B.

Inflation is run in response to an [inflation operation](./list-of-operations.md#inflation) that anyone can submit to the network. This operation will fail if the inflation sequence number isn't one after the last sequence number. It will also fail if (sequence number * 1 week) of time hasn't elapsed since the network start date. This limits the distribution of new lumens to once a week. 

Each time inflation is run, the lumens used to pay transaction [fees](./fees.md) since the last voting round are also included in the total lumens distributed.

When inflation is run, here is the algorithm carried out by the nodes:

 1. The `inflation pool` is calculated by (number of lumens in existence)*(weekly inflation rate) + fee pool.
 2. The `MIN_VOTE` is calculated by (number of lumens in existence)*.0005 . This is .05% of the existing lumens, which is the minimum amount of votes needed to get any part of the inflation pool.
 2. Tally the votes for each account based on the **inflation destination** set for every account.
 3. Determine which accounts exceeded the `MIN_VOTE`. These accounts are the winners.
 4. The winners each get their prorata share of the inflation pool. For example if a winner gets 2% of the lumens voting for it, it will get 2% of the inflation pool.
 5. Return any unallocated lumens to the fee pool. 
