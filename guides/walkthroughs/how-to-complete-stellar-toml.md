---
title: How and Why to Complete Your Stellar.toml
---

>*If you are interested in issuing a token on the Stellar network, but haven't yet, start by consulting the step-by-step instructions for custom asset creation *[*here*](./custom-assets.md)*.*

Hello! We made this short guide to help you, a token issuer, put your token in the best possible place to succeed on Stellar.

Mostly, we want to make sure you know how to **provide information to the network** about yourself and your token, so that potential buyers and apps, like exchanges and wallets, will trust your asset. You provide this necessary information by completing your **stellar.toml** file.

The best tokens on Stellar already follow the guidelines below, and *apps and buyers will expect your token to do the same*.

Why you should complete your stellar.toml file
----------------------------------------------

The most successful token issuers give exchanges and potential buyers lots of information about themselves. On Stellar, they do this in the **stellar.toml** file. More information in your token's stellar.toml will mean:

* your token is listed on *more* exchanges

* your token holders are *more* confident

* very likely, your project is *more* successful

For example, the Stellar app, [StellarX](http://stellarx.com/), uses the stellar.toml file to decide how your token is presented to traders in its markets view. If you don't provide enough information, your token may be hidden from many traders.  Other Stellar exchanges like stellarport.io and stellarterm.com make similar decisions.

*Many won't list your token at all without a robust stellar.toml.*

The stellar.toml file is *so* important that the first Stellar Ecosystem Proposal is devoted to outlining what it should contain. You can find the complete SEP 0001 [here](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md), but we'll summarize the important parts below.

What is your stellar.toml?
--------------------------

Your stellar.toml is a file you write in [TOML](https://github.com/toml-lang/toml), which is a simple configuration file format, and publish at https://YOUR_DOMAIN/.well-known/stellar.toml.  Anyone can look it up, and it *proves* that the owner of the https domain hosting the stellar.toml claims *responsibility* for the accounts and tokens listed in it.  So it's your chance to legitimize your offering, and to announce vital information about your organization and your token.  **If you offer multiple tokens, you can list them all in one stellar.toml file.**

How to complete your stellar.toml
---------------------------------

[SEP](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md)[ 0001](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md) specifies five sections you can add to your stellar.toml: Account Information, Issuer Documentation, Point of Contact Documentation, Currency Documentation, and Validator Information.  Within those sections, some fields only apply to specialized tokens, but many apply to *all* tokens, and these guidelines will outline which fields are:

* **Required**: all token issuers *must* include this information in their stellar.toml if they want to be listed on exchanges.

* **Suggested**: any token issuer who wants their offering to stand out should complete these fields.

### ACCOUNT INFORMATION

There is one field in the Account Information section required for *all* token issuers:

* `ACCOUNTS`: A list of **public keys** for all the Stellar accounts associated with your token. 

Listing your public keys lets users confirm that you, in fact, own them. For example, when https://google.com hosts a stellar.toml file, users can be sure that *only* the accounts listed on it belong to Google. If someone then says, "You need to pay your Google bill this month, send payment to address GIAMGOOGLEIPROMISE", but that key is not listed on Google's stellar.toml, then users know to not trust it. 

Most of the other information specified in the Account Information section is only necessary for validators and financial institutions.

Here's an example of a completed `ACCOUNTS` field listing three public keys:

	ACCOUNTS=[
	"GAOO3LWBC4XF6VWRP5ESJ6IBHAISVJMSBTALHOQM2EZG7Q477UWA6L7U",
	"GAENZLGHJGJRCMX5VCHOLHQXU3EMCU5XWDNU4BGGJFNLI2EL354IVBK7",
	"GB6REF5GOGGSEHZ3L2YK6K4T4KX3YDMWHDCPMV7MZJDLHBDNZXEPRBGM"
	]

### ISSUER DOCUMENTATION

Basic information about your organization goes into a TOML **table** called `[DOCUMENTATION]`.  Issuer Documentation is your chance to inform exchanges and buyers about your business, and to demonstrate that your business is legitimate and trustworthy. 

The more you fill out, the more likely people are to believe in your offering.  

**Required:** All issuers must include the following information:

* The legal name of your organization (`org_name`), and if your business has one, its official dba (`org_dba`).

* The URL of your organization's official website (`org_url`).  In order to prove the website is yours, *you must host your stellar.toml on the same domain you list here.*  That way, exchanges and buyers can view the SSL certificate on your website, and feel reasonably confident that you are who you say you are.

* A URL to a company logo (`org_logo`), which will show up next to your organization on exchanges.  If you fail to provide a logo, the icon next to your organization will appear blank on many exchanges.

* The physical address of your organization (`org_physical_address`). We understand you might want to keep your work address private. At the very least, you should put the *city* and *country* in which you operate. A street address is ideal and provides a higher level of trust and transparency to your potential users.

* Your organization's official phone number (`org_phone_number`). 

* Your organization's official Twitter handle (`org_twitter`).

* The best contact email address for you organization (`org_official_email`). This should be hosted at the same domain as your official website.

**Suggested:** Including this information will help your offering stand out:

* Your organization's official Github account (`org_github`).

* Your organization's official Keybase account (`org_keybase`).  Your Keybase account should contain proof of ownership of any public online accounts you list here, including your organization's domain. 

* A description of your organization (`org_description`).  This is fairly open-ended, and you can write as much as you want.  It's a great place to distinguish yourself by describing what it is that you do.

Exchanges might desire additional verifiable information when deciding how to present your token to traders, and prioritize tokens that include it:

* Attestation of the physical address listed above (`org_physical_address_attestation`).  This is a URL to an image on your organization's domain of an official third party document (such as a utility bill) that shows your organization's name and address.

* Attestation of the phone number listed above (`org_phone_number_attestation`).  This is a URL to an image on your domain showing a phone bill listing both your phone number and your organization's name.

Here's an example of completed Issuer Documentation:

    [DOCUMENTATION]
    ORG_NAME="Organization Name"
    ORG_DBA="Organization DBA"
    ORG_URL="https://www.domain.com"
    ORG_LOGO="https://www.domain.com/awesomelogo.jpg"
    ORG_DESCRIPTION="Description of issuer"
    ORG_PHYSICAL_ADDRESS="123 Sesame St., New York, NY, 12345" 
    ORG_PHYSICAL_ADDRESS_ATTESTATION="https://www.domain.com/address_attestation.jpg"
    ORG_PHONE_NUMBER="1 (123)-456-7890"
    ORG_PHONE_NUMBER_ATTESTATION="https://www.domain.com/phone_attestation.jpg"
    ORG_KEYBASE="accountname"
    ORG_TWITTER="orgtweet"
    ORG_GITHUB="orgcode"
    ORG_OFFICIAL_EMAIL="support@domain.com"

### POINT OF CONTACT DOCUMENTATION

Information about the primary point(s) of contact for your organization goes into a TOML [array of tables](https://github.com/toml-lang/toml#array-of-tables) called `[[PRINCIPALS]]`.  You need to put contact information for *at least one person* at your organization.  If you don't, exchanges can't verify your offering, and it is unlikely that buyers will be interested. Multiple principals can be added with additional `[[PRINCIPALS]]` entries.

**Required**: All token issuers should include the following information about their point of contact:

* The name of the primary contact (`name`).

* The primary contact's official email address (`email`).  This should be hosted at the same domain as your organization's official website.

* The personal Twitter handle of the point of contact (`twitter`).

**Suggested:** If the point of contact for your organization has them, we suggest you also include:

* The personal Github account of the point of contact (`github`).

* The personal Keybase account for the point of contact (`keybase`). This account should include proof of ownership of the email address listed above.

Again, the more information you provide, the better. Exchanges might desire additional verifiable information when deciding how to present your token to traders, and prioritize tokens that include it:

* A SHA-256 hash of a photo of the point of contact's government-issued photo ID (`id_photo_hash`). 

* A SHA-256 hash of a verification photo of the point of contact holding a signed, dated, handwritten message detailed in SEP 0001 (`verification_photo_hash`).

The photo hashes allow exchanges and wallets to confirm the identity of your point of contact.  Those services can contact you privately to request ID and verification photos, then check those photos against the hashes listed here to make sure they match.  If the hashes match, they will let their clients know that your contact information is verified.

Here's an example of completed Point of Contact Documentation for one principal:

    [[PRINCIPALS]]
    name="Jane Jedidiah Johnson"
    email="jane@domain.com"
    twitter="@crypto_jane"
    keybase="crypto_jane"
    github="crypto_jane"
    id_photo_hash="5g249e170f4f134b18ab3de069c5a13e5c3ef3ef90f3643afa15a1603c34cf38"
    verification_photo_hash="693687f6abd594366a09cfe6b380e58f9023867a851cc9fa71f302ab4889e48"


### TOKEN DOCUMENTATION

Information about your token(s) goes into a TOML [array of tables](https://github.com/toml-lang/toml#array-of-tables) called `[[CURRENCIES]]`.  If you are issuing multiple tokens, you can include them all in one stellar.toml.  Each token should have its own `[[CURRENCIES]]` entry.

**Required**: All issuers must provide the following information for each token they issue:

* The asset code (`code`).  This is one of two key pieces of information that identify your token.  Without it, your token cannot be listed anywhere.

* The Stellar public key of the issuing account (`issuer`).  This is the second key piece of information that identifies your token. Without it, your token cannot be listed anywhere.

* The status of your token (`status`): *live*, *dead*, or *test*.  Marking your token *live* means you are ready for exchanges to list it.  If your token is ready to trade, and you fail to list its status, it may not appear on exchanges. 

* An indication of whether your token is anchored or native (`is_asset_anchored`): `true` if your token can be redeemed for an asset outside the Stellar network, `false` if it can’t.  Exchanges use this information to sort tokens by type in listings.  If you fail to provide it, your token is unlikely to show up in filtered market views.  

* A preference for number of decimals when client displays currency balance (`display_decimals`).

* A short name for the token (`name`).  If you fail to name your token, exchanges may not be able to display it properly.

You also need to describe your **token issuance policy** by filling in exactly *one* of the following mutually exclusive fields:

* `fixed_number`, which you should specify if you are issuing a set number of tokens, and that number will never increase.

* `max_number`, which you should specify if there is an upper limit to the number of tokens you will issue.

* `is_unlimited`, which you should specify if you reserve the right to create more tokens at your discretion.

**Suggested:** If you want your token to stand out, you should also include the following:

* A description of your token and what it represents (`desc`).  This is a good place to clarify what your token does, and why someone might want to own it.

* Any conditions you place on the redemption of your token (`conditions`).

* A URL to an image representing token (`image`).  Without it, your token will appear blank on many exchanges

Here's what an example of completed Currency Documentation:

	[[CURRENCIES]]
    code="GOAT"
    issuer="GD5T6IPRNCKFOHQWT264YPKOZAWUMMZOLZBJ6BNQMUGPWGRLBK3U7ZNP"
    status=”live”
    display_decimals=2
    name="goat share"
    desc="1 GOAT token entitles you to a share of revenue from Elkins Goat Farm."
    conditions="There will only ever be 10,000 GOAT tokens in existence. We will distribute the revenue share annually on Jan. 15th"
    image="https://pbs.twimg.com/profile_images/666921221410439168/iriHah4f.jpg"
    fixed_number=10000

### ANCHORED OR ASSET-BACKED TOKEN REQUIREMENTS:

Anchored tokens are specialized assets in the Stellar ecosystem because they can be redeemed outside of the network for other assets.  If you are issuing an anchored token, you need to provide additional information about those assets, and about how to redeem your token for them. 

In addition to Currency Documentation listed above, the following fields are **required** for anchored tokens:

* The type of asset your token represents (`anchor_asset_type`).  The possible categories are *fiat*, *crypto*, *stock*, *bond*, *commodity*, *realestate*, and *other*.

* The name of the asset that serves as the anchor for your token (`anchor_asset`). 

* Instructions to redeem your token for the underlying asset (`redemption_instructions`).

Because of the nature of assets anchored to crypto, exchanges are unlikely to list them without the following **verifiable** information:

* The public addresses that hold the crypto assets (`collateral_addresses`).

* Proof that you control those public addresses (`collateral_address_signatures`).  [SEP 0001](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md) contains a template for these signatures, and instructions for tailoring them to your token.

Exchanges use the collateral address signatures to verify that the accounts you list belong to you, and will look  at the reserve in those accounts.  If you cannot prove 100% reserve, it is unlikely they will list your token.

	[[CURRENCIES]]
	code="BTC"
	issuer="GAOO3LWBC4XF6VWRP5ESJ6IBHAISVJMSBTALHOQM2EZG7Q477UWA6L7U"
	status=”live”
	display_decimals=7
	name=”Bitcoin”
	desc=”Organization promises to purchase each BTC token from any holder for the value of 1 Bitcoin”
	conditions="Withdrawal fees apply"
	image="https://domain.com/img/Bitcoin-100x100.png"
	anchor_asset_type="crypto"
	anchor_asset="BTC"
	redemption_instructions="Use SEP6 with our federation server"
	collateral_addresses=["2C1mCx3ukix1KfegAY5zgQJV7sanAciZpv"]
	collateral_address_signatures=["304502206e21798a42fae0e854281abd38bacd1aeed3ee3738d9e1446618c4571d10"]

How to publish your stellar.toml
--------------------------------
After you've followed the steps above to complete your stellar.toml, post it at the following location:

* https://YOUR_DOMAIN/.well-known/stellar.toml

Enable [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) so people can access this file from other sites, and set the following header for an HTTP response for a /.well-known/stellar.toml file request.

* Access-Control-Allow-Origin: *

Once you've done that, you're all set!  Now apps and buyers can access all the information you've provided with a simple HTTP request.

### An example of a good stellar.toml: Stronghold

If you want to see a stellar.toml done right, take a look at Stronghold’s [here](https://stronghold.co/.well-known/stellar.toml).  You can easily find out everything you need to know about the company, their Stellar accounts, their points of contact, and their tokens, and you can take steps to verify that information.    

If your stellar.toml looks like Stronghold’s, exchanges and buyers will take notice.  

*****
