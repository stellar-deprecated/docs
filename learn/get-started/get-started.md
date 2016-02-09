---
title: Get Started
---

The best way to start your journey with Stellar is to create a [test network](./test-net.html) account and send your first transaction.

In this tutorial we will be using our [JavaScript SDK](https://www.stellar.org/developers/js-stellar-sdk/learn/index.html) but you can use other [SDKs](https://www.stellar.org/developers/horizon/learn/#libraries) as well.

## Installing `stellar-sdk`

First create your NodeJS project if `package.json` file is not present in your working directory:
```
npm init
```

Then install our JavaScript SDK:
```
npm install --save stellar-sdk
```

## Creating a test network account

First you have to generate your key pair.

`generate_keypair.js` file:
```js
var StellarSdk = require('stellar-sdk');
var keypair = StellarSdk.Keypair.random();

console.log('Account ID:');
console.log(keypair.accountId());
console.log('Secret Seed:');
console.log(keypair.seed());
```

Now, let's execute the file:
```
$ node generate_keypair.js

Account ID:
GDGOKHIRX63EIAXKVI77BQV7LMDUH7DR4BMDDU77DJUXLPUU5HAXGN64
Secret Seed:
SD5ALH5UA7LRMN6ZB2QILW35YZTEOE37M3JVNAKZ3KWT7QSC77ABJ3ID
```

You will use your key pair to receive funds (account ID) and to sign your transaction (secret seed). You can share your account ID publicly but you must keep your seed secret. Otherwise, someone may steel your funds!

To be able to submit transactions to Stellar network you must have an [account](https://www.stellar.org/developers/learn/concepts/accounts.html). Each account on Stellar network must have a [minimum balance](https://www.stellar.org/developers/learn/concepts/fees.html#minimum-balance) of 20 XLM ([lumens](https://www.stellar.org/developers/learn/concepts/assets.html#lumens-xlm-)).

In test network you can use Friendbot to send you a small amount of lumens for testing purposes (remember to change `addr` param to your account ID`:
```
$ curl "https://horizon-testnet.stellar.org/friendbot?addr=GDGOKHIRX63EIAXKVI77BQV7LMDUH7DR4BMDDU77DJUXLPUU5HAXGN64"
{
  "_links": {
    "transaction": {
      "href": "https://horizon-testnet.stellar.org/transactions/f26916463a434c8b2ba28df657f3044d8295ddfa4b146a2f35788e7b98dd4f60"
    }
  },
  "hash": "f26916463a434c8b2ba28df657f3044d8295ddfa4b146a2f35788e7b98dd4f60",
  "ledger": 2436331,
  "envelope_xdr": "AAAAAGXNhLrhGtltTwCpmqlarh7s1DB2hIkbP//jgzn4Fos/AAAAZAAAAA0AABP4AAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAzOUdEb+2RALqqj/wwr9bB0P8ceBYMdP/Gml1vpTpwXMAAAAXSHboAAAAAAAAAAAB+BaLPwAAAEDGbb/VRB0m2chzGFlKRABM7Uj+lWfMNpwxxwyUf8nsW3zRCZhjXdJKlmX3+Th7nvQyGE0dRMpzQt309vFNMoUH",
  "result_xdr": "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAA=",
  "result_meta_xdr": "AAAAAAAAAAEAAAACAAAAAAAlLOsAAAAAAAAAAMzlHRG/tkQC6qo/8MK/WwdD/HHgWDHT/xppdb6U6cFzAAAAF0h26AAAJSzrAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAQAlLOsAAAAAAAAAAGXNhLrhGtltTwCpmqlarh7s1DB2hIkbP//jgzn4Fos/ACJ91JY4igAAAAANAAAT+AAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAA"
}
```

The JSON object you see is a response from [Horizon server](https://www.stellar.org/developers/horizon/learn/index.html) which acts as the interface between [stellar-core](https://github.com/stellar/stellar-core) and applications that want to access the Stellar network. You can learn more about the meaning of each of these fields in [Post Transaction](https://www.stellar.org/developers/horizon/reference/transactions-create.html) page. We will be using Horizon in the next section.

Your account is now created and you can build and submit your first transaction.

## Building transactions

Let's check the code first and then we will explain it step by step.

`transaction.js` file:
```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
var keypair = StellarSdk.Keypair.fromSeed('SD5ALH5UA7LRMN6ZB2QILW35YZTEOE37M3JVNAKZ3KWT7QSC77ABJ3ID');

server.loadAccount(keypair.accountId())
  .then(function(account) {
    var transaction = new StellarSdk.TransactionBuilder(account)
      .addOperation(StellarSdk.Operation.payment({
          destination: "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
          asset: StellarSdk.Asset.native(),
          amount: "20"
      }))
      .build();

    transaction.sign(keypair);

    return server.submitTransaction(transaction)
      .then(function (transactionResult) {
        console.log('Success:')
        console.log(transactionResult);
      });
  })
  .catch(function (err) {
    console.error('Error:')
    console.error(err);
  });
```

* First we need to define which Horizon server we want to interact with. Since Stellar is a distributed network everyone can start a server and connect to other Stellar nodes. We create a new [`Server`](https://stellar.github.io/js-stellar-sdk/Server.html) instance and configure it to connect to `https://horizon-testnet.stellar.org`.
* Then we create a [`Keypair`](https://stellar.github.io/js-stellar-sdk/Keypair.html#.fromSeed) object using our previously created account's secret seed.
* Now, we need to load the current [sequence number](https://www.stellar.org/developers/learn/concepts/accounts.html#sequence-number) of our account. Sequence numbers protect from replay attacks. Do do this we use [`Server.loadAccount`](https://stellar.github.io/js-stellar-sdk/Server.html#loadAccount) method.
* JavaScript SDK exposes [`TransactionBuilder`](https://stellar.github.io/js-stellar-sdk/TransactionBuilder.html) class that allows you to build transactions easily. Each [transaction](https://www.stellar.org/developers/learn/concepts/transactions.html) consists of at least one [operation](https://www.stellar.org/developers/learn/concepts/operations.html). There are many types of operations but in this example we will use `payment` operation which sends assets from one account to another.
* [Payment operation](https://www.stellar.org/developers/learn/concepts/list-of-operations.html#payment) requires 3 arguments:
  * `destination` - ID of the account we want to send our payment,
  * `asset` - the [asset](https://www.stellar.org/developers/learn/concepts/assets.html) we want to send (in this example we will be using Stellar native asset: lumens),
  * `amount` - amount of asset to send.
* To build a transaction we call [`TransactionBuilder.build`](https://stellar.github.io/js-stellar-sdk/TransactionBuilder.html#build) method.
* As state before, every transaction submited to Stellar network must be cryptographically signed using our secret seed. To sign a transaction we use [`Transaction.sign`](https://stellar.github.io/js-stellar-sdk/Transaction.html#sign) method.
* The last step is to submit a built transaction to Horizon using [`Server.submitTransaction`](https://stellar.github.io/js-stellar-sdk/Server.html#submitTransaction) method.

Let's execute `transaction.js` file:
```
$ node transaction.js

Success:
{ _links: { transaction: { href: 'https://horizon-testnet.stellar.org/transactions/84bf42dd52ff4ee2167b649e17407a721276af634ae7e8e816a23f241640494b' } },
  hash: '84bf42dd52ff4ee2167b649e17407a721276af634ae7e8e816a23f241640494b',
  ledger: 2436757,
  envelope_xdr: 'AAAAAMzlHRG/tkQC6qo/8MK/WwdD/HHgWDHT/xppdb6U6cFzAAAAZAAlLOsAAAABAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAYvwdC9CRsrYcDdZWNGsqaNfTR8bywsjubQRHAlb8BfcAAAAAAAAAAAvrwgAAAAAAAAAAAZTpwXMAAABA8TUcnUODRYge2DxIkTCglsou8LjOHWNEFUaJwGJGvHIYr+Dvjn15gUMXlz1H1uu7tzOcSSe/h8ACVYIHXE3yDA==',
  result_xdr: 'AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAA=',
  result_meta_xdr: 'AAAAAAAAAAEAAAADAAAAAwAj99wAAAAAAAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3ACGy2NBqGrwAAAAAAAAc1QAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAQAlLpUAAAAAAAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3ACGy2NxV3LwAAAAAAAAc1QAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAQAlLpUAAAAAAAAAAMzlHRG/tkQC6qo/8MK/WwdD/HHgWDHT/xppdb6U6cFzAAAAFzyLJZwAJSzrAAAAAQAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAA' }
```

You have just sent your first transaction!

## Where to go from here?

* Learn more about Stellar concepts (check the sidebar).
* Check the [list of operations](https://www.stellar.org/developers/learn/concepts/list-of-operations.html) you can use in Stellar network.
* Check [JavaScript SDK documentation](https://www.stellar.org/developers/js-stellar-sdk/learn/index.html) and [API reference](https://stellar.github.io/js-stellar-sdk/).
* Check [Horizon API Reference](https://www.stellar.org/developers/reference/).
* Join our community on [Slack](http://slack.stellar.org/).
