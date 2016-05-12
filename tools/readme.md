---
title: Stellar Components
---
# Tools

## [Laboratory](https://www.stellar.org/laboratory)
Interactive way to learn the Stellar API. The source is available [here](https://github.com/stellar/laboratory).


# Services

Pre-built services you can run on your own infrastructure, provided by Stellar.org.

## [Stellar Core](../stellar-core/learn/admin.html)
Stellar Core is the backbone of the Stellar network and does the hard work of validating and agreeing on the status of every transaction with other instances of Core through the Stellar Consensus Protocol (SCP).

## [Horizon](https://github.com/stellar/horizon)
Horizon is the client-facing API server for the Stellar ecosystem. It acts as the interface between Stellar Core and applications that want to access the Stellar network. If you are running Stellar Core, you will probably also want to run Horizon.

## [Federation Server](https://github.com/stellar/federation)
Go implementation of Federation protocol server. This federation server is designed to be dropped in to your existing infrastructure. It can be configured to pull the data it needs out of your existing DB.

## [Bridge Server](https://github.com/stellar/bridge-server)
Stellar’s Bridge server is an easier-to-use version of Horizon, meant to simplify compliance operations and other more complicated integrations. Because it stores and manages keys and account information, access to it should be well protected. Unlike Horizon, it should never be exposed to the public internet.

## [Archivist](https://github.com/stellar/archivist)
This is a small tool, written in Go, for working with stellar-core history archives directly. It is a standalone tool that does not require stellar-core, or any other programs.


# Reference applications and sample code

## [Account Viewer](https://github.com/stellar/account-viewer)
Check your balance and send simple payments. This basic client is built on top of [Interstellar](https://github.com/stellar/interstellar) and connects to the live Stellar network. The source is available [here](https://github.com/stellar/account-viewer).

## [SMS Client](https://github.com/stellar/stellar-sms-client)
This is a demo of Stellar SMS Client. It was originally developed during Stellar Hack Day.
