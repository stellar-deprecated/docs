#Stellar Ecosystem

![Stellar Ecosystem](https://www.stellar.org/wp-content/uploads/2015/08/ecosystem-overview-2.png)

There are several pieces of software that make up the Stellar ecosystem. Which pieces you interact with or run depends on what you are doing with Stellar. 

## [stellar-core](https://github.com/stellar/stellar-core)
stellar-core is the backbone of the Stellar network. It maintains a local copy of the ledger, communicating and staying in sync with other instances of stellar-core on the network. The Stellar network is made up of a collection of stellar-cores run by various individuals and entities all connected to each other. stellar-core carries out SCP and comes to consensus about the state of the network. 

stellar-core accepts a limited amount of [commands](https://github.com/stellar/stellar-core/blob/master/docs/commands.md). 

stellar-core writes its state out to a SQL DB that other applications can read to follow changes to the global [ledger](./ledger.md)

## [Horizon](https://github.com/stellar/horizon)
Horizon is the client facing API server for the Stellar ecosystem. It acts as the interface between stellar-core and applications that want to access the Stellar network. It allows you to submit transactions to the network, check the status of accounts, subscribe to event streams, etc.

Horizon provides a RESTful API to allow client applictaion to interact with the Stellar network. It is possible to communicate with Horizon with curl or just your browser but if you are building a client application you will likely want to use a stellar-sdk in the language of your client. 

## [SDKs](https://github.com/stellar/js-stellar-sdk)
The SDKs are used to facilitate communicating with Horizon from whatever client application is interacting with the Stellar Network. They are resposible for crafting and signing transactions, submitting requests to and processing the responses from Horizon, etc.

SDF only maintains the JavaScript SDK. We are looking for maintainers for other launguages.

## [Interstellar](https://github.com/stellar/interstellar)
The Interstellar Module System is a collection of modules that aims to make it easy to build a web application on the Stellar network. It is built using the JS-Stellar-SDK. 
It can be thought of as a bootstrap for building Stellar clients. Here is a [blog post](https://www.stellar.org/blog/developer-preview-interstellar-module-system/) going a bit into the philosophy behind it. 


`stellar-core` <-> `Horizon`  <-> `JS-Stellar-SDK` <-> `Interstellar`
