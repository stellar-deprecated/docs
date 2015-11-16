This is a list of random ideas involving Stellar that would be cool to build. Feel free to add your own or take any here and run! 
As always, if you need help build anything with Stellar please ask us for help.

If you are not looking for a full blow project but still want to help out, check for `help wanted` labels in the issues of any of our [repos](https://github.com/stellar).

# Slack bot 
- Report a stream of all stellar transactions to a channel.
- *Advanced* Allow people to send money/points/+1's to other slack members `/send @bob $5`.

# API Mashups
- Twilio meets Stellar: SMS alerts for transactions
- Twitter meets Stellar: Tweet to send or Twitter alerts
- Reddit meets Stellar: Tipbot!
- And tons more

# Graph of Horizon data
This is a relatively simple project. It would just graphically display information pulled from Horizon. 
Besides the obvious things like looking up accounts and transactions, it would also be cool to see:
 - Tree of account creation. All accounts are created by other accounts so you could show this tree of lineage.
 - Graph of ledger header info over time
   - transaction count
   - operation count
   - ledger close times
   - fee pool

# Archivist
This is a tool to keep your history archive in good shape. You give it:
- your history archive
- list of source archives

Starting from the beginning of time it compares your archived files with those on your source list. If you are missing files they get pulled in and published to yours. It will log or otherwise notify you of any file discrepancy between the various archives. 

# Resource Paywall
Let's say you have some public facing service, maybe a streaming service or an open wi-fi. You want to allow other people to use this service if they pay you small amounts. You might want this for say either for spam prevention or as a business. This is a job for the **Toll Collector**...

## Toll Collector
This is a simple service that keeps track of any XLM sent to a `toll address`. It has a database of public keys and amounts of XLM they have sent to the toll address. It watches for payments to the toll address in Stellar network to add to this DB. 

The toll collector service has one RPC or endpoint that you can call :

  - `charge(publicKey, amount of XLM)` returns
    - `amount XLM charged`
    - `amount of XLM this key has left`

Your app can publish its Stellar toll address that it needs payment to. When someone tries to use the resource, that resource server has them authenticate their public key and calls `charge` on the Toll Collector to decrements the consumer's balance in the DB. If they are out of balance then you can send the consumer a message notifying them.

# Multisig Coordinator
This would be a web application that facilitates creating multisig transactions. Typically you must coordinate between several parties to generate a transaction for an account that is protected by multisig. This site would make this process much easier and allow you to coordinate in cases where you don't know the other party.

Ideally it would have the following features:
- Associate an email address with your public key
- Create a tx that you would like to be signed by multiple parties.
- Enter in the public keys that you would like to sign the tx.
- If any of these keys have previously associated their email address then they will be sent a message.
- When you come to the site you see a list of all pending transactions. 
  - You can see the details of each transaction.
  - You can see who initiated the transaction.
  - You can see who else has signed the transaction.
  - You can sign any that are waiting for you.
- Once a pending transaction is signed by enough people, it is submitted to the network.
- Once the transaction is submitted, all the signers are notified.

# Quorum Monitor
Some web page that shows the state of the network quorum graph. Ideally would show:
- a live graph of how the network is connected. 
- what servers are having issues.
- any servers that disagree with the rest of the network.
- Maybe a history of uptime for each validator
- should be able to view the quorum graph from the point of view of any given validator

You would probably need to run stellar-core to build this. You can get the data from the stellar-core logs and the /quorum command.

*Advanced Level*: Build a server that connects to stellar-core and monitors the externalized messages and the various validator broadcasts. 

# Libraries
Build a library in your favorite language.
- Python
- C#
- PHP
- Java
- Haskell
- Etc.












	









