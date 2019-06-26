---
title: Networks
---

Stellar has two public networks: the Public Network (pubnet), which is the main network used by
applications in production, and the Test Network ([testnet](test-net.md)), which is a network
maintained by the Stellar Development Foundation that developers can use to test their
applications.

## Network Passphrases

Each Stellar network has its own unique passphrase, which is used when validating signatures on a
given transaction. If you sign a transaction for one network but submit it to another, it won't be
considered valid. By convention, the format of a passphrase is `'[Network Name] ; [Month of
Creation] [Year of Creation]'`.

The current passphrases for the Stellar pubnet and testnet are:

* Pubnet: `'Public Global Stellar Network ; September 2015'`
* Testnet: `'Test SDF Network ; September 2015'`

The passphrase serves two main purposes:

* It is used as the seed for the root account (master network key) at genesis.
* It is used to build hashes of transactions, which are ultimately what is signed by each signer's
  secret key in a transaction envelope. Again, this allows you to verify that a transaction was
  intended for a specific network by its signers.

Most SDKs have the passphrases hardcoded for the Stellar pubnet and testnet, but if you're running
a private network, you'll need to manually pass in a passphrase to be used whenever transaction
hashes are generated. All of Stellar's official SDKs give you the ability to use a network with a
custom passphrase.

### Moving To Production

When creating your application on top of the Stellar network, we recommend starting on the testnet,
and migrate to pubnet after rigorous testing has proved it to be production ready (_we are talking
about money here_).

For applications that don't rely on the state of a network (such as specific accounts needing to
exist), moving to production is as simple as changing the network passphrase and
ensuring your [Horizon][horizon] instance is connected to pubnet.

If you've been running a [stellar-core][core] or [Horizon][horizon] instance against the test
network, and want to switch to production, changing the passphrase will require both respective
databases to be completely reinitialized. You certainly wouldn't want transactions from another
network to end up in your ledger!

[core]: ../../stellar-core/software/admin.md
[horizon]: https://github.com/stellar/go/tree/master/services/horizon
