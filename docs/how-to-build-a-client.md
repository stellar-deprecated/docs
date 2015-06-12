---
id: how-to-build-a-client
title: How to Build a Client
category: Guides
---

In this tutorial, we'll walk through the process of building a Stellar web client application from beginning to end. At each step, we'll focus on a key building block for the application, provide code examples, and explain concepts. If you follow along and write the code, at the end of the tutorial, you'll have built a real, working Stellar application. By the end of the tutorial, you'll have written tools to accomplish the following:

* Create and fund a Stellar account
* View your balances
* Create a trust line to another account
* View/Trade in a currency pair order book
* Send a payment to another account

> Follow along in a JSFiddle here: <a href="https://jsfiddle.net/stellardev/3tnyaf0k/">https://jsfiddle.net/stellardev/3tnyaf0k/</a>

We’ll be using the test network to build the tutorials. The test network is equivalent to the real Stellar network: there are accounts, trust lines, transactions can be made...the only difference is the nodes running the network are all controlled by Stellar, and the ledger can be reset at any time. The applications you build on the test net will work exactly the same on the live Stellar network.

In this tutorial we'll be using the [js-stellar-lib](https://github.com/stellar/js-stellar-lib) javascript library. This library provides convienent abstractions for building transactions and managing accounts, and interacts with the Stellar network through the [Horizon](https://github.com/stellar/go-horizon) API server.

# Create a Stellar Address

To create an account in the ledger, you first need to create a valid keypair, which is a Stellar address and its corresponding private key. Stellar accounts are addressed using the public half of an ED25519 public/private keypair. Using ```js-stellar-lib```, let's create a new keypair.

{% highlight javascript %}
function generateKeypair() {
    var keypair = StellarLib.Keypair.random()
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
    return Server.friendbot(address);
}
{% endhighlight %}

In this snippet of code, we've connected to the Horizon API server and created + funded our account in the ledger.

> ### A note on Horizon API Server
>
> Nodes on the Stellar network run stellar-core, the protocol software. However, the client we are building interacts with the Horizon API service, which itself interacts with Stellar core. This proxy service provides a rich set of APIs to provide account/ledger/transaction and other history related endpoints.

# Check a Stellar account's balance

Now that we've created an account in the ledger, we'd like to be able to check its balance. For this, we'll use another endpoint in the Horizon API for account information...in the javascript library: Server.accounts().

{% highlight javascript %}
function getBalance(address) {
    return Server.accounts(address)
        .then(function (result) {
            return result.balances;
        });
}
{% endhighlight %}

Here, we're calling the /accounts endpoint with the given address. This returns an accounts object, which contains the balances on the account. If you just created the account, this should only contain the native currency, 1000 XLM.

# Send a Simple Payment

Alright, we've got an account with some lumens. Now let's send them to another account! If need be, create a second account with friendbot. Let's write a function which creates a transaction with a SimplePayment operation that sends some lumens from one account to another.

{% highlight javascript %}
function sendSimplePayment(address, secret, destination, amount, currency, issuer) {
    return Server.loadAccount(address)
    .then(function (account) {
        var transaction = new StellarLib.TransactionBuilder(account)
            .addOperation(StellarLib.Operation.payment({
                destination: destination,
                currency: new StellarLib.Currency(currency, issuer),
                amount: amount
            }))
            .addSigner(StellarLib.Keypair.fromSeed(secret))
            .build();
        return Server.submitTransaction(transaction);
    });
}
{% endhighlight %}

Let's break this function down step by step.

First, we call Server.loadAccount() with the address. This gets the account's current sequence number from the server, and it returns an Account object that encapsulates the account's address and the sequence number. In practice, once you've loaded the account at startup, you should manage its sequence number locally. In fact, the TransactionBuilder API takes care of that for you.

Next, we begin to create our SimplePayment transaction using the TransactionBuilder API. It takes the account object we just loaded from the Server, and some optional transaction level information, such as a text memo (there are different types of memos). All methods on TransactionBuilder return an instance of itself so they can be chained.

The function takes currency and issuer parameters, which are passed to Operation.payment(). If currency is the native currency, "XLM", then issuer should be null. StellarLib.Currency will handle this case.

Next, we add the source account's secret key as a signer on the transaction, and finally, we build the transaction which returns a Transaction object that can be submitted to the server.

> Server.submitTransaction() does not yet support synchronous transactions, meaning that it will return and the transaction will be submitting to the server asynchronously, so you'll have to give it a few seconds before it's applied to the ledger.

# Sending and Receiving Stellar Credits

> If you're unfamiliar with Stellar Credits and Gateways, please read [What is a Credit?](/docs/gateways.html) first. We'll assume at least a working knowledge for the rest of the tutorial.

