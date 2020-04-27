---
title: Issuing Assets
---

One of Stellar’s most powerful features is the ability to trade any kind of asset, US dollars, Nigerian naira, bitcoins, special coupons, or just about anything you like.

This works in Stellar because an asset is really just a credit from a particular account. When you trade US dollars on the Stellar network, you don’t actually trade US dollars—you trade US dollars *credited from a particular account.* Often, that account will be a bank, but if your neighbor had a banana plant, they might issue banana assets that you could trade with other people.

Every asset type (except lumens) is defined by two properties:

- `asset_code`: a short identifier of 1–12 letters or numbers, such as `USD`, or `EUR`. It can be anything you like, even `AstroDollars`.
- `asset_issuer`: the ID of the account that issues the asset.

In the Stellar SDK, assets are represented with the `Asset` class:

<code-example name="Representing Assets">

```js
var astroDollar = new StellarSdk.Asset(
  'AstroDollar', 'GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF');
```

```java
Asset astroDollar = Asset.createNonNativeAsset("AstroDollar", "GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF");
```

```python
from stellar_sdk import Asset

astro_dollar = Asset("AstroDollar", "GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF")
```

```json
// Wherever assets are used in Horizon, they use the following JSON structure:
{
  "asset_code": "AstroDollar",
  "asset_issuer": "GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF",
  // `asset_type` is used to determine how asset data is stored.
  // It can be `native` (lumens), `credit_alphanum4`, or `credit_alphanum12`.
  "asset_type": "credit_alphanum12"
}
```

</code-example>


## Issuing a New Asset Type

To issue a new type of asset, all you need to do is choose a code. It can be any combination of up to 12 letters or numbers, but you should use the appropriate [ISO 4217 code][ISO 4217] (e.g. `USD` for US dollars)  or [ISIN] for national currencies or securities. Once you’ve chosen a code, you can begin paying people using that asset code. You don’t need to do anything to declare your asset on the network.

However, other people can’t receive your asset until they’ve chosen to trust it. Because a Stellar asset is really a credit, you should trust that the issuer can redeem that credit if necessary later on. You might not want to trust your neighbor to issue banana assets if they don’t even have a banana plant, for example.

An account can create a *trustline,* or a declaration that it trusts a particular asset, using the [change trust operation](concepts/list-of-operations.md#change-trust). A trustline can also be limited to a particular amount. If your banana-growing neighbor only has a few plants, you might not want to trust them for more than about 200 bananas. *Note: each trustline increases an account’s minimum balance by 0.5 lumens (the base reserve). For more details, see the [fees guide](concepts/fees.md#minimum-balance).*

Once you’ve chosen an asset code and someone else has created a trustline for your asset, you’re free to start making payment operations to them using your asset. If someone you want to pay doesn’t trust your asset, you might also be able to use the [distributed exchange](concepts/exchange.md).

### Try it Out

Sending and receiving custom assets is very similar to [sending and receiving lumens](get-started/transactions.md#building-a-transaction). Here’s a simple example:

<code-example name="Send Custom Assets">

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// Keys for accounts to issue and receive the new asset
var issuingKeys = StellarSdk.Keypair
  .fromSecret('SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4');
var receivingKeys = StellarSdk.Keypair
  .fromSecret('SDSAVCRE5JRAI7UFAVLE5IMIZRD6N6WOJUWKY4GFN34LOBEEUS4W2T2D');

// Create an object to represent the new asset
var astroDollar = new StellarSdk.Asset('AstroDollar', issuingKeys.publicKey());

// First, the receiving account must trust the asset
server.loadAccount(receivingKeys.publicKey())
  .then(function(receiver) {
    var transaction = new StellarSdk.TransactionBuilder(receiver, {
      fee: 100,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
      // The `changeTrust` operation creates (or alters) a trustline
      // The `limit` parameter below is optional
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: astroDollar,
        limit: '1000'
      }))
      // setTimeout is required for a transaction
      .setTimeout(100)
      .build();
    transaction.sign(receivingKeys);
    return server.submitTransaction(transaction);
  })
  .then(console.log)

  // Second, the issuing account actually sends a payment using the asset
  .then(function() {
    return server.loadAccount(issuingKeys.publicKey())
  })
  .then(function(issuer) {
    var transaction = new StellarSdk.TransactionBuilder(issuer, {
      fee: 100,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: receivingKeys.publicKey(),
        asset: astroDollar,
        amount: '10'
      }))
      // setTimeout is required for a transaction
      .setTimeout(100)
      .build();
    transaction.sign(issuingKeys);
    return server.submitTransaction(transaction);
  })
  .then(console.log)
  .catch(function(error) {
    console.error('Error!', error);
  });
