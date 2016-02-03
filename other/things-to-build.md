Build cool things on Stellar! This list outlines a few ideas for applications. Feel free to add your own or take one here and run with it. 
As always, if you need help building anything with Stellar, just ask us ([Slack chat](http://slack.stellar.org/)),[IRC](https://kiwiirc.com/client/irc.freenode.net/#stellar-dev), or developers@stellar.org) .

If you're not looking for a full-blown project but still want to help out, look for `help wanted` issue labels in any of our [repos](https://github.com/stellar).

# Slack Bot 
- Report a stream of all stellar transactions to a channel.
- *Advanced*: Allow people to send money/points/+1's to other Slack team members `/send @bob $5`.

# API Mashups
- Twilio meets Stellar: SMS alerts for transactions (you can check the example [here](https://github.com/stellar/stellar-sms-client))
- Twitter meets Stellar: Tweet to send money or Twitter alerts
- Reddit meets Stellar: Tipbot!
- Many more possibilities

# Graph of Horizon data
A relatively simple project that graphically displays information pulled from Horizon and could look up accounts and transactions. It would also be cool to see:
 - Tree of account creation. All accounts are created by other accounts, so you could show this tree of lineage.
 - Graph of ledger header info over time:
   - Transaction count
   - Operation count
   - Ledger close times
   - Fee pool

# Federation Service
Implement a simple [Federation server](https://www.stellar.org/developers/learn/concepts/federation.html) and setup a webpage where anyone can claim a name*yourdomain.com stellar address and associate their stellar account ID with it. The catch is your service will only federate for accounts that set their [inflation destination](https://www.stellar.org/developers/learn/concepts/inflation.html) to one provided by your domain.

You can also contribute to the [federation server](https://github.com/stellar/federation/) maintained by Stellar Development Foundation.

# Archivist
A tool to keep your history archive in good shape. You give it:
- Your history archive
- List of source archives

Starting from the beginning of time, this tool compares your archived files with those on your source list. If you're missing files, they get pulled in and published to yours. It will log or otherwise notify you of any file discrepancy between the various archives. 

# Resource Paywall
Let's say you have a public-facing service, perhaps for streaming or open wifi. You want to allow other people to use this service if they pay you small amounts. These payments could be used as spam prevention or to support your business. This is a job for the **toll collector**...

## Toll Collector
A simple service that keeps track of any XLM sent to a `toll address`. The toll collector has a database of public keys and amounts of XLM it has sent to the toll address. It watches for payments to the toll address on the Stellar network and adds them to this DB. 

The toll collector service has one RPC or endpoint that you can call:

  - `charge(publicKey, amount of XLM)` returns
    - `amount XLM charged`
    - `amount of XLM this key has left`

Your app can publish its Stellar toll address for payments. When someone tries to use your service, the server has them authenticate their public key and calls `charge` on the Toll Collector to decrements the consumer's balance in the DB. You can send the consumer a message when their balance is zero.

#Tutorials
- Build a tutorial to show others how to build something cool using Stellar

# Multisig Coordinator
A web application that facilitates creating multisig transactions. Typically you must coordinate between several parties to generate a transaction for an account protected by multisig. This site would make this process much easier and allow you to coordinate in cases where you don't know the other party.

Ideally the multisig coordinator includes the following features:
- Associate an email address with your public key
- Create a tx that you would like to be signed by multiple parties
- Enter the public keys that you would like to sign the tx
- If any of these keys have previously associated their email address, then they will be sent a message
- When you come to the site you see a list of all pending transactions: 
  - You can see the details of each transaction
  - You can see who initiated the transaction
  - You can see who else has signed the transaction
  - You can sign any that are waiting for you
- Once a pending transaction is signed by enough people, it is submitted to the network
- Once the transaction is submitted, all the signers are notified

# Quorum Monitor
A web page that shows the state of the network quorum graph. Ideally the quorum monitor shows:
- A live graph of how the network is connected
- What servers are having issues
- Any servers that disagree with the rest of the network
- Perhaps a history of uptime for each validator

You should be able to view the quorum graph from the point of view of any given validator. You would probably need to run stellar-core to build the quorum monitor. You can get the data from the stellar-core logs and the /quorum command.

*Advanced*: Build a server that connects to stellar-core and monitors the externalized messages and the various validator broadcasts. 

# Libraries
Build a library in your favorite language:
- C#
- PHP
- Haskell
- Other languages

Or contribute to our existing SDKs:
- [JavaScript](https://github.com/stellar/js-stellar-sdk)
- [Go](https://github.com/stellar/go-stellar-base)
- [Java](https://github.com/stellar/java-stellar-sdk)
- [Python](https://github.com/StellarCN/py-stellar-base/)


# Product and Service Ideas We've Heard
- microsavings account for school, health, insurance
- microinsurance
- p2p lending
- conditional cash transfers
- donation systems for nonprofits
- loyalty points programs
- community currencies
- time banks
- volunteer hour tracking
- anywhere ATM or human ATM mobile apps
