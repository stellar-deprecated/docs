---
title: Stellar Network Overview
---
![Stellar Ecosystem](https://www.stellar.org/wp-content/uploads/2016/06/Stellar-Ecosystem-v031.png)

Using the Stellar network, you can build mobile wallets, banking tools, smart devices that pay for themselves, and just about anything else you can dream up involving payments! Even though Stellar is a complex distributed system, working with it doesn’t need to be complicated.

## API: Horizon

**Most applications interact with the Stellar network through [Horizon](https://www.stellar.org/developers/horizon/reference/),** a RESTful HTTP API server. Horizon gives you a straightforward way to submit transactions, check accounts, and subscribe to events. Because it’s just HTTP, you can communicate with Horizon using your web browser, simple command line tools like cURL, or the Stellar SDK for your favorite programming language.

The easiest way to install Horizon is by using [**stellar/quickstart** docker image](https://hub.docker.com/r/stellar/quickstart/).

Stellar.org maintains [JavaScript](https://github.com/stellar/js-stellar-sdk), [Java](https://github.com/stellar/java-stellar-sdk), and [Go](https://github.com/stellar/go/tree/master/clients/horizon)-based SDKs for communicating with Horizon. There are also community-maintained SDKs for [Ruby](https://github.com/stellar/ruby-stellar-sdk), [Python](https://github.com/StellarCN/py-stellar-base), and [C#](https://github.com/QuantozTechnology/csharp-stellar-base).

## Network Backbone: Stellar Core

Behind the scenes, every Horizon server connects to **[Stellar Core](../../stellar-core/learn/admin.html), the backbone of the Stellar network.** The Stellar Core software does the hard work of validating and agreeing with other instances of Core on the status of every transaction through the [Stellar Consensus Protocol](../concepts/scp.html) (SCP). The Stellar network itself is a collection of connected Stellar Cores run by various individuals and entities around the world. Some instances have a Horizon server you can communicate with, while others exist only to add reliability to the overall network.

The easiest way to install Stellar Core is by using [**stellar/quickstart** docker image](https://hub.docker.com/r/stellar/quickstart/).

You might want to host your own instance of Stellar Core in order to submit transactions without depending on a third party, have more control over who to trust, or simply to help make the Stellar network more reliable and robust for others.

## Big Picture: The Stellar Network

The Stellar network is a worldwide collection of Stellar Cores, each maintained by different people and organizations. The distributed nature of the network makes it reliable and safe.

All these Stellar Cores—the network of nodes—eventually agree on sets of transactions. Each transaction on the network costs a small fee: 100 stroops (0.00001 <abbr title="Lumens">XLM</abbr>). This fee helps prevent bad actors from spamming the network. 

To help you test your tools and applications, Stellar.org operates a small test network and Horizon instance. [Get started with the testnet.](../concepts/test-net.md)
 
<div class="sequence-navigation">
  <a class="button button--next" href="create-account.html">Next: Create an Account</a>
</div>