To give credit to another Stellar account for a partciular currency, you simple send it a payment in that currency. However, before you can do this, the receiving account must set a TrustLine to your account. A TrustLine says: "I allow X account to credit me for Y currency up to Z amount."

To begin sending and receiving credits, we'll first implement a "setTrustline" function to create TrustLines to accounts, and then we'll augment our sendSimplePayment function to take any currency type.

{% highlight javascript %}
function setTrustLine(address, secret, issuer, currency, amount) {
    return Server.loadAccount(address)
    .then(function (account) {
        return new StellarLib.TransactionBuilder(account)
            .addOperation(StellarLib.Operation.changeTrust({
                currency: new StellarLib.Currency(currency, issuer)
            }))
            .addSigner(StellarLib.Keypair.fromSeed($scope.data.secret))
            .build();
    });
}
{% endhighlight %}

Again, we first load the account object through Server.loadAccount() to get the up to date sequence number. Then, we construct a TransactionBuilder object, with a "ChangeTrust" operation this time. The ChangeTrust operation takes a Currency object, which we saw in the last example. This time, the currency code is not "XLM" but the currency which the source account wants to accept, and the second parameter, the "issuer", is the account it's accepting it from.

# Creating offers

Once your account has a Trustline with and holds credits from another account, it can create offers on the disributed exchange, to buy and sell those credits for 'XLM' or other credits. An offer buys one currency and sells another. Let's create a function using js-stellar-lib to create an offer for a given account and currency pair. Then, we'll walk through and explain each piece of the function step by step.

{% highlight javascript %}
function createOffer(address, secret, sellCode, sellIssuer, buyCode, buyIssuer, amount, price, offerId) {
    return Server.loadAccount(address)
        .then(function (account) {
            var transaction = new StellarLib.TransactionBuilder(account)
                .addOperation(StellarLib.Operation.manageOffer({
                    takerGets: new StellarLib.Currency(sellCode, sellIssuer),
                    takerPays: new StellarLib.Currency(buyCode, buyIssuer),
                    amount: amount,
                    price: price,
                    offerId: offerId
                }))
                .addSigner(StellarLib.Keypair.fromSeed(secret))
                .build();
            return Server.submitTransaction(transaction);
        });
}
{% endhighlight %}

First, as in other functions where we send transactions, we first load the account's latest sequence number for the network. As described earlier, this isn't necessary everytime you send a transaction, as the account object should be stored in memory, as TransactionBuilder will automatically increment the Account object's local sequence number variable when build() is called.

Next, we create a TransactionBuilder, and add a "ManageOffer" operation. Manage offer takes the following parameters:
* takerGets - The currency that you're *selling*.
* takerPays - The currency that you're *buying*.
* amount - The amount of the takerGets currency you're selling.
* price - The price, a floating point number which is takerPays / takerGets.
* offerId - An ID to assign to the offer (0 to delete an exisitng offer).

And then we sign, build, and submit the transaction!

### Exploring Offers

To receive a list of offers on an account, simply use the accounts/offers endpoint of Server, passing the account address.

{% highlight javascript %}
function getOffers(address) {
    return Server.accounts(address, "offers");
}
{% endhighlight %}

# Sending a Path Payment

Path payments are payments that send a destination a different currency than the sender uses to send the payment. Path payments use offers as "paths" to connect the source currency and the destination currency. Multiple offers may be chained together to make complex paths (up to 5).

{% highlight javascript %}
function sendPathPayment(address, secret, sourcecurrency, sourceissuer, sendmax
        destination, destcurrency, destissuer, amount) {
    return Server.loadAccount(address)
    .then(function (account) {
        var transaction = new StellarLib.TransactionBuilder(account)
            .addOperation(StellarLib.Operation.pathPayment({
                sendCurrency: new StellarLib.Currency(sourcecurrency, sourceissuer),
                sendMax: sendmax,
                destination: destination,
                destCurrency: new StellarLib.Currency(destcurrency, destissuer),
                destAmount: amount
            }))
            .addSigner(StellarLib.Keypair.fromSeed(secret))
            .build();
        return Server.submitTransaction(transaction);
    });
}
{% endhighlight %}

Here we create a transaction as we've done before, and add a "PathPayment" operation. The sendCurrency is the currency the sender will use, and the destinationCurrency is the currency the destination wil receive. Destination amount is specified to indicate how much of the destination currency the destination will receive. Send max is the max amount of currency the sender will send (this is dependent on the exact offer used).

# Conclusion

Congratulations! If you've followed along to this point, you've built the necessary functions for a basic Stellar client. That said, a useful client would require much more than just these basics, such as a way to manage a user's secret keys behind a log in screen, integration with federation, ect. Continue learning about how to improve clients with these tutorials and guides:

* Stellar Wallet
* Interstellar
* How to build a Gateway