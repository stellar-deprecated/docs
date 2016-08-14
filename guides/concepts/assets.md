---
title: Assets
---

The Stellar distributed network can be used to track, hold, and transfer any type of **asset**: dollars, euros, bitcoin,
stocks, gold, and other tokens of value. Any asset on the network can be traded and exchanged with any other.

Other than lumens (see below), all assets have
- **Asset type**: e.g., USD or BTC
- **Issuer**: the account that created the asset

## Trustlines
When you hold assets in Stellar, you're actually holding credit from a particular issuer. The issuer has agreed that it
will trade you its credit on the Stellar network for the corresponding asset--e.g., fiat currency, precious metal--outside
of Stellar. Let's say that Scott issues oranges as credit on the network. If you hold orange credits, you and Scott have
an agreement based on trust, or a trustline: you both agree that when you give Scott an orange credit, he gives you an orange.

When you hold an asset, you must trust the issuer to properly redeem its credit. Since users of Stellar will not want to
trust just any issuer, accounts must explicitly trust an issuing account before they're able to hold the issuer's credit.
In the example above, you must explicitly trust Scott before you can hold orange credits.

To trust an issuing account, you create a **trustline.** Trustlines are entries that persist in the Stellar ledger. They
track the limit for which your account trusts the issuing account and the amount of credit from the issuing account that your account currently holds.

## Lumens (XLM)
**Lumens (XLM)** are the native currency of the network. A lumen is the only asset type that can be used on the Stellar
network that doesn't require an issuer or a trustline.
Any account can hold lumens. You can trade lumens for other assets in the network.


## Anchors: issuing assets
Any account can issue assets on the Stellar network. Entities that issue assets are called **anchors.** Anchors can be
run by individuals, small businesses, local communities, nonprofits, organizations, etc. Any type of financial institution--a bank, a payment processor--can be an anchor.

Each anchor has an **issuing account** from which it issues the asset.

As an anchor, when you issue an asset, you give it an **asset code**. Assets are uniquely identified by the asset code and the issuer.
Ultimately, it's up to the issuer to set the asset code. By convention, however, currencies should be represented by the
appropriate [ISO 4217 code](https://en.wikipedia.org/wiki/ISO_4217). For stocks and bonds, use the appropriate [ISIN number](https://en.wikipedia.org/wiki/International_Securities_Identification_Number).
For your orange, goat, favor, or beer anchors, you're on your own--invent an appropriate code!

Currently there are two supported formats for asset codes.

#### Alphanumeric 4-character maximum
Any characters from the set [a-z][A-Z][0-9] are allowed. The code can be shorter than 4 characters, but the trailing characters must all be empty.

#### Alphanumeric 12-character maximum
Any characters from the set [a-z][A-Z][0-9] are allowed. The code can be any number of characters from 5 to 12, but the trailing characters must all be empty.


### Controlling asset holders
As an anchor, you can mark the issuing account `AUTHORIZATION REQUIRED`. With this setting, the anchor must approve anyone
who wants to hold its credit, allowing it to control who its customers are.

### Revoking access
As an anchor, you can mark the issuing account `AUTHORIZATION REVOCABLE`. With this setting, the anchor can freeze credit
held by another account. When credit is frozen for a particular account, that account can only send the credit back to the anchor--it can't transfer the credit to any other account.
This setting allows the issuing account to revoke credit that it accidentally issued or that was obtained improperly.

## Amount precision and representation
Each asset amount is encoded as a signed 64-bit integer in the [XDR structures](https://www.stellar.org/developers/horizon/learn/xdr.html). An asset amount unit (that which is seen by end users) is scaled down by a factor of ten million (10,000,000) to arrive at the native 64-bit integer representation. For example, the integer amount value `25,123,456` equals `2.5123456` units of the asset. This scaling allows for **seven decimal places** of precision in human friendly amount units.

The smallest non-zero amount unit is `0.0000001` (one ten-millionth) represented as an integer value of one. The largest amount unit possible is `((2^63)-1)/(10^7)` (derived from max int64 scaled down) which is `922,337,203,685.4775807`.

The numbers are represented as `int64`s. Amount values are stored as only signed integers to avoid bugs that arise from mixing signed and unsigned integers.

### Relevance in Horizon and Stellar client libraries
In Horizon and client side libraries such as `js-stellar-sdk`, the integer encoded value is abstracted away. Many APIs expect amount unit value (the scaled up amount displayed to end users).

### Maintaining precision with "big number" libraries
Some programming languages (such as JavaScript) have problems with maintaining precision on a number amount. It is recommended to use "big number" libraries that can record arbitrary precision decimal numbers without a loss of precision.

### One stroop, multiple stroops
A "stroop" is the smallest amount unit. It is one ten-millionth: `1/10000000` or `0.0000001`. The term stroop is used as a convenient way to refer to these small measurements of amounts. The plural form is "stroops" (e.g. "100 stroops"). Fun fact: this term is derived from Stroopy, the name of the Stellar mascot whose name is derived from [stroopwafels](https://en.wikipedia.org/wiki/Stroopwafel).
