---
title: Send and Receive Money
---

Now that you have an account, you can send and receive funds through the Stellar network. If you haven’t created an account yet, read [step 2 of the Get Started guide](./create-account.md).

Most of the time, you’ll be sending money to someone else who has their own account. For this interactive guide, however, you should make a second account to transact with using the same method you used to make your first account.

## Send Payments

Actions that change things in Stellar, like sending payments, changing your account, or making offers to trade various kinds of currencies, are called **operations.**[^1] In order to actually perform an operation, you create a **transaction**, which is just a group of operations accompanied by some extra information, like what account is making the transaction and a cryptographic signature to verify that the transaction is authentic.[^2]

If any operation in the transaction fails, they all fail. For example, let’s say you have 100 lumens and you make two payment operations of 60 lumens each. If you make two transactions (each with one operation), the first will succeed and the second will fail because you don’t have enough lumens. You’ll be left with 40 lumens. However, if you group the two payments into a single transaction, they will both fail and you’ll be left with the full 100 lumens still in your account.

Finally, every transaction costs a small fee. Like the minimum balance on accounts, this fee helps stop people from overloading the system with lots of transactions. Known as the **base fee**, it is very small—100 stroops per operation (that’s 0.00001 XLM; stroops are easier to talk about than such tiny fractions of a lumen). A transaction with two operations would cost 200 stroops.[^3]

### Building a Transaction

Stellar stores and communicates transaction data in a binary format called XDR.[^4] Luckily, the Stellar SDKs provide tools that take care of all that. Here’s how you might send 10 lumens to another account:

<code-example name="Submitting a Transaction">

```js
var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
var sourceKeys = StellarSdk.Keypair
  .fromSecret('SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4');
var destinationId = 'GA2C5RFPE6GCKMY3US5PAB6UZLKIGSPIUKSLRB6Q723BM2OARMDUYEJ5';
// Transaction will hold a built transaction we can resubmit if the result is unknown.
var transaction;

// First, check to make sure that the destination account exists.
// You could skip this, but if the account does not exist, you will be charged
// the transaction fee when the transaction fails.
server.loadAccount(destinationId)
  // If the account is not found, surface a nicer error message for logging.
  .catch(StellarSdk.NotFoundError, function (error) {
    throw new Error('The destination account does not exist!');
  })
  // If there was no error, load up-to-date information on your account.
  .then(function() {
    return server.loadAccount(sourceKeys.publicKey());
  })
  .then(function(sourceAccount) {
    // Start building the transaction.
    transaction = new StellarSdk.TransactionBuilder(sourceAccount)
      .addOperation(StellarSdk.Operation.payment({
        destination: destinationId,
        // Because Stellar allows transaction in many currencies, you must
        // specify the asset type. The special "native" asset represents Lumens.
        asset: StellarSdk.Asset.native(),
        amount: "10"
      }))
      // A memo allows you to add your own metadata to a transaction. It's
      // optional and does not affect how Stellar treats the transaction.
      .addMemo(StellarSdk.Memo.text('Test Transaction'))
      .build();
    // Sign the transaction to prove you are actually the person sending it.
    transaction.sign(sourceKeys);
    // And finally, send it off to Stellar!
    return server.submitTransaction(transaction);
  })
  .then(function(result) {
    console.log('Success! Results:', result);
  })
  .catch(function(error) {
    console.error('Something went wrong!', error);
    // If the result is unknown (no response body, timeout etc.) we simply resubmit
    // already built transaction:
    // server.submitTransaction(transaction);
  });
```

