---
id: how-to-build-a-client-part-1
title: How to Build a Client (Part 1)
category: Guides
---

In this tutorial, we'll walk through the process of building a Stellar web client application from beginning to end. At each step, we'll focus on a key building block for the application, provide code examples, and explain concepts. If you follow along and write the code, at the end of the tutorial, you'll have built a real, working Stellar application. By the end of the tutorial, you'll have written tools to accomplish the following:

* Create and fund a Stellar account
* View your balances
* Create a trust line to another account
* View/Trade in a currency pair order book
* Send a payment to another account

We’ll be using the test network to build the tutorials. The test network is equivalent to the real Stellar network: there are accounts, trust lines, transactions can be made...the only difference is the nodes running the network are all controlled by Stellar, and the ledger can be reset at any time. The applications you build on the test net will work exactly the same on the live Stellar network.

In this tutorial we'll be using the [js-stellar-lib](https://github.com/stellar/js-stellar-lib) javascript library. This library provides convienent abstractions for building transactions and managing accounts, and interacts with the Stellar network through the [Horizon](https://github.com/stellar/go-horizon) API server.

# Create a Stellar Address

To create an account in the ledger, you first need to create a valid keypair, which is a Stellar address and its corresponding private key. Stellar accounts are addressed using the public half of an ED25519 public/private keypair. Using ```js-stellar-lib```, let's create a new keypair.

{% highlight javascript %}
function generateKeypair() {
    var keypair = StellarLib.Keypair.random();
    return {
        address: keypair.address(),
        secret: keypair.seed()
    };
}
{% endhighlight %}

Great! We now have a javascript function that will generate random, valid Stellar keypairs. To actually create the account in the ledger, an existing account needs to send a transaction to the network that contains a "CreateAccount" operation with your new address as the destination account. This will fund your new account with the minimum Lumens (XLM) for an account in the ledger.

On the testnet, we've set up an account called "FriendBot" which will create and account for any new address and send it 1000 XLM. There's a convienence function in js-stellar-lib for FriendBot in the Server class. Let's write a function that takes a Stellar address and funds it through the friendbot endpoint.

{% highlight javascript %}
// we first need to create a connection to the Server
var Server = new StellarLib.Server({
    hostname: "horizon-testnet.stellar.org",
    port: 443,
    secure: true // https
});

// sends the given address to the Horizon friendbot to be created
function friendbot(address) {
    return Server.friendbot(address)
        .then(function () {
            console.log("Created!");
        })
        .catch(function (err) {
            console.error(err);
        });
}
{% endhighlight %}

In this snippet of code, we've connected to the Horizon API server and created + funded our account in the ledger.

> ### A note on Horizon API Server
>
> Nodes on the Stellar network run software called stellar-core. Stellar-core contains the Stellar protocol, the consensus protocol, handles communication with other nodes on the network, and optionally writes the history it sees to an external file or db. It provides a limited HTTP interface which supports submitting transactions, and that's it.
>
> The Horizon API server is a meant to provide a richer set of APIs returning meaningful information and error codes, and providing services to inspect the state of accounts and history. Therefore, the code we're writing (and the library we're using) don't talk to a stellar-core instance directly - they interact with the Stellar network and the ledger through the Horizon API server.

# Check a Stellar account's balance

Now that we've created an account in the ledger, we'd like to be able to check its balance. For this, we'll use another endpoint in the Horizon API for account information...in the javascript library: Server.accounts().

{% highlight javascript %}
function getBalance(address) {
    Server.accounts(address)
        .then(function (result) {
            console.log(result.balances);
        })
        .catch(function (err) {
            console.error(err);
        });
}
{% endhighlight %}

Here, we're calling the /accounts endpoint with the given address. This returns an accounts object, which contains the balances on the account. If you just created the account, this should only contain the native currency, 1000 XLM.

# Send a Simple Payment

Alright, we've got an account with some lumens. Now let's send them to another account! If need be, create a second account with friendbot. Let's write a function which creates a transaction with a SimplePayment operation that sends some lumens from one account to another.

