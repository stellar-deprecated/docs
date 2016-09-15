---
title: Architecture
sequence:
  next: 2-bridge-server.md
---

Anchors are entities that people trust to hold their deposits and [issue credits](../issuing-assets.md) into the Stellar network for those deposits. All money transactions in the Stellar network (except lumens) occur in the form of credit issued by anchors, so anchors act as a bridge between existing currencies and the Stellar network. Most anchors are organizations like banks, savings institutions, farmers’ co-ops, central banks, and remittance companies.

Before continuing, you should be familiar with:

- [Issuing assets](../issuing-assets.md), the most basic activity of an anchor.
- [Federation](../concepts/federation.md), which allows a single Stellar account to represent multiple people.
- [Compliance](../compliance-protocol.md), if you are subject to any financial regulation.


## Account Structure

As an anchor, you should maintain at least two accounts:

- An **issuing account** used only for issuing and destroying assets.
- A **base account** used to transact with other Stellar accounts. It holds a balance of assets issued by the *issuing account*.

Create them on the test network using the [laboratory](https://stellar.org/laboratory/) or the steps from the [“get started” guide](../get-started/create-account.md).

For this guide, we’ll use the following keys:

```js
Issuing Account ID: GAIUIQNMSXTTR4TGZETSQCGBTIF32G2L5P4AML4LFTMTHKM44UHIN6XQ
Issuing Seed:       SBILUHQVXKTLPYXHHBL4IQ7ISJ3AKDTI2ZC56VQ6C2BDMNF463EON65U

Base Account ID:    GAIGZHHWK3REZQPLQX5DNUN4A32CSEONTU6CMDBO7GDWLPSXZDSYA4BU
Base Seed:          SAV75E2NK7Q5JZZLBBBNUPCIAKABN64HNHMDLD62SZWM6EBJ4R7CUNTZ
```


### Customer Accounts

There are two simple ways to account for your customers’ funds:

1. Maintain a Stellar account for each customer. When a customer deposits money with your institution, you should pay an equivalent amount of your custom asset into the customer’s Stellar account from your *base account*. When a customer needs to obtain physical currency from you, deduct the equivalent amount of your custom asset from their Stellar account.

    This approach simplifies bookkeeping by utilizing the Stellar network instead of your own internal systems. It can also allow your customers a little bit more control over how their account works in Stellar.

2. Use [federation](../concepts/federation.md) and the [`memo`](../concepts/transactions.md#memo) field in transactions to send and receive payments on behalf of your customers. In this approach, transactions intended for your customers are all made using your *base account*. The `memo` field of the transaction is used to identify the actual customer a payment is intended for.

    Using a single account requires you to do additional bookkeeping, but means you have fewer keys to manage and more control over accounts. If you already have existing banking systems, this is the simplest way to integrate Stellar with them.

You can also create your own variations on the above approaches. **For this guide, we’ll follow approach #2—using a single Stellar account to transact on behalf of your customers.**
