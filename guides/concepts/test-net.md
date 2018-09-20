---
title: Testnet
---

The testnet is a small test Stellar network, open to developers.

Stellar.org runs 3 stellar-core validators on this test network.

Set your stellar-core to connect to us by using this [configuration](https://github.com/stellar/stellar-core/blob/master/docs/stellar-core_testnet.cfg).

You can also find a [Horizon instance](https://horizon-testnet.stellar.org/) that is connected to the testnet.


## What is testnet good for?
* [create test accounts](../get-started/create-account.md) (thanks to friend bot) 
* go over tutorials on the cheap
* test applications against the most recent release or release candidate of stellar-core / Horizon
* play around with a non trivial (aka "random") [data set](test-corpus)

## What is testnet not good for?

You may have to run on a different test network for a variety of reasons, here are a few.

* Load and stress testing. If you want to check performance, a good place to get started is the [core performance document](https://github.com/stellar/stellar-core/blob/master/performance-eval.md#networks-to-test-against)
* high availability test infrastructure. SDF's testnet can be flaky at times.
* storing data for long term (as the network is periodically reset).
* If you need to control
    * the reset frequency
    * sensitive data (before launching on the public network)

## test corpus

### testnet vs reset
In order to preserve a good experience for users (time to catchup, no spam, etc), testnet is periodically reset to genesis ledger.

When this happens:
* all ledger entries (accounts, trustlines, etc), transactions and all historical data are cleared (both core and Horizon related data sets are cleared)
* friendbot is repopulated
* the network is upgraded to the latest version of the protocol

In short: don't get attached to any balances or accounts that you have on it.

### test data best practice

Most applications rely on some data to be present to do anything useful, for example:
* wallets depend on issuers
* trading clients depend on the existence of an order book s well as historical trades

As a maintainer of such application, you probably want to build a test corpus that is representative enough of your main use cases.

The best way to do this is to write a script that creates everything that you need by submitting transactions:
all you will have to do before testing your application or after a reset is to create an account with friendbot (or better, have your script invoke friendbot) and run your script.
