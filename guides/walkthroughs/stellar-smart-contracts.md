---
title: Stellar Smart Contracts (SSCs)
---

Stellar can be used to build sophisticated smart contracts. Smart contracts are computer programs that can automatically execute an agreement based on programmed logic.

The concept of integrating technology and legal contracts dates back to the 1950s when scholars built computational methods that could enforce legal rules without involving traditional legal processes. Smart contracts were formally defined by Nick Szabo in 1997:

> Smart contracts combine protocols with user interfaces to formalize and secure relationships over computer networks. Objectives and principles for the design of these systems are derived from legal principles, economic theory, and theories of reliable and secure protocols. 

In recent years, blockchain technology has enabled a new breed of smart contracts with immutable storage of agreement terms, cryptographic authorization, and integrated transfers of value. 

For the Stellar Network, smart contracts are manifested as Stellar Smart Contracts. A **Stellar Smart Contract** (SSC) is expressed as compositions of transactions that are connected and executed using various constraints. The following are examples of constraints that can be considered and implemented when creating SSCs:

- *Multisignature* - What keys are needed to authorize a certain operation? What parties need to agree on a circumstance in order to execute the steps?

Multisignature is the concept requiring signatures of multiple parties to sign transactions stemming from an account. Through signature weights and thresholds, representation of power in signatures is created. 

- *Batching/Atomicity* - What operations must all occur together or fail? What must happen in order to force this to fail or pass?

Batching is the concept of including multiple operations in one transaction. Atomicity is the guarantee that given a series of operations, upon submission to the network if one operation fails, all operation in the transaction fails. 

- *Sequence* - In what order should a series of transactions be processed? What are the limitations and dependencies?

The concept of sequence is represented on the Stellar Network through sequence number. Utilizing sequence numbers in transaction manipulation, it can be guaranteed that specific transactions do not succeed if an alternative transaction is submitted. 

- *Time Bounds* - When can a transaction be processed?

Time bounds are limitations on the time period over which a transaction is valid. Using time bounds enables time periods to be represented in an SSC. 

This overview presents two common design patterns that can be used to create SSCs on the Stellar Network. The transactions can be translated to API requests or can be executed used [Stellar Laboratory](https://www.stellar.org/laboratory/).


## 2-Party Multisignature Escrow Account with Time Lock & Recovery
### Use Case Scenario
Ben Bitdiddle sells 50 CODE tokens to Alyssa P. Hacker, under the condition that that Alyssa won’t resell the tokens until one year has passed. Ben doesn’t completely trust Alyssa so he suggests that he holds the tokens for Alyssa for the year.

Alyssa protests. How will she know that Ben will still have the tokens after one year? How can she trust him to eventually deliver them?

Additionally, Alyssa is sometimes forgetful. There’s a chance she won’t remember to claim her tokens at the end of the year long waiting period. Ben would like to build in a recovery mechanism so that if Alyssa doesn’t claim the tokens, they can be recovered. This way, the tokens won’t be lost forever.

### Implementation
An escrow agreement is created between two entities: the origin - the entity funding the agreement, and the target - the entity receiving the funds at the end of the contract. 

Three accounts are required to execute a time-locked escrow contract between the two parties: a source account, a destination account, and an escrow account. The source account is the account of the origin that is initializing and funding the escrow agreement. The destination account is the account of the target that will eventually gain control of the escrowed funds. The escrow account is created by the origin and holds the escrowed funds during the lock up period. 

Two periods of time must be established and agreed upon for this escrow agreement: a lock-up period, during which neither party may not manipulate (transfer, utilize) the assets, and a recovery period, after which the origin has the ability to recover the escrowed funds from the escrow account. 

Five transactions are used to create an escrow contract - they are explained below in the order of creation. The following variables will be used in the explanation:
- **M** - the sequence number of the source account
- **N** - the sequence number of the escrow account
- **T** - the lock-up period
- **D** - the date upon which the lock-up period starts
- **R** - the recovery period

The order of submission of transaction to the Stellar network different from the order of creation. The following shows this alternative order, in respect to time: 

Figure 1:
![Diagram Transaction Submission Order for Escrow Agreements](assets/ssc-escrow.png)

If Transaction 3 is not submitted by the target, then Transaction 4 is submitted by the origin after the recovery period.


#### __Transaction 1: Creating the Escrow Account__
**Account**: source account  
**Sequence Number**: M  
**Operations**:
- [Create Account](../concepts/list-gof-operations.html#create-account): create escrow account in system
	 - starting balance: minimum balance + transaction fee
**Signers**: source account

