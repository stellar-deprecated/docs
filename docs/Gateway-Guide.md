Stellar Gateway Implementation Guide
====================================

This is an implementation guide for those who want to set up a gateway on the Stellar network. It assumes that the reader already understands how gateways work. To learn more about the concept of gateways, read [Introduction to Stellar Gateways](Introduction-Gateways.md). This guide will also be code heavy as it contains specific commands necessary to running a gateway.

This guide might not covery everything necessary for running a gateway, but gateway operators should understand everything in this document.

## Cold and hot wallet organization - Bank Wallet Paradigm
We recommend gateways to set up their cold and hot wallets using the "bank wallet paradigm". There are other ways of organizing wallets but this one is preferred.

A gateway does not need to use a cold wallet to operate, but doing so reduces security in the event of a security breach.

### Cold wallet
A cold wallet is a Stellar account whose secret keys are not on any devices that touch the internet. Transactions are manually initiated by a human and are signed locally on the offline machine. This is possible by using stellard's `sign` api to create a tx_blob containing the signed transaction. This tx blob can be transported to a machine connected to the internet via offline methods such as usb or by hand. This makes the cold wallet much harder to steal from.

### Hot wallet
Conversely, a hot wallet is an account that is used on an account that is connected to the internet. This hot wallet is used to send credits to a user when they enter into the Stellar system. This hot wallet has a limited amount of funds so that in the event of a security breach, only the limited funds in the hot wallet are stolen.

### Trust lines
There are only two instances where trust needs to be extended:
- Gateway hot wallet(s) extends trust to the cold wallet limited to a small amount
- User extends trusts to gateway cold wallet so that they can receive funds

### Flow of credits
First, the gateway cold wallet sends funds to the hot wallet so that the gateway can quickly send the money.

When a user enters the Stellar network (by depositing cash into the gateway), the gateway hot wallet sends credits to the user. For example, if user deposits $20 USD in cash into the gateway, the gateway hot wallet sends 20 USD credits to the user.

When a user wants to redeem their credits and exit the Stellar network, the user sends the funds to a cold wallet.

```
+------+      +-----+      +------+      
| cold | +--> | hot | +--> | user |
+------+      +-----+      +------+
   ^                           +
   |                           |
   +---------------------------+
```

## Stellar reference client user flow
Important for gateway operators to understand how end users and consumers will interact with gateways.

In the Stellar reference client ([launch.stellar.org](https://launch.stellar.org)), one must add a gateway before being able to receive credits issued by that gateway. The user specifies the domain of the gateway and the client scans the stellar.txt file of that domain to find currencies that the gateway supports.

## Stellard setup
[stellard](https://github.com/stellar/stellard) is the daemon that powers the backend of the Stellar network. Gateways should run their own `stellard` instances so that they do not have to rely on other `stellard` instances being up and running. Another benefit is that if gateway software relies on `stellard` to do key signing, it must be run locally so tha secret keys are not sent to a third party.

When running a `stellard` instance, make sure that rpc and WebSocket access to the gateway `stellard` is not accessible from the outside world. If it is accessible to the outside world, the `stellard` instance can be vulnerable to a denial-of-service attack.

## Account setup
- Create both the cold and hot wallet accounts. The keys for the cold wallet should be created on an computer that does not have access to the internet after generating the keys. For example, the keys can be safely generated on a live boot of ubuntu in which data is wiped after it is run.
- Fund the cold wallet and hot wallets so that they have well above the minimum deposit so that it can pay the transaction fees necessary to operate
- Hot wallet account has to extend trust to the root account using the `stellard` api call `submit TrustSet`. The amount of trust should be high enough to be able to last handle many transactions before requiring refunding from the cold wallet while not low enough that if compromised, places the gateway's future at great risk.
- Cold wallet should require [destination tags](Destination-Tags.md) for all incoming transactions. It is useful when receiving credits from users

## stellar.txt setup
`stellar.txt` is a file that contains data about Stellar-related services a domain provides in a machine readable format. Gateways use this file to tell clients what currencies they support and  how to use the gateway.

Read more about stellar.txt on the [wiki entry](https://wiki.stellar.org/Stellar.txt).

### [currencies]
A gateway defines the currencies that it supports and the issuing accounts (cold wallets as specified above) of the currency. Multiple currencies are allowed to use the same accounts but do not necessarily have to.

As noted in the client user flow explanation above, a client will look at the stellar.txt file to find out which currencies a gateway supports so that it can extend trust to the issuing account.

Currencies are denoted with their 3 letter symbol and the corresponding issuing account address.
```
[currencies]
USD gazAaB4WtLjLz5RMqvL1LB4KvxWFXEe5tX
BTC gazAaB4WtLjLz5RMqvL1LB4KvxWFXEe5tX
CHF gUuPMNHLxkd98o3xe8CKjYGR4vyuYPZuYE
```

### Accessibility
Make sure that stellar.txt is accessible via SSL and that cross-origin resource sharing headers are correctly set.

To verify that the stellar.txt file is accessible, run the following command in the terminal and make sure that stellar.txt is served with the correct CORS header (`Access-Control-Allow-Origin` should be in the output.).
```bash
# Replace stellar.stellar.org with your domain url
curl --head https://stellar.stellar.org/stellar.txt
```

## Sending credits (for users to enter the Stellar network)
Gateways should use the hot wallet to send credits to the users. It is important that all actions be logged and transactions sent and managed robustly.

## Sending transactions robustly
Infrastructure is never perfectly reliable. Software, hardware and networks can all fail some times. There are many ways in which a transaction can go wrong--it might never be sent or might even be sent multiple times. Mistakes are costly, especially when dealing with money. By using transaction robustness techniques, one can handle these transactions safely.

Read more about transaction robustness. It is critical that gateways use techniques like this.

## Receiving credits (for users to exit the Stellar network)
When a user wants to exit the Stellar network through a gateway, the user sends the credits to the gateway cold wallet.

The gateway should require [Destination Tags](Destination-Tags.md) in payments to the cold wallet. This tag is a number assigned to a user so that the gateway can receive funds and know to whom the deposit belongs to. Before a user sends credits to the gateway, the gateway tells them what destination tag to use.

The gateway software can then [subscribe](https://www.stellar.org/api/#api-subscribe) to incoming transactions and listen for incoming transactions. The software can also 

## Operational concerns

### Hot wallet depletion alerts
The gateway software should send automated alerts to the gateway operator and notify when the hot wallet is low on funds and needs to be replenished from the cold wallet.

### Hot wallet denial of service
- Hot wallet draining

### Unsolicited receiving of funds 
- People deposit funds into cold wallet .. how will the gateway send them back, or do they? Gateways need to figure this out.

## Security Enhancements
For extra security, gateway wallets can use `SetRegularKey` to create a new temporary key that can sign transactions from a secondary key. If this key is compromised, the gateway can use the master seed to revoke this secondary key and create a new one.
