---
title: Stellar Software
---
# Software

Pre-built software and services you can run on your own infrastructure, provided by Stellar.org.

## [Stellar Core](../stellar-core/learn/admin.html)
Stellar Core is the backbone of the Stellar network and does the hard work of validating and agreeing on the status of every transaction with other instances of Core through the Stellar Consensus Protocol (SCP).

## [Horizon](https://github.com/stellar/horizon)
Horizon is the client-facing API server for the Stellar ecosystem. It acts as the interface between Stellar Core and applications that want to access the Stellar network. If you are running Stellar Core, you will probably also want to run Horizon.

## [Federation Server](https://github.com/stellar/federation)
Go implementation of Federation protocol server. This federation server is designed to be dropped in to your existing infrastructure. It can be configured to pull the data it needs out of your existing DB.

## [Bridge Server](https://github.com/stellar/bridge-server)
Stellar’s Bridge server provides a simple interface for the Stellar network. It is meant to simplify compliance operations and other more complicated integrations. Because it stores and manages keys and account information, access to it should be well protected. Unlike Horizon, it should never be exposed to the public internet.

## [Archivist](https://github.com/stellar/archivist)
This is a small tool, written in Go, for working with stellar-core history archives directly. It is a standalone tool that does not require stellar-core, or any other programs.