```

```java
Server server = new Server("https://horizon-testnet.stellar.org");

// Keys for accounts to issue and receive the new asset
KeyPair issuingKeys = KeyPair
  .fromSecretSeed("SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4");
KeyPair receivingKeys = KeyPair
  .fromSecretSeed("SDSAVCRE5JRAI7UFAVLE5IMIZRD6N6WOJUWKY4GFN34LOBEEUS4W2T2D");

// Create an object to represent the new asset
Asset astroDollar = Asset.createNonNativeAsset("AstroDollar", issuingKeys.getAccountId());

// First, the receiving account must trust the asset
AccountResponse receiving = server.accounts().account(receivingKeys.getAccountId());
Transaction allowAstroDollars = new Transaction.Builder(receiving, Network.TESTNET)
  .addOperation(
    // The `ChangeTrust` operation creates (or alters) a trustline
    // The second parameter limits the amount the account can hold
    new ChangeTrustOperation.Builder(astroDollar, "1000").build())
  .build();
allowAstroDollars.sign(receivingKeys);
server.submitTransaction(allowAstroDollars);

// Second, the issuing account actually sends a payment using the asset
AccountResponse issuing = server.accounts().account(issuingKeys.getAccountId());
Transaction sendAstroDollars = new Transaction.Builder(issuing)
  .addOperation(
    new PaymentOperation.Builder(receivingKeys.getAccountId(), astroDollar, "10").build())
  .build();
sendAstroDollars.sign(issuingKeys);
server.submitTransaction(sendAstroDollars);
```

```go
issuerSeed := "SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4"
recipientSeed := "SDSAVCRE5JRAI7UFAVLE5IMIZRD6N6WOJUWKY4GFN34LOBEEUS4W2T2D"

// Keys for accounts to issue and receive the new asset
issuer, err := keypair.Parse(issuerSeed)
if err != nil { log.Fatal(err) }
recipient, err := keypair.Parse(recipientSeed)
if err != nil { log.Fatal(err) }

// Create an object to represent the new asset
astroDollar := build.CreditAsset("AstroDollar", issuer.Address())

// First, the receiving account must trust the asset
trustTx, err := build.Transaction(
    build.SourceAccount{recipient.Address()},
    build.AutoSequence{SequenceProvider: horizon.DefaultTestNetClient},
    build.TestNetwork,
    build.Trust(astroDollar.Code, astroDollar.Issuer, build.Limit("100.25")),
)
if err != nil { log.Fatal(err) }
trustTxe, err := trustTx.Sign(recipientSeed)
if err != nil { log.Fatal(err) }
trustTxeB64, err := trustTxe.Base64()
if err != nil { log.Fatal(err) }
_, err = horizon.DefaultTestNetClient.SubmitTransaction(trustTxeB64)
if err != nil { log.Fatal(err) }

