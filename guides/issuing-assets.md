---
title: Issuing Assets
---

One of Stellar’s most powerful features is the ability to trade any kind of asset, US dollars, Nigerian naira, bitcoins, special coupons, [ICO tokens](https://www.stellar.org/blog/tokens-on-stellar/) or just about anything you like.

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
KeyPair issuer = StellarSdk.Keypair.fromAccountId(
  "GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF");
Asset astroDollar = Asset.createNonNativeAsset("AstroDollar", issuer);
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

An account can create a *trustline,* or a declaration that it trusts a particular asset, using the [change trust operation](concepts/list-of-operations.md#change-trust). A trustline can also be limited to a particular amount. If your banana-growing neighbor only has a few plants, you might not want to trust them for more than about 200 bananas. *Note: each trustline increases an account’s minimum balance by 0.5 lumens (the base reserve). For more details, see the [fees guide](concepts/fees.html#minimum-balance).*

Once you’ve chosen an asset code and someone else has created a trustline for your asset, you’re free to start making payment operations to them using your asset. If someone you want to pay doesn’t trust your asset, you might also be able to use the [distributed exchange](concepts/exchange.md).

### Try it Out

Sending and receiving custom assets is very similar to [sending and receiving lumens](get-started/transactions.md#building-a-transaction). Here’s a simple example:

<code-example name="Send Custom Assets">

```js
var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
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
    var transaction = new StellarSdk.TransactionBuilder(receiver)
      // The `changeTrust` operation creates (or alters) a trustline
      // The `limit` parameter below is optional
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: astroDollar,
        limit: '1000'
      }))
      .build();
    transaction.sign(receivingKeys);
    return server.submitTransaction(transaction);
  })

  // Second, the issuing account actually sends a payment using the asset
  .then(function() {
    return server.loadAccount(issuingKeys.publicKey())
  })
  .then(function(issuer) {
    var transaction = new StellarSdk.TransactionBuilder(issuer)
      .addOperation(StellarSdk.Operation.payment({
        destination: receivingKeys.publicKey(),
        asset: astroDollar,
        amount: '10'
      }))
      .build();
    transaction.sign(issuingKeys);
    return server.submitTransaction(transaction);
  })
  .catch(function(error) {
    console.error('Error!', error);
  });
```

```java
Network.useTestNetwork();
Server server = new Server("https://horizon-testnet.stellar.org");

// Keys for accounts to issue and receive the new asset
KeyPair issuingKeys = KeyPair
  .fromSecretSeed("SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4");
KeyPair receivingKeys = KeyPair
  .fromSecretSeed("SDSAVCRE5JRAI7UFAVLE5IMIZRD6N6WOJUWKY4GFN34LOBEEUS4W2T2D");

// Create an object to represent the new asset
Asset astroDollar = Asset.createNonNativeAsset("AstroDollar", issuingKeys);

// First, the receiving account must trust the asset
AccountResponse receiving = server.accounts().account(receivingKeys);
Transaction allowAstroDollars = new Transaction.Builder(receiving)
  .addOperation(
    // The `ChangeTrust` operation creates (or alters) a trustline
    // The second parameter limits the amount the account can hold
    new ChangeTrustOperation.Builder(astroDollar, "1000").build())
  .build();
allowAstroDollars.sign(receivingKeys);
server.submitTransaction(allowAstroDollars);

// Second, the issuing account actually sends a payment using the asset
AccountResponse issuing = server.accounts().account(issuingKeys);
Transaction sendAstroDollars = new Transaction.Builder(issuing)
  .addOperation(
    new PaymentOperation.Builder(receivingKeys, astroDollar, "10").build())
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
StellarSdk.Network.useTestNetwork();
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// Keys for issuing account
var issuingKeys = StellarSdk.Keypair
  .fromSecret('SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4');

server.loadAccount(issuingKeys.publicKey())
  .then(function(issuer) {
    var transaction = new StellarSdk.TransactionBuilder(issuer)
      .addOperation(StellarSdk.Operation.setOptions({
        homeDomain: 'yourdomain.com',
      }))
      .build();
    transaction.sign(issuingKeys);
    return server.submitTransaction(transaction);
  })
  .catch(function(error) {
    console.error('Error!', error);
  });
```

```java
Network.useTestNetwork();
Server server = new Server("https://horizon-testnet.stellar.org");

// Keys for issuing account
KeyPair issuingKeys = KeyPair
  .fromSecretSeed("SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4");
AccountResponse sourceAccount = server.accounts().account(issuingKeys);

Transaction setHomeDomain = new Transaction.Builder(sourceAccount)
  .addOperation(new SetOptionsOperation.Builder()
    .setHomeDomain("yourdomain.com").build()
  .build();
setAuthorization.sign(issuingKeys);
server.submitTransaction(setHomeDomain);

```

</code-example>

## Best Practices

Once you begin issuing your own assets, there are a few smart practices you can follow for better security and easier management.

### Specialized Issuing Accounts

In the simplest situations, you can issue assets from your everyday Stellar account. However, if you operate a financial institution or a business, you should keep a separate account specifically for issuing assets. Why?

- Easier tracking: because an asset represents a credit, it disappears when it is sent back to the account that issued it. To better track and control the amount of your asset in circulation, pay a fixed amount of the asset from the issuing account to the working account that you use for normal transactions.

  The issuing account can issue the asset when more of the underlying value (like actual bananas or dollar bills) is on hand and the accounts involved in public transactions never have to worry about how much is available outside Stellar.

- Keeping trust simple: as your usage of Stellar grows, you might consider having multiple accounts for a variety of reasons, such as making transactions at high rates. Keeping a canonical issuing account makes it easier for others to know which account to trust.


### Requiring or Revoking Authorization

Accounts have [several flags](concepts/accounts.md#flags) related to issuing assets. Setting the [`AUTHORIZATION REVOCABLE` flag](concepts/assets.md#revoking-access) allows you to freeze assets you issued in case of theft or other special circumstances. This can be useful for national currencies, but is not always applicable to other kinds of assets.

If your asset is special purpose or you’d like to control who can be paid with it, use the [`AUTHORIZATION REQUIRED` flag](concepts/assets.md#controlling-asset-holders), which requires that the issuing account also approves a trustline before the receiving account is allowed to be paid with the asset.

The following example sets authorization to be both required and revocable:

<code-example name="Asset Authorization">

```js
StellarSdk.Network.useTestNetwork();
var flags = StellarSdk.xdr.AccountFlags;
var transaction = new StellarSdk.TransactionBuilder(issuingAccount)
  .addOperation(StellarSdk.Operation.setOptions({
    setFlags: StellarSdk.AuthRevocableFlag | StellarSdk.AuthRequiredFlag
  }))
  .build();
transaction.sign(issuingKeys);
server.submitTransaction(transaction);
```

```java
import org.stellar.sdk.AccountFlag;

Network.useTestNetwork();
Server server = new Server("https://horizon-testnet.stellar.org");

// Keys for issuing account
KeyPair issuingKeys = KeyPair
  .fromSecretSeed("SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4");
AccountResponse sourceAccount = server.accounts().account(issuingKeys);

Transaction setAuthorization = new Transaction.Builder(sourceAccount)
  .addOperation(new SetOptionsOperation.Builder()
    .setSetFlags(
      AccountFlag.AUTH_REQUIRED_FLAG.getValue() |
      AccountFlag.AUTH_REVOCABLE_FLAG.getValue())
    .build())
  .build();
setAuthorization.sign(issuingKeys);
server.submitTransaction(setAuthorization);
```

</code-example>


### Check Trust Before Paying

Because every transaction comes with a small fee, you might want to check to ensure an account has a trustline and can receive your asset before sending a payment. If an account has a trustline, it will be listed in the accounts `balances` (even if the balance is `0`).

<code-example name="Checking Trust">

```js
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
  "AstroDollar",
  KeyPair.fromAccountId(
    "GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF"));

// Load the account you want to check
KeyPair keysToCheck = KeyPair.fromAccountId(
  "GA2C5RFPE6GCKMY3US5PAB6UZLKIGSPIUKSLRB6Q723BM2OARMDUYEJ5");
AccountResponse accountToCheck = server.accounts().account(keysToCheck);

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

</code-example>


## More About Assets

Now that you have a basic understanding of custom assets, get familiar with the technical details in our [assets concept document](concepts/assets.md).


[ISO 4217]: https://en.wikipedia.org/wiki/ISO_4217
[ISIN]: https://en.wikipedia.org/wiki/International_Securities_Identification_Number
