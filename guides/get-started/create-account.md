---
title: Create an Account
---

The first thing you’ll need to do anything on the Stellar network is an account. Accounts hold all your money inside Stellar and allow you to send and receive payments—in fact, pretty much everything in Stellar is in some way tied to an account.

Every Stellar account has a **public key** and a **secret seed**. Stellar uses public key cryptography to ensure that every transaction is secure. The public key is always safe to share—other people need it to identify your account and verify that you authorized a transaction. The seed, however, is private information that proves you own your account. You should never share the seed with anyone. It’s kind of like the combination to a lock—anyone who knows the combination can open the lock. In the same way, anyone who knows your account’s seed can control your account.

If you’re familiar with public key cryptography, you might be wondering how the seed differs from a private key. The seed is actually the single secret piece of data that is used to generate both the public and private key for your account. Stellar’s tools use the seed instead of the private key for convenience: To have full access to an account, you only need to provide a seed instead of both a public key and a private key.[^1]

Because the seed must be kept secret, the first step in creating an account is creating your own seed and key—when you finally create the account, you’ll send only the public key to a Stellar server. You can generate the seed and key with the following command:

<code-example name="Generating Keys">

```js
// create a completely new and unique pair of keys
// see more about KeyPair objects: https://stellar.github.io/js-stellar-sdk/Keypair.html
var pair = StellarSdk.Keypair.random();

pair.secret();
// SAV76USXIJOBMEQXPANUOQM6F5LIOTLPDIDVRJBFFE2MDJXG24TAPUU7
pair.publicKey();
// GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB
```

```java
// create a completely new and unique pair of keys.
// see more about KeyPair objects: https://stellar.github.io/java-stellar-sdk/org/stellar/sdk/KeyPair.html
import org.stellar.sdk.KeyPair;
KeyPair pair = KeyPair.random();

System.out.println(new String(pair.getSecretSeed()));
// SAV76USXIJOBMEQXPANUOQM6F5LIOTLPDIDVRJBFFE2MDJXG24TAPUU7
System.out.println(pair.getAccountId());
// GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB
```

```go
package main

import (
	"log"

	"github.com/stellar/go/keypair"
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

</code-example>

Now that you have a seed and public key, you can create an account. In order to prevent people from making a huge number of unnecessary accounts, each account must have a minimum balance of 1 lumen (lumens are the built-in currency of the Stellar network).[^2] Since you don’t yet have any lumens, though, you can’t pay for an account. In the real world, you’ll usually pay an exchange that sells lumens in order to create a new account.[^3] On Stellar’s test network, however, you can ask Friendbot, our friendly robot with a very fat wallet, to create an account for you.

To create a test account, send Friendbot the public key you created. It’ll create and fund a new account using that public key as the account ID.

<code-example name="Creating a test account">

```js
// The SDK does not have tools for creating test accounts, so you'll have to
// make your own HTTP request.
var request = require('request');
request.get({
  url: 'https://friendbot.stellar.org',
  qs: { addr: pair.publicKey() },
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
  "https://friendbot.stellar.org/?addr=%s",
  pair.getAccountId());
InputStream response = new URL(friendbotUrl).openStream();
String body = new Scanner(response, "UTF-8").useDelimiter("\\A").next();
System.out.println("SUCCESS! You have a new account :)\n" + body);
```

```go
package main

import (
	"net/http"
	"io/ioutil"
	"log"
	"fmt"
)

func main() {
	// pair is the pair that was generated from previous example, or create a pair based on 
	// existing keys.
	address := pair.Address()
	resp, err := http.Get("https://friendbot.stellar.org/?addr=" + address)
	if err != nil {
		log.Fatal(err)
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(body))
}
```

</code-example>

Now for the last step: Getting the account’s details and checking its balance. Accounts can carry multiple balances—one for each type of currency they hold.

<code-example name="Getting account details">

```js
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// the JS SDK uses promises for most actions, such as retrieving an account
server.loadAccount(pair.publicKey()).then(function(account) {
  console.log('Balances for account: ' + pair.publicKey());
  account.balances.forEach(function(balance) {
    console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
  });
});
```

```java
import org.stellar.sdk.Server;
import org.stellar.sdk.responses.AccountResponse;

Server server = new Server("https://horizon-testnet.stellar.org");
AccountResponse account = server.accounts().account(pair);
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
	"fmt"
	"log"

	"github.com/stellar/go/clients/horizon"
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

</code-example>

Now that you’ve got an account, you can [start sending and receiving payments](transactions.md).

<div class="sequence-navigation">
  <a class="button button--previous" href="index.html">Back: Stellar Network Overview</a>
  <a class="button button--next" href="transactions.html">Next: Send and Receive Money</a>
</div>


[^1]: A private key is still used to encrypt data and sign transactions. When you create a `KeyPair` object using a seed, the private key is immediately generated and stored internally.

[^2]: Other features of Stellar, like [trust lines](../concepts/assets.md#trustlines), require higher minimum balances. For more on minimum balances, see [fees](../concepts/fees.md#minimum-account-balance)

[^3]: CoinMarketCap maintains a list of exchanges that sell lumens at http://coinmarketcap.com/currencies/stellar/#markets
