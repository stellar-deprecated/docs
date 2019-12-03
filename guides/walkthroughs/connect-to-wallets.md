---
title: How To Connect Your Anchor Service to Stellar Wallets
---
> *Check out [this diagram](https://diagrams.stellar.org/cross-border-payments/) to see an example of the end-to-end user experience enabled by the setup described below.*

As an issuer of a stablecoin on Stellar (aka a *fiat anchor*), you accept customer funds via local rails, issue Stellar-network tokens representing those deposits, and allow customers to withdraw those tokens via those same rails for money in their pocket or money in the bank.  

Since customers generally use *wallets* to hold their Stellar tokens, and since there are a lot of wallets to choose from, _**a crucial step in making your token widely accessible is to set up APIs that enable wallets to offer in-app deposits and withdrawals, and to structure those APIs following best practices so that any wallet can easily find and interact with them.**_        

Those best practices are specified in [Stellar Ecosystem Proposals (SEPs)](https://github.com/stellar/stellar-protocol/blob/master/ecosystem), which are publicly created, open-source documents that live in a Github repository.  This guide is a map to the SEPs you should implement to allow for maximum interoperability.    

It will walk you through the servers and endpoints you should set up in order to allow wallets to act on behalf of users to:

* Authenticate a user session
* Pass KYC information
* Inititiate deposits and withdrawals

## The Business-to-Customer Suite of APIs

The information detailing how to set up these APIs is spread out across five SEPs, each of which covers a specific part of the process:  

* [SEP-1: stellar.toml specification](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md)
* [SEP-6: Anchor/Client Interoperability](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0006.md)
* [SEP-9: Standard KYC/AML Fields](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0009.md)
* [SEP-10: Stellar Web Authentication](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md)
* [SEP-12: Anchor/Client Customer Info Transfer](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0012.md)

The SEPs detail the endpoints you need to set up, how wallets structure interactions with those endpoints, and how you structure your responses.  The implementation decisions, however, are up to you: you are free to design, develop, and deploy these APIs based on your specific needs, resources, tech stack, and organizational abilities.

Implementing this suite of SEPs allows you to offer customers a pretty amazing experience: using their interface of choice, they can do everything they need to do to make a deposit or withdrawal in a few simple steps.  If you want people to actually use your stablecoin, think of these implementations as a must.

Here are the steps you need to take, and the SEPs you need to take them.

## Set up a transfer server ([SEP-6](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0006.md))

The Transfer Server is at the core of the anchor/wallet interaction.  It hosts endpoints that gather and transmit information on deposits, withdrawals, transaction status, and transaction history.  It also cues the wallet to take required steps to authenticate a user session and collect KYC information.  

Over the course of a deposit or withdrawal, a wallet may ping the Transfer Server several times, collecting and returning required information along the way.  For instance:

* If user authentication is required, the Transfer Server will route the wallet to the `WEB_AUTH_ENDPOINT` specified in SEP-10
* If KYC is required, the Transfer Server will route the wallet to the `/customer` endpoint specified in SEP-12

Once all those requirements are met, the Transfer Server:

* Collects the user’s account information, which you’ll use to credit the deposit or withdrawal
* Transmits your account information, which is where the user will send their money to make a deposit or redeem their tokens to initiate a withdrawal
* Provides additional instructions or information about required memos, fees, or expected wait times

All those interactions happen in the background via API.  From the user perspective, the interaction is incredibly simple: they choose to make a deposit or withdrawal; they get user-friendly instructions in return.  

## Set up an endpoint for KYC ([SEP-12](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0012.md) / [SEP-9](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0009.md))

Before accepting fiat deposits or honoring fiat withdrawals, you will likely need to obtain KYC information.  There are two different ways you can collect that information: interactively and non-interactively.

**Interactive KYC** involves having a user fill out information on a webpage hosted by you or by a third-party provider.  When a wallet pings your Transfer Server, it responds with a URL that the wallet opens in an iframe or a popup browser window.

**Non-interactive KYC** allows a user to enter required information using the wallet interface itself.  When a wallet pings your Transfer Server, it responds with a list of required fields pulled from standards specified in SEP-9, along with a request for required image data such as a photo ID.  

**Non-interactive KYC is far more customer-friendly, and more apps will integrate your service if you choose this option.**  Rather than forcing a user to re-enter KYC info for every token they interact with, a wallet can collect a user’s KYC info once, and share it with issuers as needed.  From a user’s perspective, that’s a much more seamless and intuitive experience: their app isn’t constantly asking them to enter the same information and upload the same photo ID over and over again.    

To handle non-interactive KYC, you need to set up a `/customer` endpoint that wallets can use to upload customer info for you to inspect and approve.  You can host that endpoint on your Transfer Server, or you can set up a dedicated KYC Server: that’s up to you.  The wallet uploads the KYC info to that endpoint, the endpoint lets the wallet know if the upload is a success, and if it is, the wallet pings the Transfer Server to initiate the deposit or withdrawal.   

Meanwhile, you inspect the KYC info using your method of choice.  Since KYC checks often happen in real-time, the non-interactive method allows deposits and withdrawals to achieve an uninterrupted flow.

## Set up an endpoint for user session authentication ([SEP-10](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md))

Before accepting KYC info non-interactively, you will need to verify that the user uploading the info owns the Stellar account that’s signing the deposit or withdrawal transaction.  To do that, you set up a `WEB_AUTH_ENDPOINT`, which uses a challenge/response method to generate a JSON Web Token that the wallet then includes as a header or query parameter when uploading information to the `/customer` endpoint.

The `WEB_AUTH_ENDPOINT` uses specially-formed Stellar transactions to verify ownership of a Stellar account’s secret key.  Essentially:

* The wallet requests an authenticated user session from `WEB_AUTH_ENDPOINT`
* The `WEB_AUTH_ENDPOINT` responds with a Stellar transaction that is signed by your Stellar account, but has an invalid [sequence number](https://www.stellar.org/developers/guides/concepts/transactions.html#sequence-number)
* Even though the transaction can’t be submitted to the ledger, the wallet can use Stellar libraries to check to make sure that your signature is valid
* The wallet then signs the transaction on behalf of its user, and returns it to the `WEB_AUTH_ENDPOINT`
* You check that the wallet-provided signature is valid
* If it is, the `WEB_AUTH_ENDPOINT` provides a JWT
      
You can set the JWT to expire whenever you want.  The rule of thumb is 24 hours, but again: the ultimate design decision is up to you.

## Complete your stellar.toml file ([SEP-1](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md))

Your stellar.toml file is a vital piece of your Stellar infrastructure, so vital in fact that we published [a separate guide]
(https://www.stellar.org/developers/guides/concepts/stellar-toml.html) dedicated to helping you fill it out.  You should consult that guide, and complete as much of your stellar.toml as possible.  

The stellar.toml specification relies on a simple trick to create a link between your on-chain listing and off-chain information: using a `set_options` [operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#set-options), you set the home domain of your Stellar issuing account to your website.  You then publish a static resource on your website containing information about your Stellar integration.  A user (or a bot) can then look at your Stellar account, find your stellar.toml, and use the structured information there to learn more about your Stellar integration.

Wallets crawl your stellar.toml, see what tokens you offer, and use that information to populate their listings.  They also check to see what SEPs you support, and where to find relevant endpoints to query.

So after setting up the APIs discussed above, make sure to add the following fields to the Account Information section of your stellar.toml so that wallets know that you’re set up for in-app deposits and withdrawals:    
* `TRANSFER_SERVER`
* `KYC_SERVER`
* `WEB_AUTH_ENDPOINT`

Completing your stellar.toml file is crucial to getting any exposure in the Stellar ecosystem: wallets generally don’t display tokens with incomplete stellar.toml files, and users are reluctant to touch assets that lack expected information.  The fields above are necessary to let wallets know you support in-app deposits and withdrawals, but you should also make sure to complete the Issuer Documentation, Point of Contact Documentation, and Currency Documentation sections.

## Putting it all together
Once you implement all the SEPs, you enable the end-to-end user experience outlined in [this diagram](https://diagrams.stellar.org/cross-border-payments/). 

Here's a quick run through of a typical deposit:

### From a user’s perspective:
* Using their wallet of choice, user initiates fiat deposit with you
* Enters KYC info
* They’re prompted to send funds via ACH to your bank account
* Once their ACH deposit clears, your tokens appear in their wallet
* Like magic!

### Here’s what’s going on in the background:
* Wallet pings your `WEB_AUTH_ENDPOINT`, goes through challenge/response, receives a JWT token to authenticate user session
* Wallet uploads user’s KYC info to your `/customer` endpoint
* You check customer KYC 
* Wallet pings your `/deposit` endpoint with customer Stellar account public key
* Since KYC and user authentication requirements are met, your `/deposit` endpoint responds with your bank account information
* User sends funds via ACH to your bank account
* User’s ACH deposit clears
* You credit user’s Stellar account with tokens
* Like clockwork!