// Second, the issuing account actually sends a payment using the asset
paymentTx, err := build.Transaction(
    build.SourceAccount{issuer.Address()},
    build.TestNetwork,
    build.AutoSequence{SequenceProvider: horizon.DefaultTestNetClient},
    build.Payment(
        build.Destination{AddressOrSeed: recipient.Address()},
        build.CreditAmount{"AstroDollar", issuer.Address(), "10"},
    ),
)
if err != nil { log.Fatal(err) }
paymentTxe, err := paymentTx.Sign(issuerSeed)
if err != nil {	log.Fatal(err) }
paymentTxeB64, err := paymentTxe.Base64()
if err != nil { log.Fatal(err) }
_, err = horizon.DefaultTestNetClient.SubmitTransaction(paymentTxeB64)
if err != nil { log.Fatal(err) }
```

```python
from stellar_sdk import Asset, Server, Keypair, TransactionBuilder, Network

server = Server("https://horizon-testnet.stellar.org")

# Keys for accounts to issue and receive the new asset
issuing_key = Keypair.from_secret("SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4")
receiving_key = Keypair.from_secret("SDSAVCRE5JRAI7UFAVLE5IMIZRD6N6WOJUWKY4GFN34LOBEEUS4W2T2D")

# Create an object to represent the new asset
astro_dollar = Asset("AstroDollar", issuing_key.public_key)

# First, the receiving account must trust the asset
receiving_account = server.load_account(receiving_key.public_key)
trust_transaction = (
    TransactionBuilder(
        source_account=receiving_account,
        network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
        base_fee=100,
    )
    # The `change_trust` operation creates (or alters) a trustline
    # The `limit` parameter below is optional
    .append_change_trust_op(
        asset_code=astro_dollar.code, asset_issuer=astro_dollar.issuer, limit="1000"
    )
    .set_timeout(100)
    .build()
)

trust_transaction.sign(receiving_key)
trust_resp = server.submit_transaction(trust_transaction)
print(trust_resp)

# Second, the issuing account actually sends a payment using the asset
issuing_account = server.load_account(issuing_key.public_key)
payment_transaction = (
    TransactionBuilder(
        source_account=issuing_account,
        network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
        base_fee=100,
    )
    .append_payment_op(
        asset_code=astro_dollar.code,
        asset_issuer=astro_dollar.issuer,
        destination=receiving_key.public_key,
        amount="10",
    )
    .set_timeout(100)
    .build()
)

payment_transaction.sign(issuing_key)
payment_resp = server.submit_transaction(payment_transaction)
print(payment_resp)
```

</code-example>

## Discoverablity and Meta information

Another thing that is important when you issue an asset is to provide clear information about what your asset represents. This info can be discovered and displayed by clients so users know exactly what they are getting when they hold your asset. 
To do this you must do two simple things. First, add a section in your [stellar.toml file](concepts/stellar-toml.html) that contains the necessary meta fields:
```
# stellar.toml example asset
[[CURRENCIES]]
code="GOAT"
issuer="GD5T6IPRNCKFOHQWT264YPKOZAWUMMZOLZBJ6BNQMUGPWGRLBK3U7ZNP"
display_decimals=2 
name="goat share"
desc="1 GOAT token entitles you to a share of revenue from Elkins Goat Farm."
conditions="There will only ever be 10,000 GOAT tokens in existence. We will distribute the revenue share annually on Jan. 15th"
image="https://pbs.twimg.com/profile_images/666921221410439168/iriHah4f.jpg"
```

Second, use the [set options operation](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#set-options) to set the `home_domain` of your issuing account to the domain where the above stellar.toml file is hosted. The following code sets the home domain:

<code-example name="Set Home Domain">

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// Keys for issuing account
var issuingKeys = StellarSdk.Keypair
  .fromSecret('SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4');

server.loadAccount(issuingKeys.publicKey())
  .then(function(issuer) {
    var transaction = new StellarSdk.TransactionBuilder(issuer, {
      fee: 100,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
      .addOperation(StellarSdk.Operation.setOptions({
        homeDomain: 'yourdomain.com',
      }))
      // setTimeout is required for a transaction
      .setTimeout(100)
      .build();
    transaction.sign(issuingKeys);
    return server.submitTransaction(transaction);
  })
  .then(console.log)
  .catch(function(error) {
    console.error('Error!', error);
  });
```