```java
Network.useTestNetwork();
Server server = new Server("https://horizon-testnet.stellar.org");

KeyPair source = KeyPair.fromSecretSeed("SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4");
KeyPair destination = KeyPair.fromAccountId("GA2C5RFPE6GCKMY3US5PAB6UZLKIGSPIUKSLRB6Q723BM2OARMDUYEJ5");

// First, check to make sure that the destination account exists.
// You could skip this, but if the account does not exist, you will be charged
// the transaction fee when the transaction fails.
// It will throw HttpResponseException if account does not exist or there was another error.
server.accounts().account(destination);

// If there was no error, load up-to-date information on your account.
AccountResponse sourceAccount = server.accounts().account(source);

// Start building the transaction.
Transaction transaction = new Transaction.Builder(sourceAccount)
        .addOperation(new PaymentOperation.Builder(destination, new AssetTypeNative(), "10").build())
        // A memo allows you to add your own metadata to a transaction. It's
        // optional and does not affect how Stellar treats the transaction.
        .addMemo(Memo.text("Test Transaction"))
        .build();
// Sign the transaction to prove you are actually the person sending it.
transaction.sign(source);

// And finally, send it off to Stellar!
try {
  SubmitTransactionResponse response = server.submitTransaction(transaction);
  System.out.println("Success!");
  System.out.println(response);
} catch (Exception e) {
  System.out.println("Something went wrong!");
  System.out.println(e.getMessage());
  // If the result is unknown (no response body, timeout etc.) we simply resubmit
  // already built transaction:
  // SubmitTransactionResponse response = server.submitTransaction(transaction);
}
```

```go
package main

import (
	"github.com/stellar/go/build"
    "github.com/stellar/go/clients/horizon"
    "fmt"
)

func main () {
	source := "SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4"
	destination := "GA2C5RFPE6GCKMY3US5PAB6UZLKIGSPIUKSLRB6Q723BM2OARMDUYEJ5"

	// Make sure destination account exists
	if _, err := horizon.DefaultTestNetClient.LoadAccount(destination); err != nil {
		panic(err)
	}

	passphrase := network.TestNetworkPassphrase

	tx, err := build.Transaction(
		build.TestNetwork,
		build.SourceAccount{source},
		build.AutoSequence{horizon.DefaultTestNetClient},
		build.Payment(
			build.Destination{destination},
			build.NativeAmount{"10"},
		),
	)

	if err != nil {
		panic(err)
	}

	// Sign the transaction to prove you are actually the person sending it.
	txe, err := tx.Sign(source)
	if err != nil {
		panic(err)
	}

	txeB64, err := txe.Base64()
	if err != nil {
		panic(err)
	}

	// And finally, send it off to Stellar!
	resp, err := horizon.DefaultTestNetClient.SubmitTransaction(txeB64)
	if err != nil {
		panic(err)
	}

	fmt.Println("Successful Transaction:")
	fmt.Println("Ledger:", resp.Ledger)
	fmt.Println("Hash:", resp.Hash)
}
```

</code-example>

What exactly happened there? Let’s break it down.

1. Confirm that the account ID you are sending to actually exists by loading the associated account data from the Stellar network. Everything will actually be OK if you skip this step, but doing it gives you an opportunity to avoid making a transaction you know will fail. You can also use this call to perform any other verification you might want to do on a destination account. If you are writing banking software, for example, this is a good place to insert regulatory compliance checks and <abbr title="Know Your Customer">KYC</abbr> verification.

    <code-example name="Load an Account">

    ```js
    server.loadAccount(destinationId)
      .then(function(account) { /* validate the account */ })
    ```

    ```java
    server.accounts().account(destination);
    ```

    ```go
	if _, err := horizon.DefaultTestNetClient.LoadAccount(destination); err != nil {
		panic(err)
	}
    ```

    </code-example>

