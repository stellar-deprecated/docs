---
title: Testnet
---

The testnet is a small test Stellar network, run by the Stellar Development
Foundation (SDF), which is open to developers.

SDF runs 3 Stellar Core validators on the testnet.

You can connect a node to the testnet by configuring [stellar-core](https://github.com/stellar/stellar-core) to use this
[configuration](https://github.com/stellar/stellar-core/blob/master/docs/stellar-core_testnet.cfg).

There is also a [Horizon instance](https://horizon-testnet.stellar.org/) that
can directly interact with the testnet.

## What is the Stellar testnet good for?

* [Creating test accounts](../get-started/create-account.md) (with funding thanks to Friendbot).
* Developing applications and exploring tutorials on Stellar without the
  potential to lose any valuable [assets](assets.md).
* Testing existing applications against new releases or release candidates of
  [Stellar Core](https://github.com/stellar/stellar-core/releases) and [Horizon](https://github.com/stellar/go/releases).
* Performing data analysis on a smaller, non-trivial data set compared to the public network.

## What is the Stellar testnet not good for?

* Load and stress testing.
  * If you want to test for performance, a good place to
    start is
    [Stellar Core's core performance document](https://github.com/stellar/stellar-core/blob/master/performance-eval.md#networks-to-test-against).
* High availability test infrastructure - SDF makes no guarantees about the
  availability of the testnet.
* Long term storage of data on the network - [the network is ephemeral, and resets periodically](test-net.md#periodic-reset-of-testnet-data).
* A testing infrastructure that requires more control over the test environment,
  such as:
  * The ability to control the data reset frequency.
  * The need to secure private or sensitive data (before launching on the public network)

Keep in mind that you can always run your own test network for use cases that
don't work well with SDF's testnet.

## Best Practices For Using Testnet

### Periodic Reset of Testnet Data
In order to preserve a good experience for developers, the SDF testnet is
periodically reset to the genesis (initial) ledger. Resets declutter the network, remove
spam, minimize the time required to catch up to the latest ledger, and help
maintain the system over time.

A reset clears all ledger entries (such as accounts, trustlines, offers,
etc), transactions, and historical data from both Stellar Core and
Horizon, which is why developers should not rely on the persistence of any accounts or on the state of any balances when using testnet.

After a reset, you will need to take a few steps to re-join and re-synch to the testnet.  Those steps are outlined [here](https://github.com/stellar/packages#testnet-reset), along with line-by-line instructions for people using core + horizon ubuntu packages.  If you need help with other packages, check [Stellar's Stack Exchange](https://stellar.stackexchange.com/) for guidance.

SDF will try to make testnet resets as painless as possible, and will announce the exact date at least two weeks in advance on the [Stellar Dashboard](http://dashboard.stellar.org/), and via several of Stellar’s online developer communities.

Starting in January 2019, the testnet will be reset once per quarter (every
three months).  The tentative dates:

* February 27th, 2019
* April 24th, 2019
* July 31st, 2019
* October 30th, 2019

The testnet will always restart on the announced reset date at 0900 UTC.

### Test Data Automation

Since most applications rely on data being present to do anything useful, it is
highly recommended that you have testing infrastructure that can repopulate
testnet with useful data after a reset. Not only will this make testing more
reliable, but it will also help you scale out your testing infrastructure to
a private test network if you choose to do so.

For example, you may want to:
* Generate issuers of assets for testing the development of a wallet.
* Generate orders on the order book (both current and historical) for testing
  the development of a trading client.

As a maintainer of an application, you will want to think about creating a data
set that is representative enough to test your primary use cases, and allow for
robust testing even when testnet is not available.

A script can automate this entire process by [creating an account with
Friendbot](../get-started/create-account.md), and submitting a set of
[transactions](transactions.md) that are predefined as a part of
your testing infrastructure.

For additional questions we recommend heading over to
[Stellar's Stack Exchange](https://stellar.stackexchange.com/).