```java
Server server = new Server("https://horizon-testnet.stellar.org");

// Keys for issuing account
KeyPair issuingKeys = KeyPair
  .fromSecretSeed("SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4");
AccountResponse sourceAccount = server.accounts().account(issuingKeys.getAccountId());

Transaction setHomeDomain = new Transaction.Builder(sourceAccount, Network.TESTNET)
  .addOperation(new SetOptionsOperation.Builder()
  .setHomeDomain("yourdomain.com")
  .build();
setHomeDomain.sign(issuingKeys);
server.submitTransaction(setHomeDomain);

```

```python
from stellar_sdk import Server, Keypair, TransactionBuilder, Network, Flag

server = Server("https://horizon-testnet.stellar.org")

# Key for issuing account
issuing_key = Keypair.from_secret("SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4")
issuing_account = server.load_account(issuing_key.public_key)

transaction = (
    TransactionBuilder(
        source_account=issuing_account,
        network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
        base_fee=100,
    )
    .append_set_options_op(
        home_domain="yourdomain.com"
    )
    .set_timeout(100)
    .build()
)

transaction.sign(issuing_key)
resp = server.submit_transaction(transaction)
print(resp)
```

</code-example>


## Requiring or Revoking Authorization

Accounts have [several flags](concepts/accounts.md#flags) related to issuing assets.

If you’d like to control who can be paid with your asset, or if your asset has some special purpose
requiring sign-off from you, use the
[`AUTHORIZATION REQUIRED` flag](concepts/assets.md#controlling-asset-holders), which requires that
the issuing account also approves a trustline before the receiving account is allowed to be paid
with the asset.

[`AUTHORIZATION REVOCABLE` flag](concepts/assets.md#controlling-asset-holders) allows you to freeze
assets you issued in case of theft or other special circumstances. This can be useful for national
currencies, but is not always applicable to other kinds of assets.

For most cases, you should avoid setting `AUTHORIZATION REVOCABLE` on your asset. In the past, some
issuers have used the `AUTHORIZATION REVOCABLE` flag in order to impose lock-up periods. However,
this is a problematic mechanism because it does not provide the user any guarantees with regard to
when or if the assets will be unlocked.

More importantly though, _it requires a lot of effort to undo once it has been set_. This is
because if `AUTHORIZATION REVOCABLE` or `AUTHORIZATION REQUIRED` is disabled on an asset, it has
no effect on existing user accounts. In order to be able to send your asset to existing accounts
after these flags have been turned off, you will still need to run the
[`Allow Trust`](concepts/list-of-operations.md#allow-trust) operation for each existing user account.
This requires creating a transaction with the following operations for _every_ existing user
account:

1. [`Set Options`](concepts/list-of-operations.md#set-options) to set the flags on the issuing
   account to `0x1` to enable `AUTHORIZATION REQUIRED`. This is necessary because you cannot run
   the [`Allow Trust`](concepts/list-of-operations.md#allow-trust) operation without `AUTHORIZATION
   REQUIRED` being set on your issuing account.
2. [`Allow Trust`](concepts/list-of-operations.md#allow-trust) on the existing user's account in
   order to authorize it. **Note:** You can actually place as many as `MAX OPERATIONS PER
   TRANSACTION - 2` (currently the [maximum is 100](concepts/transactions.md#list-of-operations))
   `Allow Trust` operations for different accounts to minimize the number of transactions submitted
   to the network.
3. [`Set Options`](concepts/list-of-operations.md#set-options) to set the flags on the issuing
   account to `0x0` to disable `AUTHORIZATION REQUIRED`.

**These transactions are necessary** as you don't want to affect accounts that have been created
after you initially disabled authorization on your account - otherwise, they would also need to go
through this process.

The following example sets authorization to be both required and revocable:

<code-example name="Asset Authorization">

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// Keys for issuing account
var issuingKeys = StellarSdk.Keypair.fromSecret('SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4');

server
  .loadAccount(issuingKeys.publicKey())
  .then(function(issuer) {
    var transaction = new StellarSdk.TransactionBuilder(issuer, {
      fee: 100,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
      .addOperation(
        StellarSdk.Operation.setOptions({
          setFlags: StellarSdk.AuthRevocableFlag | StellarSdk.AuthRequiredFlag
        })
      )
      // setTimeout is required for a transaction
      .setTimeout(100)
      .build()
    transaction.sign(issuingKeys);
    return server.submitTransaction(transaction);
  })
  .then(console.log)
  .catch(function(error) {
    console.error('Error!', error);
  })
```

```java
import org.stellar.sdk.AccountFlag;

Server server = new Server("https://horizon-testnet.stellar.org");

// Keys for issuing account
KeyPair issuingKeys = KeyPair
  .fromSecretSeed("SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4");
AccountResponse sourceAccount = server.accounts().account(issuingKeys.getAccountId());

Transaction setAuthorization = new Transaction.Builder(sourceAccount, Network.TESTNET)
  .addOperation(new SetOptionsOperation.Builder()
    .setSetFlags(
      AccountFlag.AUTH_REQUIRED_FLAG.getValue() |
      AccountFlag.AUTH_REVOCABLE_FLAG.getValue())
    .build())
  .build();
setAuthorization.sign(issuingKeys);
server.submitTransaction(setAuthorization);
```

```python
from stellar_sdk import Server, Keypair, TransactionBuilder, Network, Flag

server = Server("https://horizon-testnet.stellar.org")
issuing_key = Keypair.from_secret("SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4")

issuing_account = server.load_account(issuing_key.public_key)
transaction = (
    TransactionBuilder(
        source_account=issuing_account,
        network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
        base_fee=100,
    )
    .append_set_options_op(
        set_flags=Flag.AUTHORIZATION_REQUIRED | Flag.AUTHORIZATION_REVOCABLE
    )
    .set_timeout(100)
    .build()
)

transaction.sign(issuing_key)
resp = server.submit_transaction(transaction)
print(resp)
```

</code-example>

## Redeeming Assets

When a user would like to redeem their asset off of the Stellar Network (such as receiving cold,
hard cash for an asset representing a physical currency), the process takes places in two
steps:

1. On the Stellar Network, the holder of the asset (i.e. the account with the trustline for the
   asset) sends funds back to the issuing account via a [Payment
   operation](./concepts/list-of-operations.md#payment).
2. Outside of the network, the Asset issuer provides liquidity, such as handing over cash at a
   cashier or ATM.

It's of note that when tokens are sent back to the issuing (original source) account, they are
removed from the global supply of tokens. As an asset issuer you may not want this behavior, and
you can instead establish a distribution account which establishes the first trustline with the
issuing account. This has the benefit of also setting an initial monetary supply for your asset,
and doesn't cause your asset's monetary supply to grow or shrink each time that payments are sent
from or to the issuing account, respectively.

Regardless of which strategy you use for managing your token's supply, as an asset issuer it is
very important to make it clear to asset holders to send the asset back to a specified account of
yours, and to provide information on how and when you will provide liquidity upon redemption.

## Best Practices

Once you begin issuing your own assets, there are a few smart practices you can follow for better
security and easier management.


### Submit All Operations as a Single Transaction

All operations on the Stellar network (create account, set options, payment, etc.) should be
submitted as part of a single Stellar transaction. Transactions in Stellar are atomic, which means
that all operations succeed, or they all fail together. This ensures that token distribution will
not get stuck in a middle state, e.g. where an account has been created but has not been funded.


### Specialized Issuing Accounts

In the simplest situations, you can issue assets from your everyday Stellar account. However, if you operate a financial institution or a business, you should keep a separate account specifically for issuing assets. Why?

- Easier tracking: because an asset represents a credit, it disappears when it is sent back to the account that issued it. To better track and control the amount of your asset in circulation, pay a fixed amount of the asset from the issuing account to the working account that you use for normal transactions.

  The issuing account can issue the asset when more of the underlying value (like actual bananas or dollar bills) is on hand and the accounts involved in public transactions never have to worry about how much is available outside Stellar.

- Keeping trust simple: as your usage of Stellar grows, you might consider having multiple accounts for a variety of reasons, such as making transactions at high rates. Keeping a canonical issuing account makes it easier for others to know which account to trust.


### Check Trust Before Paying

Because every transaction comes with a small fee, you might want to check to ensure an account has a trustline and can receive your asset before sending a payment. If an account has a trustline, it will be listed in the accounts `balances` (even if the balance is `0`).

<code-example name="Checking Trust">

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

var astroDollarCode = 'AstroDollar';
var astroDollarIssuer =
  'GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF';

var accountId = 'GA2C5RFPE6GCKMY3US5PAB6UZLKIGSPIUKSLRB6Q723BM2OARMDUYEJ5';
server.loadAccount(accountId).then(function(account) {
  var trusted = account.balances.some(function(balance) {
    return balance.asset_code === astroDollarCode &&
           balance.asset_issuer === astroDollarIssuer;
  });

  console.log(trusted ? 'Trusted :)' : 'Not trusted :(');
});
```

```java
Asset astroDollar = Asset.createNonNativeAsset(
  "AstroDollar", "GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF"
);

// Load the account you want to check
AccountResponse accountToCheck = server.accounts().account("GA2C5RFPE6GCKMY3US5PAB6UZLKIGSPIUKSLRB6Q723BM2OARMDUYEJ5");

// See if any balances are for the asset code and issuer we're looking for
boolean trusted = false;
for (AccountResponse.Balance balance : accountToCheck.getBalances()) {
  if (balance.getAsset().equals(astroDollar)) {
    trusted = true;
    break;
  }
}

System.out.println(trusted ? "Trusted :)" : "Not trusted :(");
```

```python
from stellar_sdk import Server

server = Server("https://horizon-testnet.stellar.org")

astro_dollar_code = "AstroDollar"
astro_dollar_issuer = "GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF"

account_id = "GA2C5RFPE6GCKMY3US5PAB6UZLKIGSPIUKSLRB6Q723BM2OARMDUYEJ5"
resp = server.accounts().account_id(account_id).call()

trusted = False
for balance in resp["balances"]:
    if balance.get("asset_code") == astro_dollar_code and balance.get("asset_issuer") == astro_dollar_issuer:
        trusted = True
print("Trusted :)" if trusted else "Not trusted :(")
```

</code-example>


## Provide Liquidity for your Asset

When someone tries to buy or sell your asset on the decentralized exchange there needs to be a counterparty with whom they can trade. In other words, there needs to be enough [liquidity][liquidity] for your asset.

This can be solved by using a [liquidity provider][market-maker]. This can be someone who is contracted to provide this service for a fee, or as the asset issuer, you can provide this liquidity by using a [market making bot][kelp].


## More About Assets

Now that you have a basic understanding of custom assets, get familiar with the technical details in our [assets concept document](concepts/assets.md).


[ISO 4217]: https://en.wikipedia.org/wiki/ISO_4217
[ISIN]: https://en.wikipedia.org/wiki/International_Securities_Identification_Number
[liquidity]: https://en.wikipedia.org/wiki/Market_liquidity
[market-maker]: https://en.wikipedia.org/wiki/Market_maker
[kelp]: https://github.com/lightyeario/kelp