{% highlight javascript %}
function sendSimplePayment(address, secret, destination, amount) {
    Server.loadAccount(address)
    .then(function (account) {
        var transaction = new StellarLib.TransactionBuilder(account)
            .addOperation(StellarLib.Operation.payment({
                destination: destination,
                currency: new StellarLib.Currency("XLM"),
                amount: amount
            }))
            .addSigner(StellarLib.Keypair.fromSeed(sendAccountSecret))
            .build();
        return Server.submitTransaction(transaction);
    })
    .then(function (result) {
        console.log(result);
    })
    .catch(function (err) {
        console.error(err);
    });
}
{% endhighlight %}

Let's break this function down step by step.

First, we call Server.loadAccount() with the address. This gets the account's current sequence number from the server, and it returns an Account object that encapsulates the account's address and the sequence number. In practice, once you've loaded the account at startup, you should manage its sequence number locally. In fact, the TransactionBuilder API takes care of that for you.

Next, we begin to create our SimplePayment transaction using the TransactionBuilder API. It takes the account object we just loaded from the Server, and some optional transaction level information, such as a text memo (there are different types of memos). All methods on TransactionBuilder return an instance of itself so they can be chained.

In the next step, we add a SimplePayment (Operation.payment()) operation to the transaction. It takes the destination address, the Currency object (for now, hardcoded "XLM"), and the amount of currency to send.

Next, we add the source account's secret key as a signer on the transaction, and finally, we build the transaction which returns a Transaction object that can be submitted to the server.

> Server.submitTransaction() does not yet support synchronous transactions, meaning that it will return and the transaction will be submitting to the server asynchronously, so you'll have to give it a few seconds before it's applied to the ledger.

# Sending and Receiving Stellar Credits

> If you're unfamiliar with Stellar Credits and Gateways, please read [What is a Credit?](/docs/gateways.html) first. We'll assume at least a working knowledge for the rest of the tutorial.

To give credit to another Stellar account for a partciular currency, you simple send it a payment in that currency. However, before you can do this, the receiving account must set a TrustLine to your account. A TrustLine says: "I allow X account to credit me for Y currency up to Z amount."

To begin sending and receiving credits, we'll first implement a "setTrustline" function to create TrustLines to accounts, and then we'll augment our sendSimplePayment function to take any currency type.

{% highlight javascript %}
function setTrustLine(address, secret, issuer, currency, amount) {
    Server.loadAccount(address)
    .then(function (account) {
        return new StellarLib.TransactionBuilder(account)
            .addOperation(StellarLib.Operation.changeTrust({
                currency: new StellarLib.Currency(currency, issuer)
            }))
            // sign the transaction with the account's secret
            .addSigner(StellarLib.Keypair.fromSeed($scope.data.secret))
            .build();
}
{% endhighlight %}

Again, we first load the account object through Server.loadAccount() to get the up to date sequence number. Then, we construct a TransactionBuilder object, with a "ChangeTrust" operation this time. The ChangeTrust operation takes a Currency object, which we saw in the last example. This time, the currency code is not "XLM" but the currency which the source account wants to accept, and the second parameter, the "issuer", is the account it's accepting it from.

Next, we'll extend our sendSimplePayment method to send Stellar credits as well as native currency.

{% highlight javascript %}
function sendSimplePayment(address, secret, destination, amount, currency, issuer) {
    Server.loadAccount(address)
    .then(function (account) {
        var transaction = new StellarLib.TransactionBuilder(account)
            .addOperation(StellarLib.Operation.payment({
                destination: destination,
                currency: new StellarLib.Currency(currency, issuer),
                amount: amount
            }))
            .addSigner(StellarLib.Keypair.fromSeed(sendAccountSecret))
            .build();
        return Server.submitTransaction(transaction);
    })
    .then(function (result) {
        console.log(result);
    })
    .catch(function (err) {
        console.error(err);
    });
}
{% endhighlight %}

Now, sendSimplePayment takes currency and issuer parameters, which are passed to Operation.payment(). If currency is the native currency, "XLM", then issuer should be null. StellarLib.Currency will handle this case.

# Conclusion

In this tutorial, we have:
* Generated a random Stellar address
* Created a Stellar account on the testnet with FriendBot
* Checked the balance of our Stellar address
* Created a function to send a SimplePayment
* Created a function to set a TrustLine to another account.

Head over to [Part 2](/docs/how-to-build-a-client-part-2.html) to learn how to create offers, send path payments, and interacting with a "real" Gateway!