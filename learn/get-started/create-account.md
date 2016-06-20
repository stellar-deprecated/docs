---
title: Create an Account
---

# Create an Account

The first thing you’ll need to do anything on Stellar is an account. Accounts hold all your money inside Stellar and allow you to send and receive payments—in fact, pretty much everything in Stellar is in some way tied to an account.

Every Stellar account has a pair of public and private keys. Stellar uses public key cryptography to ensure that every transaction is secure. The private key is a secret piece of information that proves you own the account. You should never share your private key with anyone. It’s kind of like the combination to a lock—anyone who knows the combination can open the lock. In the same way, anyone who knows your account’s secret key can control your account. The public key is how other people identify your account and verify that you authorized a transaction.
[TODO: decide on whether we're using public/private or public/secret for keypairs. This doc currently uses both private and secret.]

Because the private key must be kept secret, the first step in creating an account is creating your own keys (when you create the account, you’ll send only the public key to a Stellar server). You can do so with the following command:

<example name="Generating Keys">
```sh
# You'll need to install stellar-core for this step.
$ stellar-core --genseed
Secret seed: SAV76USXIJOBMEQXPANUOQM6F5LIOTLPDIDVRJBFFE2MDJXG24TAPUU7
Public: GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB
```

```js
// create a completely new and unique pair of keys
// see more about KeyPair objects: https://stellar.github.io/js-stellar-sdk/Keypair.html
var pair = StellarSdk.Keypair.random();

pair.seed();
// SAV76USXIJOBMEQXPANUOQM6F5LIOTLPDIDVRJBFFE2MDJXG24TAPUU7
pair.accountId();
// GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB
```

```java
// create a completely new and unique pair of keys.
// see more about KeyPair objects: https://stellar.github.io/java-stellar-sdk/org/stellar/sdk/KeyPair.html
import org.stellar.sdk.KeyPair;
KeyPair pair = KeyPair.random();

pair.getSecretSeed();
// SAV76USXIJOBMEQXPANUOQM6F5LIOTLPDIDVRJBFFE2MDJXG24TAPUU7
pair.getAccountId();
// GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB
```

```go
package main

import (
	"log"

	"github.com/stellar/go-stellar-base/keypair"
)

func main() {
	pair, err := keypair.Random()
	if err != nil {
		log.Fatal(err)
	}

	log.Println(pair.Seed())
	// SAV76USXIJOBMEQXPANUOQM6F5LIOTLPDIDVRJBFFE2MDJXG24TAPUU7
	log.Println(pair.Address())
	// GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB
}
```
</example>

[TODO: should this only show if viewing the SDK examples?]
You might notice that, in the SDK, you are asked for the *account ID* instead of the public key. That’s because an account’s ID *is* its public key.
[TODO: Explain why this is the case—the distinction here just sounds like a mistake.]

Now that you have a pair of keys, you can make an account. In order to prevent people from making a huge number of unnecessary accounts, each account must have a minimum balance of 20 lumens (lumens are the built-in currency of the Stellar network).[1] Since you don’t yet have any lumens, though, you can’t pay for an account! In the real world, you’ll usually pay an exchange that sells lumens in order to create a new account.[2] On Stellar’s test network, however, you can ask Friendbot, our friendly robot with a very fat wallet, to create an account for you.

To create a test account, send Friendbot the public key you created. It’ll create and fund a new account using that public key as its ID.

<example name="Creating a test account">
```sh
$ curl "https://horizon-testnet.stellar.org/friendbot?addr=GDGOKHIRX63EIAXKVI77BQV7LMDUH7DR4BMDDU77DJUXLPUU5HAXGN64"
```

```js
// The SDK does not have tools for creating test accounts, so you'll have to
// make your own HTTP request.
var request = require('request');
request.get({
  url: 'https://horizon-testnet.stellar.org/friendbot',
  qs: { addr: pair.accountId() },
  json: true
}, function(error, response, body) {
  if (error || response.statusCode !== 200) {
    console.error('ERROR!', error || body);
  }
  else {
    console.log('SUCCESS! You have a new account :)\n', body);
  }
});
```

```java
// The SDK does not have tools for creating test accounts, so you'll have to
// make your own HTTP request.
import java.net.*;
import java.io.*;
import java.util.*;

String friendbotUrl = String.format(
  "https://horizon-testnet.stellar.org/friendbot?addr=%s",
  pair.getAccountId());
InputStream response = new URL(friendbotUrl).openStream();
String body = new Scanner(response, "UTF-8").useDelimiter("\\A").next();
System.out.println("SUCCESS! You have a new account :)\n" + body);
```

```go
package main

import (
	"http"
	"io/ioutil"
	"log"
)

func main() {
	address := pair.Address()
	resp, err := http.Get("https://horizon-testnet.stellar.org/friendbot?addr=" + address)
	if err != nil {
		log.Fatal(err)
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(body)
}
```
</example>

Now for the last step: Getting the account’s details and checking its balance! Accounts can carry multiple balances—one for each type of currency they hold.

<example name="Getting account details">
```sh
curl "https://horizon-testnet.stellar.org/accounts/GCRDH24DCTMKRL3SESRQ4QRKHJ56XGAJBQHHXXED3RTBQTBC36RCX4JI"
```

```js
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// the JS SDK uses promises for most actions, such as retrieving an account
server.accounts().accountId(pair.accountId()).call().then(function(account) {
  console.log('Balaces for account: ' + pair.accountId());
  account.balances.forEach(function(balance) {
    console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
  });
});
```

```java
import org.stellar.sdk.Server;
import org.stellar.sdk.responses.AccountResponse;

Server server = new Server("https://horizon-testnet.stellar.org");
AccountResponse account = server.accounts().account(pair.getAccountId());
System.out.println("Balances for account " + pair.getAccountId());
for (AccountResponse.Balance balance : account.getBalances()) {
  System.out.println(String.format(
    "Type: %s, Code: %s, Balance: %s",
    balance.getAssetType(),
    balance.getAssetCode(),
    balance.getBalance()));
}
```

```go
package main

import (
	"log"

	"github.com/stellar/go-stellar-base/horizon"
)

func main() {
	account, err := horizon.DefaultTestNetClient.LoadAccount(pair.Address())
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Balances for account:", pair.Address())

	for _, balance := range account.Balances {
		log.Println(balance)
	}
}
```
</example>

Now that you’ve got an account, you can [start making and receiving payments](transactions.html).

<a class="button button--previous" href="index.html">Back</a>
<a class="button button--next" href="transactions.html">Next</a>


[1]: Other features of Stellar, like [trust lines](https://www.stellar.org/developers/learn/concepts/assets.html#trustlines), require higher minimum balances.

[2]: CoinMarketCap maintains [a list of exchanges that sell lumens at: http://coinmarketcap.com/currencies/stellar/#markets](http://coinmarketcap.com/currencies/stellar/#markets)
