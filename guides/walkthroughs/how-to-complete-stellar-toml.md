---
title: How and Why to Complete Your Stellar.toml
---

>*If you are interested in issuing a token on the Stellar network, but haven't yet, start by
consulting our [step-by-step instructions for custom asset creation](./custom-assets.md).*

Hello! We made this short guide to help you, an asset issuer, put your token in the best possible
place to succeed on Stellar.

Mostly, we want to make sure you know how to **provide information to the network** about yourself
and your asset, so that potential buyers and apps, like exchanges and wallets, will trust your
asset. You provide this necessary information by completing your `stellar.toml` file.

The best asset on Stellar already follow the guidelines below, and *apps and buyers will expect
your token to do the same*.

## Why you should complete your stellar.toml file

The most successful asset issuers give exchanges and potential buyers lots of information about
themselves in order to establish trust. On Stellar, they do this in the `stellar.toml` file. More
information in your asset's stellar.toml will mean:

* Your asset is listed on *more* exchanges
* Your asset holders are *more* confident in you and the assets you issue.
* Your project will most likely be *more* successful!

For example, [StellarX](http://stellarx.com/), uses the stellar.toml file to
decide how your asset is presented to traders in its markets view. If you don't provide enough
information, your asset may be hidden from many traders.  Other Stellar exchanges like
[Stellarport](https://stellarport.io/home) and [StellarTerm](https://stellarterm.com/) make similar
decisions.

If you are a validator, the stellar.toml file allows you to declare your node(s) to other network
participants, which improves discoverability, and contributes to the health and decentralization of
the network as a whole.

*Many exchanges and wallets will not list your asset without a robust stellar.toml.*

## What is your stellar.toml?

The `stellar.toml` file is used to provide a common place where the Internet can find information
about your organization’s Stellar integration. By setting the homedomain of your Stellar account to
the domain that hosts your `stellar.toml`, you can create a definitive link between this information
and that account. Any website can publish Stellar network information, and the `stellar.toml` is
designed to be readable by both humans and machines.

Your `stellar.toml` file is written in [TOML](https://github.com/toml-lang/toml), a
simple and widely used configuration file format, and ultimately published at
`https://YOUR_DOMAIN/.well-known/stellar.toml`.

Anyone can look it up, and it *proves* that the owner of the HTTPS domain hosting the stellar.toml
claims *responsibility* for the accounts and assets listed in it. It's where you can
legitimize your assets, and announce vital information about your organization.

You can find the complete specification for your `stellar.toml` file in [SEP-0001][sep-0001].
However, we'll discuss how to best complete your `stellar.toml` file for usage throughout the
Stellar ecosystem below.

## How to complete your stellar.toml

[SEP-0001][sep-0001] specifies five sections you can add to your stellar.toml:

* Account Information
* Issuer Documentation
* Point of Contact Documentation
* Currency Documentation
* Validator Information

Within those sections, some fields only apply to specialized assets, but the majority apply to *all*
organizations and their assets. These guidelines will outline which fields are:

* **Required**: All asset issuers *must* include this information in their stellar.toml if they
  want to be listed on the majority of exchanges and wallets.
* **Suggested**: Any asset issuer who wants their offering to stand out should complete these
  fields.

### Account Information

There is one field in the Account Information section required for *all* token issuers:

* `ACCOUNTS`: A list of **public keys** for all the Stellar accounts associated with your asset.

Listing your public keys lets users confirm that you, in fact, own them. For example, when
https://google.com hosts a stellar.toml file, users can be sure that *only* the accounts listed on
it belong to Google. If someone then says, "You need to pay your Google bill this month, send
payment to address GIAMGOOGLEIPROMISE", but that key is not listed on Google's stellar.toml, then
users know to not trust it.

Several other fields are useful for compliance with other [SEPs][seps] — for more information, see
[our guide on connecting your asset to wallets](connect-to-wallets.md).

Here's an example of a completed `ACCOUNTS` field listing three public keys:

```toml
ACCOUNTS=[
"GAOO3LWBC4XF6VWRP5ESJ6IBHAISVJMSBTALHOQM2EZG7Q477UWA6L7U",
"GAENZLGHJGJRCMX5VCHOLHQXU3EMCU5XWDNU4BGGJFNLI2EL354IVBK7",
"GB6REF5GOGGSEHZ3L2YK6K4T4KX3YDMWHDCPMV7MZJDLHBDNZXEPRBGM"
]
```

### Issuer Documentation

Basic information about your organization goes into a TOML **table** called `[DOCUMENTATION]`.
Issuer Documentation is your chance to inform exchanges and buyers about your business, and to
demonstrate that your business is legitimate and trustworthy.

#### Required
* The legal name of your organization (`ORG_NAME`), and if your business has one, its official dba
  (`ORG_DBA`).
* The HTTPS URL of your organization's official website (`ORG_URL`).  In order to prove the website
  is yours, *you must host your stellar.toml on the same domain you list here.*  That way,
  exchanges and buyers can view the SSL certificate on your website, and feel reasonably confident
  that you are who you say you are.
* A URL to a company logo (`ORG_LOGO`), which will show up next to your organization on exchanges.
  This image should be a square aspect ratio transparent PNG, ideally of size 128x128.
  If you fail to provide a logo, the icon next to your organization will appear blank on many
  exchanges.
* The physical address of your organization (`ORG_PHYSICAL_ADDRESS`). We understand you might want
  to keep your work address private. At the very least, you should put the *city* and *country* in
  which you operate. A street address is ideal and provides a higher level of trust and
  transparency to your potential asset holders. You can also link to the attestation of your
  physical address via the `ORG_PHYSICAL_ADDRESS_ATTESTATION` field.
* Your organization's official phone number (`ORG_PHONE_NUMBER`) in [E.164
  format](https://en.wikipedia.org/wiki/E.164). See also [this guide][twilio-guide].
* The best contact email address for you organization (`ORG_OFFICIAL_EMAIL`). This should be hosted
  at the same domain as your official website.

Issuers that list verified information including phone/address attestations and Keybase
verifications will be prioritized by Stellar clients.

#### Suggested

* Your organization's official Github account (`ORG_GITHUB`).
* Your organization's official Keybase account (`ORG_KEYBASE`). Your Keybase account should contain
  proof of ownership of any public online accounts you list here, including your organization's
  domain.
* Your organization's official Twitter handle (`ORG_TWITTER`).
* A description of your organization (`ORG_DESCRIPTION`). This is fairly open-ended, and you can
  write as much as you want. It's a great place to distinguish yourself by describing what it is
  that you do.

Exchanges might desire additional verifiable information when deciding how to present your token to
traders and asset holders, and prioritize tokens that include it:

* Attestation of the physical address listed above (`ORG_PHYSICAL_ADDRESS_ATTESTATION`). This is a
  URL to an image on your organization's domain of an official third party document (such as a
  utility bill) that shows your organization's name and address.
* Attestation of the phone number listed above (`ORG_PHONE_NUMBER_ATTESTATION`). This is a URL to
  an image on your domain showing a phone bill listing both your phone number and your
  organization's name.

Here's an example of completed Issuer Documentation:

```toml
VERSION="2.0.0"

[DOCUMENTATION]
ORG_NAME="Organization Name"
ORG_DBA="Organization DBA"
ORG_URL="https://www.domain.com"
ORG_LOGO="https://www.domain.com/awesomelogo.jpg"
ORG_DESCRIPTION="Description of issuer"
ORG_PHYSICAL_ADDRESS="123 Sesame Street, New York, NY 12345, United States"
ORG_PHYSICAL_ADDRESS_ATTESTATION="https://www.domain.com/address_attestation.jpg"
ORG_PHONE_NUMBER="1 (123)-456-7890"
ORG_PHONE_NUMBER_ATTESTATION="https://www.domain.com/phone_attestation.jpg"
ORG_KEYBASE="accountname"
ORG_TWITTER="orgtweet"
ORG_GITHUB="orgcode"
ORG_OFFICIAL_EMAIL="support@domain.com"
```

### Point of Contact Documentation

Information about the primary point(s) of contact for your organization goes into a TOML [array of
tables](https://github.com/toml-lang/toml#array-of-tables) called `[[PRINCIPALS]]`.  You need to
put contact information for *at least one person* at your organization.  If you don't, exchanges
can't verify your offering, and it is unlikely that buyers will be interested. Multiple principals
can be added with additional `[[PRINCIPALS]]` entries.

#### Required

* The name of the primary contact (`name`).
* The primary contact's official email address (`email`). This should be hosted at the same domain
  as your organization's official website.

#### Suggested

* The personal Github account of the point of contact (`github`).
* The personal Twitter handle of the point of contact (`twitter`).
* The personal Keybase account for the point of contact (`keybase`). This account should contain
  proof of ownership of any public online accounts listed here and may contain proof of ownership
  of your organization's domain.

Again, the more information you provide, the better. Exchanges might desire additional verifiable
information when deciding how to present your token to traders, and prioritize tokens that include
it:

* A SHA-256 hash of a photo of the point of contact's government-issued photo ID (`id_photo_hash`).
* A SHA-256 hash of a verification photo of the point of contact holding a signed, dated,
  handwritten message detailed in SEP 0001 (`verification_photo_hash`).

The photo hashes allow exchanges and wallets to confirm the identity of your point of contact.
Those services can contact you privately to request ID and verification photos, then check those
photos against the hashes listed here to make sure they match.  If the hashes match, they will let
their clients know that your contact information is verified.

Here's an example of completed Point of Contact Documentation for one principal:

```toml
[[PRINCIPALS]]
name="Jane Jedidiah Johnson"
email="jane@domain.com"
keybase="crypto_jane"
twitter="crypto_jane"
github="crypto_jane"
id_photo_hash="be688838ca8686e5c90689bf2ab585cef1137c999b48c70b92f67a5c34dc15697b5d11c982ed6d71be1e1e7f7b4e0733884aa97c3f7a339a8ed03577cf74be09"
verification_photo_hash="016ba8c4cfde65af99cb5fa8b8a37e2eb73f481b3ae34991666df2e04feb6c038666ebd1ec2b6f623967756033c702dde5f423f7d47ab6ed1827ff53783731f7"
```

### Token Documentation

Information about your token(s) goes into a TOML [array of
tables](https://github.com/toml-lang/toml#array-of-tables) called `[[CURRENCIES]]`.  If you are
issuing multiple assets, you can include them all in one stellar.toml. Each asset should have its
own `[[CURRENCIES]]` entry.

#### Required

* The asset code (`code`). This is one of two key pieces of information that identify your token.
  Without it, your token cannot be listed anywhere. You can also use the `code_template` field to
  represent multiple assets with very similar assets — for example, futures contracts where the
  asset code remains the same besides the date of the contract.
* The Stellar public key of the issuing account (`issuer`). This is the second key piece of
  information that identifies your token. Without it, your token cannot be listed anywhere.
* The status of your token (`status`): *live*, *dead*, or *test*. Marking your token *live* means
  you are ready for exchanges to list it. If your token is ready to trade, and you fail to list
  its status, it may not appear on exchanges.
* A preference for the number of decimals when a client displays currency balance
  (`display_decimals`).
* A short name for the token (`name`). If you fail to name your token, exchanges may not be able
  to display it properly.
* An indication of whether your token is anchored or native (`is_asset_anchored`): `true` if your
  token can be redeemed for an asset outside the Stellar network, `false` if it can’t.  Exchanges
  use this information to sort tokens by type in listings. If you fail to provide it, your token
  is unlikely to show up in filtered market views.

You also need to describe your **token issuance policy** by filling in exactly *one* of the
following mutually exclusive fields:

* `fixed_number`, which you should specify if you are issuing a set number of tokens, and that
  number will never increase.
* `max_number`, which you should specify if there is an upper limit to the number of tokens you
  will issue.
* `is_unlimited`, which you should specify if you reserve the right to create more tokens at your
  discretion.

Finally, if you're issuing anchored (tethered, stablecoin, asset-backed) tokens, there are several
additional fields required. Anchored assets are specialized assets in the Stellar ecosystem because
they can be redeemed outside of the network for other assets. If you are issuing an anchored
token, you need to provide additional information about those assets, and about how to redeem your
token for them.

In addition to Currency Documentation listed above, the following fields are **required** for
anchored tokens:

* The type of asset your token represents (`anchor_asset_type`).  The possible categories are
  `fiat`, `crypto`, `stock`, `bond`, `commodity`, `realestate`, and `other`.
* The name of the asset that serves as the anchor for your token (`anchor_asset`).
* Instructions to redeem your token for the underlying asset (`redemption_instructions`).

For assets that are anchored to other cryptocurrencies, exchanges are unlikely to list them without
the following **verifiable** information:

* The public addresses that hold the crypto assets (`collateral_addresses`).
* Proof that you control those public addresses (`collateral_address_signatures`). [SEP
  0001][sep-0001] contains a template for these signatures, and instructions for tailoring them to
  your token.

Exchanges use the collateral address signatures to verify that the accounts you list belong to you,
and will look at the reserve in those accounts. If you cannot prove 100% reserve, it is unlikely
they will list your token.

#### Suggested

* A description of your token and what it represents (`desc`).  This is a good place to clarify
  what your token does, and why someone might want to own it.
* Any conditions you place on the redemption of your token (`conditions`).
* A URL to a PNG or GIF image with a transparent background representing your token (`image`). Without it, your token will appear blank on many exchanges.
* anchor_asset_type
* anchor_asset

Here's what an example of completed Currency Documentation for an organization:

```toml
[[CURRENCIES]]
code="USD"
issuer="GCZJM35NKGVK47BB4SPBDV25477PZYIYPVVG453LPYFNXLS3FGHDXOCM"
display_decimals=2

[[CURRENCIES]]
code="BTC"
issuer="GAOO3LWBC4XF6VWRP5ESJ6IBHAISVJMSBTALHOQM2EZG7Q477UWA6L7U"
display_decimals=7
anchor_asset_type="crypto"
anchor_asset="BTC"
redemption_instructions="Use SEP6 with our federation server"
collateral_addresses=["2C1mCx3ukix1KfegAY5zgQJV7sanAciZpv"]
collateral_address_signatures=["304502206e21798a42fae0e854281abd38bacd1aeed3ee3738d9e1446618c4571d10"]

# Asset with meta info
[[CURRENCIES]]
code="GOAT"
issuer="GD5T6IPRNCKFOHQWT264YPKOZAWUMMZOLZBJ6BNQMUGPWGRLBK3U7ZNP"
display_decimals=2
name="goat share"
desc="1 GOAT token entitles you to a share of revenue from Elkins Goat Farm."
conditions="There will only ever be 10,000 GOAT tokens in existence. We will distribute the revenue share annually on Jan. 15th"
image="https://static.thenounproject.com/png/2292360-200.png"
fixed_number=10000
```

#### Linking to Currency TOML Files
Alternately, stellar.toml can link out to a separate TOML file for each currency by specifying
`toml="https://DOMAIN/.well-known/CURRENCY.toml` as the currency's only field.

### Validator Information

If your organizations runs any nodes as validators for the network, you should list them in the
`[[VALIDATORS]]` [array of tables](https://github.com/toml-lang/toml#array-of-tables). Each table
should represent one node that your organization runs. Combined with the steps outlined in
[SEP-0020][sep-0020], this section allows you to declare your node(s), and to let others know the
location of any public archives you maintain. Complete all applicable fields, and exclude any that
don't apply.

#### Required

* A name to display within `stellar-core` configurations (`ALIAS`). It should conform to the regex
  `^[a-z0-9-]{2,16}$`
* A human readable display name for use in quorum explorers and other interfaces (`DISPLAY_NAME`).
* The Stellar Account associated with that node (`PUBLIC_KEY`).
* The IP:port or domain:port peers can use to connect to the node (`HOST`).
* The URI location of the history archive published by this validator (`HISTORY`).

Here's an example of completed Validator Documentation for an organization.

```toml
[[VALIDATORS]]
ALIAS="domain-us"
DISPLAY_NAME="Domain United States"
HOST="core-us.domain.com:11625"
PUBLIC_KEY="GAOO3LWBC4XF6VWRP5ESJ6IBHAISVJMSBTALHOQM2EZG7Q477UWA6L7U"
HISTORY="http://history.domain.com/prd/core-live/core_live_003/"
```

## How to publish your stellar.toml

After you've followed the steps above to complete your stellar.toml, post it at the following
location:

`https://YOUR_DOMAIN/.well-known/stellar.toml`

Enable [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) so people can access this
file from other sites, and set the following header for an HTTP response for a
`/.well-known/stellar.toml` file request.

`Access-Control-Allow-Origin: *`

Once you've done that, you're all set!  Now apps and buyers can access all the information you've
provided with a simple HTTP request.

### Case Study: AnchorUSD

If you want to see a stellar.toml done well, take a look at
[AnchorUSD’s](https://www.anchorusd.com/.well-known/stellar.toml). You can easily find out
everything you need to know about the company, their Stellar accounts, their points of contact, and
their tokens, and you can take steps to verify that information.

[sep-0001]: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md
[sep-0020]: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0020.md
[seps]: https://github.com/stellar/stellar-protocol/tree/master/ecosystem
[twilio-guide]: https://support.twilio.com/hc/en-us/articles/223183008-Formatting-International-Phone-Numbers
