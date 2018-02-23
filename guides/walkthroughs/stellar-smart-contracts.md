---
title: Stellar Smart Contracts (SSCs)
---

Stellar can be used to build sophisticated smart contracts. Smart contracts are computer programs that can automatically execute an agreement based on programmed logic.

The concept of integrating technology and legal contracts dates back to the 1950s, when scholars built computational methods that could enforce legal rules without involving traditional legal processes. Smart contracts was formally defined by Nick Szabo in 1997:

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
