---
title: Networks
---

Stellar has two public networks: the Public Network (pubnet), which is the main decentralized
network used throughout the world, and the Test Network (testnet), a network maintained by the
Stellar Development Foundation that is available for developers to test their applications. For
more in-depth information on testnet, [see our our additional documentation](test-net.md).

## Network Passphrases

Each Stellar network has its own unique passphrase, which is used when validating signatures on a
given transaction. If you sign a transaction for one network but submit it to another, it won't be
considered valid. The format of a passphrase is typically `'[Network Name] ; [Month of Creation]
[Year of Creation]'`.

The current passphrases for the Stellar pubnet and testnet are:

* Pubnet: `'Public Global Stellar Network ; September 2015'`
* Testnet: `'Test SDF Network ; September 2015'`

The passphrase is utilized for two reasons:

* The network passphrase is used as the seed for the root account (master network key) at genesis.
* For building hashes of transactions, which are ultimately what is signed by each signer's secret
  key in a transaction envelope. Again, this allows you to verify that a transaction was intended
  for a specific network by its signers.

Most SDKs have the passphrases hardcoded for the Stellar pubnet and testnet, but if you're running
a private network, you'll need to manually pass in a passphrase to be used whenever transaction
hashes are generated. All of Stellar's official SDKs give you the ability to use a network with a
custom passphrase.

### Moving To Production

When creating your application on top of the Stellar network, we recommend that you initially
create your application using [Stellar's testnet](test-net.md), and ultimately migrate to pubnet
after it has been rigorously tested and is determined to be production ready (_we are talking about
money here_).

For applications that don't rely on the state of a network (such as specific accounts needing to
exist), moving to production is as simple as changing the network passphrase, and
ensuring you're using a Horizon instance connected to the appropriate network, i.e. using a Horizon
instance hooked into the public network.

If you're running a stellar-core or Horizon instance, changing the passphrase will require both
respective databases to be completely reinitialized, as you certainly wouldn't want transactions
from another network to end up in your ledger!