2. Load data for the account you are sending from. An account can only perform one transaction at a time[^5] and has something called a [**sequence number**,](../concepts/accounts.md#sequence-number) which helps Stellar verify the order of transactions. A transaction’s sequence number needs to match the account’s sequence number, so you need to get the account’s current sequence number from the network.

    <code-example name="Load Source Account">

    ```js
    .then(function() {
    return server.loadAccount(sourceKeys.publicKey());
    })
    ```

    ```java
    AccountResponse sourceAccount = server.accounts().account(source);
    ```

    </code-example>

    The SDK will automatically increment the account’s sequence number when you build a transaction, so you won’t need to retrieve this information again if you want to perform a second transaction.

3. Start building a transaction. This requires an account object, not just an account ID, because it will increment the account’s sequence number.

    <code-example name="Build a Transaction">

    ```js
    var transaction = new StellarSdk.TransactionBuilder(sourceAccount)
    ```

    ```java
    Transaction transaction = new Transaction.Builder(sourceAccount)
    ```

    ```go
	tx, err := build.Transaction(
	// ...
	)
    ```

    </code-example>

4. Add the payment operation to the account. Note that you need to specify the type of asset you are sending—Stellar’s “native” currency is the lumen, but you can send any type of asset or currency you like, from dollars to bitcoin to any sort of asset you trust the issuer to redeem [(more details below)](#transacting-in-other-currencies). For now, though, we’ll stick to lumens, which are called “native” assets in the SDK:

    <code-example name="Add an Operation">

    ```js
    .addOperation(StellarSdk.Operation.payment({
      destination: destinationId,
      asset: StellarSdk.Asset.native(),
      amount: "10"
    }))
    ```

    ```java
    .addOperation(new PaymentOperation.Builder(destination, new AssetTypeNative(), "10").build())
    ```

    ```go
    tx, err := build.Transaction(
		build.Network{passphrase},
		build.SourceAccount{from},
		build.AutoSequence{horizon.DefaultTestNetClient},
		build.MemoText{"Test Transaction"},
		build.Payment(
			build.Destination{to},
			build.NativeAmount{"10"},
		),
	)
    ```

    </code-example>

    You should also note that the amount is a string rather than a number. When working with extremely small fractions or large values, [floating point math can introduce small inaccuracies](https://en.wikipedia.org/wiki/Floating_point#Accuracy_problems). Since not all systems have a native way to accurately represent extremely small or large decimals, Stellar uses strings as a reliable way to represent the exact amount across any system.

5. Optionally, you can add your own metadata, called a [**memo,**](../concepts/transactions.md#memo) to a transaction. Stellar doesn’t do anything with this data, but you can use it for any purpose you’d like. If you are a bank that is receiving or sending payments on behalf of other people, for example, you might include the actual person the payment is meant for here.

    <code-example name="Add a Memo">

    ```js
    .addMemo(StellarSdk.Memo.text('Test Transaction'))
    ```

    ```java
    .addMemo(Memo.text("Test Transaction"));
    ```

    ```go
    build.MemoText{"Test Transaction"},
    ```

    </code-example>

6. Now that the transaction has all the data it needs, you have to cryptographically sign it using your secret seed. This proves that the data actually came from you and not someone impersonating you.

    <code-example name="Sign the Transaction">

    ```js
    transaction.sign(sourceKeys);
    ```

    ```java
    transaction.sign(source);
    ```

    ```go
    txe, err := tx.Sign(from)
    ```

    </code-example>

7. And finally, send it to the Stellar network!

    <code-example name="Submit the Transaction">

    ```js
    server.submitTransaction(transaction);
    ```

    ```java
    server.submitTransaction(transaction);
    ```

    ```go
    resp, err := horizon.DefaultTestNetClient.SubmitTransaction(txeB64)
    ```

    </code-example>

**IMPORTANT** It's possible that you will not receive a response from Horizon server due to a bug, network conditions, etc. In such situation it's impossible to determine the status of your transaction. That's why you should always save a built transaction (or transaction encoded in XDR format) in a variable or a database and resubmit it if you don't know it's status. If the transaction has already been successfully applied to the ledger, Horizon will simply return the saved result and not attempt to submit the transaction again. Only in cases where a transaction’s status is unknown (and thus will have a chance of being included into a ledger) will a resubmission to the network occur.

## Receive Payments

You don’t actually need to do anything to receive payments into a Stellar account—if a payer makes a successful transaction to send assets to you, those assets will automatically be added to your account.

However, you’ll want to know that someone has actually paid you. If you are a bank accepting payments on behalf of others, you need to find out what was sent to you so you can disburse funds to the intended recipient. If you are operating a retail business, you need to know that your customer actually paid you before you hand them their merchandise. And if you are an automated rental car with a Stellar account, you’ll probably want to verify that the customer in your front seat actually paid before that person can turn on your engine.

A simple program that watches the network for payments and prints each one might look like:

<code-example name="Receive Payments">

```js
var StellarSdk = require('stellar-sdk');

var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
var accountId = 'GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF';

// Create an API call to query payments involving the account.
var payments = server.payments().forAccount(accountId);

// If some payments have already been handled, start the results from the
// last seen payment. (See below in `handlePayment` where it gets saved.)
var lastToken = loadLastPagingToken();
if (lastToken) {
  payments.cursor(lastToken);
}

// `stream` will send each recorded payment, one by one, then keep the
// connection open and continue to send you new payments as they occur.
payments.stream({
  onmessage: function(payment) {
    // Record the paging token so we can start from here next time.
    savePagingToken(payment.paging_token);

    // The payments stream includes both sent and received payments. We only
    // want to process received payments here.
    if (payment.to !== accountId) {
      return;
    }

    // In Stellar’s API, Lumens are referred to as the “native” type. Other
    // asset types have more detailed information.
    var asset;
    if (payment.asset_type === 'native') {
      asset = 'lumens';
    }
    else {
      asset = payment.asset_code + ':' + payment.asset_issuer;
    }

    console.log(payment.amount + ' ' + asset + ' from ' + payment.from);
  },

  onerror: function(error) {
    console.error('Error in payment stream');
  }
});

function savePagingToken(token) {
  // In most cases, you should save this to a local database or file so that
  // you can load it next time you stream new payments.
}

function loadLastPagingToken() {
  // Get the last paging token from a local database or file
}
```

```java
Server server = new Server("https://horizon-testnet.stellar.org");
KeyPair account = KeyPair.fromAccountId("GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF");

// Create an API call to query payments involving the account.
PaymentsRequestBuilder paymentsRequest = server.payments().forAccount(account);

// If some payments have already been handled, start the results from the
// last seen payment. (See below in `handlePayment` where it gets saved.)
String lastToken = loadLastPagingToken();
if (lastToken != null) {
  paymentsRequest.cursor(lastToken);
}

// `stream` will send each recorded payment, one by one, then keep the
// connection open and continue to send you new payments as they occur.
paymentsRequest.stream(new EventListener<OperationResponse>() {
  @Override
  public void onEvent(OperationResponse payment) {
    // Record the paging token so we can start from here next time.
    savePagingToken(payment.getPagingToken());

    // The payments stream includes both sent and received payments. We only
    // want to process received payments here.
    if (payment instanceof PaymentOperationResponse) {
      if (((PaymentOperationResponse) payment).getTo().equals(account)) {
        return;
      }

      String amount = ((PaymentOperationResponse) payment).getAmount();

      Asset asset = ((PaymentOperationResponse) payment).getAsset();
      String assetName;
      if (asset.equals(new AssetTypeNative())) {
        assetName = "lumens";
      } else {
        StringBuilder assetNameBuilder = new StringBuilder();
        assetNameBuilder.append(((AssetTypeCreditAlphaNum) asset).getCode());
        assetNameBuilder.append(":");
        assetNameBuilder.append(((AssetTypeCreditAlphaNum) asset).getIssuer().getAccountId());
        assetName = assetNameBuilder.toString();
      }

      StringBuilder output = new StringBuilder();
      output.append(amount);
      output.append(" ");
      output.append(assetName);
      output.append(" from ");
      output.append(((PaymentOperationResponse) payment).getFrom().getAccountId());
      System.out.println(output.toString());
    }

  }
});
````

```go
package main

import (
	"context"
	"fmt"
	"github.com/stellar/go/clients/horizon"
)

func main() {
	const address = "GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF"
	ctx := context.Background()

	cursor := horizon.Cursor("now")

	fmt.Println("Waiting for a payment...")

	err := horizon.DefaultTestNetClient.StreamPayments(ctx, address, &cursor, func(payment horizon.Payment) {
		fmt.Println("Payment type", payment.Type)
		fmt.Println("Payment Paging Token", payment.PagingToken)
		fmt.Println("Payment From", payment.From)
		fmt.Println("Payment To", payment.To)
		fmt.Println("Payment Asset Type", payment.AssetType)
		fmt.Println("Payment Asset Code", payment.AssetCode)
		fmt.Println("Payment Asset Issuer", payment.AssetIssuer)
		fmt.Println("Payment Amount", payment.Amount)
		fmt.Println("Payment Memo Type", payment.Memo.Type)
		fmt.Println("Payment Memo", payment.Memo.Value)
	})

	if err != nil {
		panic(err)
	}

}
```

</code-example>

There are two main parts to this program. First, you create a query for payments involving a given account. Like most queries in Stellar, this could return a huge number of items, so the API returns paging tokens, which you can use later to start your query from the same point where you previously left off. In the example above, the functions to save and load paging tokens are left blank, but in a real application, you’d want to save the paging tokens to a file or database so you can pick up where you left off in case the program crashes or the user closes it.

<code-example name="Create a Payments Query">

```js
var payments = server.payments().forAccount(accountId);
var lastToken = loadLastPagingToken();
if (lastToken) {
  payments.cursor(lastToken);
}
```

```java
PaymentsRequestBuilder paymentsRequest = server.payments().forAccount(account)
String lastToken = loadLastPagingToken();
if (lastToken != null) {
  paymentsRequest.cursor(lastToken);
}
```

</code-example>

Second, the results of the query are streamed. This is the easiest way to watch for payments or other transactions. Each existing payment is sent through the stream, one by one. Once all existing payments have been sent, the stream stays open and new payments are sent as they are made.

Try it out: Run this program, and then, in another window, create and submit a payment. You should see this program log the payment.

<code-example name="Stream Payments">

```js
payments.stream({
  onmessage: function(payment) {
    // handle a payment
  }
});
```

```java
paymentsRequest.stream(new EventListener<OperationResponse>() {
  @Override
  public void onEvent(OperationResponse payment) {
    // Handle a payment
  }
});
```

</code-example>

You can also request payments in groups, or pages. Once you’ve processed each page of payments, you’ll need to request the next one until there are none left.

<code-example name="Paged Payments">

```js
payments.call().then(function handlePage(paymentsPage) {
  paymentsPage.records.forEach(function(payment) {
    // handle a payment
  });
  return paymentsPage.next().then(handlePage);
});
```

```java
Page<OperationResponse> page = payments.execute();

for (OperationResponse operation : page.getRecords()) {
	// handle a payment
}

page = page.getNextPage();
```

</code-example>


## Transacting in Other Currencies

One of the amazing things about the Stellar network is that you can send and receive many types of assets, such as US dollars, Nigerian naira, digital currencies like bitcoin, or even your own new kind of asset.

While Stellar’s native asset, the lumen, is fairly simple, all other assets can be thought of like a credit issued by a particular account. In fact, when you trade US dollars on the Stellar network, you don’t actually trade US dollars—you trade US dollars *from a particular account.* That’s why the assets in the example above had both a `code` and an `issuer`. The `issuer` is the ID of the account that created the asset. Understanding what account issued the asset is important—you need to trust that, if you want to redeem your dollars on the Stellar network for actual dollar bills, the issuer will be able to provide them to you. Because of this, you’ll usually only want to trust major financial institutions for assets that represent national currencies.

Stellar also supports payments sent as one type of asset and received as another. You can send Nigerian naira to a friend in Germany and have them receive euros. These multi-currency transactions are made possible by a built-in market mechanism where people can make offers to buy and sell different types of assets. Stellar will automatically find the best people to exchange currencies with in order to convert your naira to euros. This system is called [distributed exchange](../concepts/exchange.md).

You can read more about the details of assets in the [assets overview](../concepts/assets.md).

## What Next?

Now that you can send and receive payments using Stellar’s API, you’re on your way to writing all kinds of amazing financial software. Experiment with other parts of the API, then read up on more detailed topics:

- [Become an anchor](../anchor/)
- [Security](../security.md)
- [Federation](../concepts/federation.md)
- [Compliance](../compliance-protocol.md)

<div class="sequence-navigation">
  <a class="button button--previous" href="create-account.html">Back to Step 2: Create an Account</a>
</div>


[^1]: A list of all the possible operations can be found on the [operations page](../concepts/operations.md).

[^2]: The full details on transactions can be found on the [transactions page](../concepts/transactions.md).

[^3]: The 100 stroops is called Stellar’s **base fee**. The base fee can be changed, but a change in Stellar’s fees isn’t likely to happen more than once every several years. You can look up the current fees by [checking the details of the latest ledger](https://www.stellar.org/developers/horizon/reference/endpoints/ledgers-single.html).

[^4]: Even though most responses from the Horizon REST API use JSON, most of the data in Stellar is actually stored in a format called XDR, or External Data Representation. XDR is both more compact than JSON and stores data in a predictable way, which makes signing and verifying an XDR-encoded message easier. You can get more details on [our XDR page](https://www.stellar.org/developers/horizon/reference/xdr.html).

[^5]: In situations where you need to perform a high number of transactions in a short period of time (for example, a bank might perform transactions on behalf of many customers using one Stellar account), you can create several Stellar accounts that work simultaneously. Read more about this in [the guide to channels](../channels.md).
