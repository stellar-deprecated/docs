---
title: List of Operations
replacement: https://developers.stellar.org/docs/start/list-of-operations/
---

For a description of how operations work in Stellar, see [Operations](./operations.md).

For the protocol specification, see [stellar-transactions.x](https://github.com/stellar/stellar-core/blob/master/src/xdr/Stellar-transaction.x).

- [Create Account](#create-account)
- [Payment](#payment)
- [Path Payment Strict Send](#path-payment-strict-send)
- [Path Payment Strict Receive](#path-payment-strict-receive)
- [Manage Buy Offer](#manage-buy-offer)
- [Manage Sell Offer](#manage-sell-offer)
- [Create Passive Sell Offer](#create-passive-sell-offer)
- [Set Options](#set-options)
- [Change Trust](#change-trust)
- [Allow Trust](#allow-trust)
- [Account Merge](#account-merge)
- [Manage Data](#manage-data)
- [Bump Sequence](#bump-sequence)

## Create Account
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.createAccount) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/CreateAccountOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/txnbuild#CreateAccount)

Creates and funds a new account with the specified starting balance.

Threshold: Medium

Result: `CreateAccountResult`

Parameters:

| Parameter        | Type       | Description                                                                                |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------ |
| Destination      | account ID | Account address that is created and funded.                                                |
| Starting Balance | integer    | Amount of XLM to send to the newly created account. This XLM comes from the source account.|


Possible errors:

| Error | Code | Description |
| ----- | ---- | ------|
|CREATE_ACCOUNT_MALFORMED| -1| The `destination` is invalid.|
|CREATE_ACCOUNT_UNDERFUNDED| -2| The source account performing the command does not have enough funds to give `destination` the `starting balance` amount of XLM and still maintain its minimum XLM reserve plus satisfy its XLM selling liabilities.|
|CREATE_ACCOUNT_LOW_RESERVE| -3| This operation would create an account with fewer than the minimum number of XLM an account must hold.|
|CREATE_ACCOUNT_ALREADY_EXIST| -4| The `destination` account already exists.|

## Payment
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.payment) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/PaymentOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/txnbuild#Payment)

Sends an amount in a specific asset to a destination account.

Threshold: Medium

Result: `PaymentResult`

Parameters:

|Parameters| Type| Description|
| --- | --- | --- |
|Destination| account ID| Account address that receives the payment.|
|Asset| asset| Asset to send to the destination account.|
|Amount| integer| Amount of the aforementioned asset to send.|

Possible errors:

|Error| Code| Description|
| --- | --- | --- |
|PAYMENT_MALFORMED| -1| The input to the payment is invalid.|
|PAYMENT_UNDERFUNDED| -2| The source account (sender) does not have enough funds to send `amount` and still satisfy its selling liabilities. Note that if sending XLM then the sender must additionally maintain its minimum XLM reserve.|
|PAYMENT_SRC_NO_TRUST| -3| The source account does not trust the issuer of the asset it is trying to send.|
|PAYMENT_SRC_NOT_AUTHORIZED| -4| The source account is not authorized to send this payment.|
|PAYMENT_NO_DESTINATION| -5| The receiving account does not exist.|
|PAYMENT_NO_TRUST| -6| The receiver does not trust the issuer of the asset being sent. For more information, see the [assets doc](./assets.md).|
|PAYMENT_NOT_AUTHORIZED| -7| The destination account is not authorized by the asset's issuer to hold the asset.|
|PAYMENT_LINE_FULL| -8| The destination account (receiver) does not have sufficient limits to receive `amount` and still satisfy its buying liabilities.|
|PAYMENT_NO_ISSUER| -9| The issuer of the asset does not exist.|

## Path Payment Strict Send
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.pathPaymentStrictSend) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/PathPaymentStrictSendOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/txnbuild#PathPaymentStrictSend)

A path payment sends an amount of a specific asset to a destination account through a path of offers. Since the asset sent (e.g., 450 XLM) can be different from the asset received (e.g, 6 BTC), path payments allow for the simultaneous transfer and conversion of currencies.  

A Path Payment Strict Send allows a user to specify the *amount of the asset to send*. The amount received will vary based on offers in the order books.  If you would like to instead specify the amount received, use the [Path Payment Strict Receive](#path-payment-strict-receive) operation.  

A few things to note:
* path payments don't allow intermediate offers to be from the source account as this would yield a worse exchange rate. You'll need to either split the path payment into two smaller path payments, or ensure that the source account's offers are not at the top of the order book.
* balances are settled at the very end of the operation
   * this is especially important when `(Destination, Destination Asset) == (Source, Send Asset)` as this provides a functionality equivalent to getting a no interest loan for the duration of the operation.
* `Destination min` is a protective measure: it allows you to specify a lower bound for an acceptable conversion.  If offers in the order books are not favorable enough for the operation to deliver that amount, the operation will fail.

Threshold: Medium

Result: `PathPaymentStrictSendResult`

Parameters:

|Parameters| Type| Description|
| --- | --- | --- |
|Send asset| asset| The asset deducted from the sender's account.|
|Send amount| integer| The amount of `send asset` to deduct (excluding fees).|
|Destination| account ID| Account ID of the recipient.|
|Destination asset| asset| The asset the destination account receives.|
|Destination min| integer| The minimum amount of `destination asset` the destination account can receive.|
|Path| list of assets| The assets (other than `send asset` and `destination asset`) involved in the offers the path takes. For example, if you can only find a path from USD to EUR through XLM and BTC, the path would be USD -> XLM -> BTC -> EUR and the `path` field would contain XLM and BTC.|

Possible errors:

| Error | Code | Description |
| ----- | ---- | ------|
|PATH_PAYMENT_STRICT_SEND_MALFORMED| -1| The input to this path payment is invalid.|
|PATH_PAYMENT_STRICT_SEND_UNDERFUNDED| -2| The source account (sender) does not have enough funds to send and still satisfy its selling liabilities. Note that if sending XLM then the sender must additionally maintain its minimum XLM reserve.|
|PATH_PAYMENT_STRICT_SEND_SRC_NO_TRUST| -3| The source account does not trust the issuer of the asset it is trying to send.|
|PATH_PAYMENT_STRICT_SEND_SRC_NOT_AUTHORIZED| -4| The source account is not authorized to send this payment. |
|PATH_PAYMENT_STRICT_SEND_NO_DESTINATION| -5| The destination account does not exist. |
|PATH_PAYMENT_STRICT_SEND_NO_TRUST| -6| The destination account does not trust the issuer of the asset being sent. For more, see the [assets doc](./assets.md).|
|PATH_PAYMENT_STRICT_SEND_NOT_AUTHORIZED| -7| The destination account is not authorized by the asset's issuer to hold the asset. |
|PATH_PAYMENT_STRICT_SEND_LINE_FULL| -8| The destination account does not have sufficient limits to receive `destination amount` and still satisfy its buying liabilities.|
|PATH_PAYMENT_STRICT_SEND_NO_ISSUER| -9| The issuer of one of the assets is missing.|
|PATH_PAYMENT_STRICT_SEND_TOO_FEW_OFFERS| -10| There is no path of offers connecting the `send asset` and `destination asset`.  Stellar only considers paths of length 5 or shorter.|
|PATH_PAYMENT_STRICT_SEND_OFFER_CROSS_SELF| -11| The payment would cross one of its own offers.|
|PATH_PAYMENT_STRICT_SEND_UNDER_DESTMIN| -12| The paths that could send `destination amount` of `destination asset` would fall short of  `destination min`.|

## Path Payment Strict Receive
[JavaScript](https://stellar.github.io/js-stellar-sdk/Operation.html#.pathPaymentStrictReceive) | [Java](https://stellar.github.io/java-stellar-sdk/org/stellar/sdk/PathPaymentStrictReceiveOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/txnbuild#PathPaymentStrictReceive)

A path payment sends an amount of a specific asset to a destination account through a path of offers. Since the asset sent (e.g., 450 XLM) can be different from the asset received (e.g, 6 BTC), path payments allow for the simultaneous transfer and conversion of currencies.  

A Path Payment Strict Receive allows a user to specify the *amount of the asset received*. The amount sent varies based on offers in the order books.  If you would like to instead specify the amount sent, use the [Path Payment Strict Send](#path-payment-strict-send) operation.    

A few things to note:
* path payment doesn't allow intermediate offers to be from the source account as this would yield a worse exchange rate. You'll need to either split the path payment into two smaller path payments, or ensure that the source account's offers are not at the top of the order book.
* balances are settled at the very end of the operation
   * this is especially important when `(Destination, Destination Asset) == (Source, Send Asset)` as this provides a functionality equivalent to getting a no interest loan for the duration of the operation.
* `Send max` is a protective measure: it allows you to specify an upper bound for an acceptable conversion.  If offers in the order books are not favorable enough for the operation to succeed for less than `Send max`, the operation will fail.

Threshold: Medium

Result: `PathPaymentStrictReceiveResult`

Parameters:

|Parameters| Type| Description|
| --- | --- | --- |
|Send asset| asset| The asset deducted from the sender's account.|
|Send max| integer| The maximum amount of `send asset` to deduct (excluding fees).|
|Destination| account ID| Account ID of the recipient.|
|Destination asset| asset| The asset the destination account receives.|
|Destination amount| integer| The amount of `destination asset` the destination account receives.|
|Path| list of assets| The assets (other than `send asset` and `destination asset`) involved in the offers the path takes. For example, if you can only find a path from USD to EUR through XLM and BTC, the path would be USD -> XLM -> BTC -> EUR and the `path` field would contain XLM and BTC.|

Possible errors:

| Error | Code | Description |
| ----- | ---- | ------|
|PATH_PAYMENT_STRICT_RECEIVE_MALFORMED| -1| The input to this path payment is invalid.|
|PATH_PAYMENT_STRICT_RECEIVE_UNDERFUNDED| -2| The source account (sender) does not have enough funds to send and still satisfy its selling liabilities. Note that if sending XLM then the sender must additionally maintain its minimum XLM reserve.|
|PATH_PAYMENT_STRICT_RECEIVE_SRC_NO_TRUST| -3| The source account does not trust the issuer of the asset it is trying to send.|
|PATH_PAYMENT_STRICT_RECEIVE_SRC_NOT_AUTHORIZED| -4| The source account is not authorized to send this payment. |
|PATH_PAYMENT_STRICT_RECEIVE_NO_DESTINATION| -5| The destination account does not exist. |
|PATH_PAYMENT_STRICT_RECEIVE_NO_TRUST| -6| The destination account does not trust the issuer of the asset being sent. For more, see the [assets doc](./assets.md).|
|PATH_PAYMENT_STRICT_RECEIVE_NOT_AUTHORIZED| -7| The destination account is not authorized by the asset's issuer to hold the asset. |
|PATH_PAYMENT_STRICT_RECEIVE_LINE_FULL| -8| The destination account does not have sufficient limits to receive `destination amount` and still satisfy its buying liabilities.|
|PATH_PAYMENT_STRICT_RECEIVE_NO_ISSUER| -9| The issuer of one the of assets is missing.|
|PATH_PAYMENT_STRICT_RECEIVE_TOO_FEW_OFFERS| -10| There is no path of offers connecting the `send asset` and `destination asset`.  Stellar only considers paths of length 5 or shorter.|
|PATH_PAYMENT_STRICT_RECEIVE_OFFER_CROSS_SELF| -11| The payment would cross one of its own offers.|
|PATH_PAYMENT_STRICT_RECEIVE_OVER_SENDMAX| -12| The paths that could send `destination amount` of `destination asset` would exceed `send max`.|

## Manage Buy Offer
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.manageBuyOffer) | [Java](https://stellar.github.io/java-stellar-sdk/org/stellar/sdk/ManageBuyOfferOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/txnbuild#ManageBuyOffer)

Creates, updates, or deletes an offer to buy one asset for another, otherwise known as a "bid"
order on a traditional orderbook.

If you want to create a new offer set Offer ID to `0`.

If you want to update an existing offer set Offer ID to existing offer ID.

If you want to delete an existing offer set Offer ID to existing offer ID and set Amount to `0`.

Threshold: Medium

Result: `ManageBuyOfferResult`

|Parameters| Type| Description|
| --- | --- | --- |
| Selling | asset | Asset the offer creator is selling. |
| Buying | asset | Asset the offer creator is buying. |
| Amount | integer | Amount of `buying` being bought. Set to `0` if you want to delete an existing offer. |
| Price | {numerator, denominator} | Price of 1 unit of `buying` in terms of `selling`.  For example, if you wanted to buy 30 XLM and sell 5 BTC, the price would be {5,30}. |
| Offer ID | unsigned integer | The ID of the offer. `0` for new offer. Set to existing offer ID to update or delete. |

Possible errors:

| Error | Code | Description |
| ----- | ---- | ------ |
| MANAGE_BUY_OFFER_MALFORMED | -1 | The input is incorrect and would result in an invalid offer. |
| MANAGE_BUY_OFFER_SELL_NO_TRUST | -2 | The account creating the offer does not have a trustline for the asset it is selling. |
| MANAGE_BUY_OFFER_BUY_NO_TRUST | -3 | The account creating the offer does not have a trustline for the asset it is buying. |
| MANAGE_BUY_OFFER_BUY_NOT_AUTHORIZED | -4 | The account creating the offer is not authorized to sell this asset. |
| MANAGE_BUY_OFFER_SELL_NOT_AUTHORIZED | -5 | The account creating the offer is not authorized to buy this asset. |
| MANAGE_BUY_OFFER_LINE_FULL | -6 | The account creating the offer does not have sufficient limits to receive `buying` and still satisfy its buying liabilities. |
| MANAGE_BUY_OFFER_UNDERFUNDED | -7 | The account creating the offer does not have sufficient limits to send `selling` and still satisfy its selling liabilities. Note that if selling XLM then the account must additionally maintain its minimum XLM reserve, which is calculated assuming this offer will not completely execute immediately. |
| MANAGE_BUY_OFFER_CROSS_SELF | -8 | The account has opposite offer of equal or lesser price active, so the account creating this offer would immediately cross itself. |
| MANAGE_BUY_OFFER_SELL_NO_ISSUER | -9 | The issuer of selling asset does not exist. |
| MANAGE_BUY_OFFER_BUY_NO_ISSUER | -10 | The issuer of buying asset does not exist. |
| MANAGE_BUY_OFFER_NOT_FOUND | -11 | An offer with that `offerID` cannot be found. |
| MANAGE_BUY_OFFER_LOW_RESERVE | -12 | The account creating this offer does not have enough XLM to satisfy the minimum XLM reserve increase caused by adding a subentry and still satisfy its XLM selling liabilities. For every offer an account creates, the minimum amount of XLM that account must hold will increase. |


## Manage Sell Offer
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.manageSellOffer) | [Java](https://stellar.github.io/java-stellar-sdk/org/stellar/sdk/ManageSellOfferOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/txnbuild#ManageSellOffer)

Creates, updates, or deletes an offer to sell one asset for another, otherwise known as a "ask"
order or "offer" on a traditional orderbook.

If you want to create a new offer set Offer ID to `0`.

If you want to update an existing offer set Offer ID to existing offer ID.

If you want to delete an existing offer set Offer ID to existing offer ID and set Amount to `0`.

Threshold: Medium

Result: `ManageSellOfferResult`

|Parameters| Type| Description|
| --- | --- | --- |
| Selling | asset | Asset the offer creator is selling. |
| Buying | asset | Asset the offer creator is buying. |
| Amount | integer | Amount of `selling` being sold. Set to `0` if you want to delete an existing offer. |
| Price | {numerator, denominator} | Price of 1 unit of `selling` in terms of `buying`.  For example, if you wanted to sell 30 XLM and buy 5 BTC, the price would be {5,30}. |
| Offer ID | unsigned integer | The ID of the offer. `0` for new offer. Set to existing offer ID to update or delete. |

Possible errors:

| Error | Code | Description |
| ----- | ---- | ------ |
| MANAGE_SELL_OFFER_MALFORMED | -1 | The input is incorrect and would result in an invalid offer. |
| MANAGE_SELL_OFFER_SELL_NO_TRUST | -2 | The account creating the offer does not have a trustline for the asset it is selling. |
| MANAGE_SELL_OFFER_BUY_NO_TRUST | -3 | The account creating the offer does not have a trustline for the asset it is buying. |
| MANAGE_SELL_OFFER_SELL_NOT_AUTHORIZED | -4 | The account creating the offer is not authorized to sell this asset. |
| MANAGE_SELL_OFFER_BUY_NOT_AUTHORIZED | -5 | The account creating the offer is not authorized to buy this asset. |
| MANAGE_SELL_OFFER_LINE_FULL | -6 | The account creating the offer does not have sufficient limits to receive `buying` and still satisfy its buying liabilities. |
| MANAGE_SELL_OFFER_UNDERFUNDED | -7 | The account creating the offer does not have sufficient limits to send `selling` and still satisfy its selling liabilities. Note that if selling XLM then the account must additionally maintain its minimum XLM reserve, which is calculated assuming this offer will not completely execute immediately. |
| MANAGE_SELL_OFFER_CROSS_SELF | -8 | The account has opposite offer of equal or lesser price active, so the account creating this offer would immediately cross itself. |
| MANAGE_SELL_OFFER_SELL_NO_ISSUER | -9 | The issuer of selling asset does not exist. |
| MANAGE_SELL_OFFER_BUY_NO_ISSUER | -10 | The issuer of buying asset does not exist. |
| MANAGE_SELL_OFFER_NOT_FOUND | -11 | An offer with that `offerID` cannot be found. |
| MANAGE_SELL_OFFER_LOW_RESERVE | -12 | The account creating this offer does not have enough XLM to satisfy the minimum XLM reserve increase caused by adding a subentry and still satisfy its XLM selling liabilities. For every offer an account creates, the minimum amount of XLM that account must hold will increase. |

## Create Passive Sell Offer
[JavaScript](https://stellar.github.io/js-stellar-sdk/Operation.html#.createPassiveSellOffer) | [Java](https://stellar.github.io/java-stellar-sdk/org/stellar/sdk/CreatePassiveSellOfferOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/txnbuild#CreatePassiveSellOffer)

Creates, updates, or deletes an offer to sell one asset for another, otherwise known as a "ask"
order or "offer" on a traditional orderbook, _without taking a reverse offer of equal price_.

A passive sell offer is an offer that does not act on and take a reverse offer of equal price.
Instead, they only take offers of lesser price. For example, if an offer exists to buy 5 BTC for 30
XLM, and you make a passive offer to buy 30 XLM for 5 BTC, your passive offer *does not* take the
first offer. Passive offers in Stellar are always expressed as "ask" or "offer" orders in a
traditional orderbook.

Note that regular offers made later than your passive offer can act on and take your passive offer,
even if the regular offer is of the same price as your passive offer.

Passive offers allow market makers to have zero spread. If you want to trade EUR for USD at 1:1
price and USD for EUR also at 1:1, you can create two passive offers so the two offers don't
immediately act on each other.

Once the passive offer is created, you can manage it like any other offer using the [manage
offer](#manage-offer) operation.

Threshold: Medium

Result: `ManageSellOfferResult`

| Parameters | Type | Description |
| --- | --- | --- |
| Selling | asset | Asset the offer creator is selling. |
| Buying | asset | Asset the offer creator is buying. |
| Amount | integer | Amount of `selling` being sold. Set to `0` if you want to delete an existing offer. |
| Price | {numerator, denominator} | Price of 1 unit of `selling` in terms of `buying`.  For example, if you wanted to sell 30 XLM and buy 5 BTC, the price would be {5,30}. |
| Offer ID | unsigned integer | The ID of the offer. `0` for new offer. Set to existing offer ID to update or delete. |

Possible errors:

| Error | Code | Description |
| ----- | ---- | ------ |
| MANAGE_SELL_OFFER_MALFORMED | -1 | The input is incorrect and would result in an invalid offer. |
| MANAGE_SELL_OFFER_SELL_NO_TRUST | -2 | The account creating the offer does not have a trustline for the asset it is selling. |
| MANAGE_SELL_OFFER_BUY_NO_TRUST | -3 | The account creating the offer does not have a trustline for the asset it is buying. |
| MANAGE_SELL_OFFER_SELL_NOT_AUTHORIZED | -4 | The account creating the offer is not authorized to sell this asset. |
| MANAGE_SELL_OFFER_BUY_NOT_AUTHORIZED | -5 | The account creating the offer is not authorized to buy this asset. |
| MANAGE_SELL_OFFER_LINE_FULL | -6 | The account creating the offer does not have sufficient limits to receive `buying` and still satisfy its buying liabilities. |
| MANAGE_SELL_OFFER_UNDERFUNDED | -7 | The account creating the offer does not have sufficient limits to send `selling` and still satisfy its selling liabilities. Note that if selling XLM then the account must additionally maintain its minimum XLM reserve, which is calculated assuming this offer will not completely execute immediately. |
| MANAGE_SELL_OFFER_CROSS_SELF | -8 | The account has opposite offer of equal or lesser price active, so the account creating this offer would immediately cross itself. |
| MANAGE_SELL_OFFER_SELL_NO_ISSUER | -9 | The issuer of selling asset does not exist. |
| MANAGE_SELL_OFFER_BUY_NO_ISSUER | -10 | The issuer of buying asset does not exist. |
| MANAGE_SELL_OFFER_NOT_FOUND | -11 | An offer with that `offerID` cannot be found. |
| MANAGE_SELL_OFFER_LOW_RESERVE | -12 | The account creating this offer does not have enough XLM to satisfy the minimum XLM reserve increase caused by adding a subentry and still satisfy its XLM selling liabilities. For every offer an account creates, the minimum amount of XLM that account must hold will increase. |

## Set Options
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.setOptions) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/SetOptionsOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/txnbuild#SetOptions)

Sets options for an account, such as setting the inflation destination or adding an additional
signer on an account.

Allows you to set multiple options on an account in a single operation, such as
changing an operation threshold and setting the flags on an account at the same time.

For more information on the options related to signing, see our docs on
[multi-sig](./multi-sig.md).

When updating signers or other thresholds, the threshold of this operation is High.

Threshold: Medium or High

Result: `SetOptionsResult`

Parameters:

|Parameters| Type| Description|
| --- | --- | --- |
|Inflation Destination| account ID| Account of the inflation destination.|
|Clear flags| integer| Indicates which flags to clear. For details about the flags, please refer to the [accounts doc](./accounts.md). The bit mask integer subtracts from the existing flags of the account. This allows for setting specific bits without knowledge of existing flags.|
|Set flags| integer| Indicates which flags to set. For details about the flags, please refer to the [accounts doc](./accounts.md). The bit mask integer adds onto the existing flags of the account. This allows for setting specific bits without knowledge of existing flags.|
|Master weight| integer| A number from 0-255 (inclusive) representing the weight of the master key. If the weight of the master key is updated to 0, it is effectively disabled.|
|Low threshold| integer| A number from 0-255 (inclusive) representing the threshold this account sets on all operations it performs that have [a low threshold](./multi-sig.md).|
|Medium threshold| integer| A number from 0-255 (inclusive) representing the threshold this account sets on all operations it performs that have [a medium threshold](./multi-sig.md).|
|High threshold| integer| A number from 0-255 (inclusive) representing the threshold this account sets on all operations it performs that have [a high threshold](./multi-sig.md). |
|Home domain| string| Sets the home domain of an account. See [Federation](./federation.md).|
|Signer| {Public Key, weight}| Add, update, or remove a signer from an account. Signer weight is a number from 0-255 (inclusive). The signer is deleted if the weight is 0.|

Possible errors:

| Error | Code | Description |
| ----- | ---- | ------|
|SET_OPTIONS_LOW_RESERVE| -1| This account does not have enough XLM to satisfy the minimum XLM reserve increase caused by adding a subentry and still satisfy its XLM selling liabilities. For every new signer added to an account, the minimum reserve of XLM that account must hold increases.|
|SET_OPTIONS_TOO_MANY_SIGNERS| -2| 20 is the maximum number of signers an account can have, and adding another signer would exceed that.|
|SET_OPTIONS_BAD_FLAGS| -3| The flags set and/or cleared are invalid by themselves or in combination.|
|SET_OPTIONS_INVALID_INFLATION| -4| The destination account set in the `inflation` field does not exist.|
|SET_OPTIONS_CANT_CHANGE| -5| This account can no longer change the option it wants to change.|
|SET_OPTIONS_UNKNOWN_FLAG| -6| The account is trying to set a flag that is unknown.|
|SET_OPTIONS_THRESHOLD_OUT_OF_RANGE| -7| The value for a key weight or threshold is invalid.|
|SET_OPTIONS_BAD_SIGNER| -8| Any additional signers added to the account cannot be the master key.|
|SET_OPTIONS_INVALID_HOME_DOMAIN| -9| Home domain is malformed.|

## Change Trust
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.changeTrust) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/ChangeTrustOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/txnbuild#ChangeTrust)

Creates, updates, or deletes a trustline.  For more on trustlines, please refer to the [assets documentation](./assets.md).

To delete an existing trustline, set Line to the asset of the trustline, and Limit to `0`.

Threshold: Medium

Result: `ChangeTrustResult`

|Parameters| Type| Description|
| --- | --- | --- |
|Line| asset| The asset of the trustline.  For example, if a user extends a trustline of up to 200 USD to an anchor, the `line` is USD:anchor.|
|Limit| integer| The limit of the trustline.  In the previous example, the `limit` would be 200.|

Possible errors:

| Error | Code | Description |
| ----- | ---- | ------|
|CHANGE_TRUST_MALFORMED| -1| The input to this operation is invalid.|
|CHANGE_TRUST_NO_ISSUER| -2| The issuer of the asset cannot be found.|
|CHANGE_TRUST_INVALID_LIMIT| -3| The `limit` is not sufficient to hold the current balance of the trustline and still satisfy its buying liabilities.|
|CHANGE_TRUST_LOW_RESERVE| -4| This account does not have enough XLM to satisfy the minimum XLM reserve increase caused by adding a subentry and still satisfy its XLM selling liabilities. For every new trustline added to an account, the minimum reserve of XLM that account must hold increases.|
| CHANGE_TRUST_SELF_NOT_ALLOWED | -5 | The source account attempted to create a trustline for itself, which is not allowed. |

## Allow Trust
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.allowTrust) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/AllowTrustOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/txnbuild#AllowTrust)

Updates the `authorized` flag of an existing trustline. This can only be called by the issuer of a trustline's [asset](./assets.md), and only when `AUTHORIZATION REQUIRED` (at the minimum) has been set on the issuer's account.

The issuer can only clear the `authorized` flag if the issuer has the `AUTH_REVOCABLE_FLAG` set. Otherwise, the issuer can only set the `authorized` flag.

If the issuer clears the `authorized` flag, all offers owned by the `trustor` that are either selling `type` or buying `type` will be deleted. *(Protocol v10 and above)*

Threshold: Low

Result: `AllowTrustResult`

| Parameters | Type | Description |
| --- | --- | --- |
| Trustor | account ID | The account of the recipient of the trustline. |
| Type | asset code | The 4 or 12 character-maximum asset code of the trustline the source account is authorizing. For example, if an issuing account wants to allow another account to hold its USD credit, the `type` is `USD`. |
| Authorize | boolean | Flag indicating whether the trustline is authorized. |

Possible errors:

| Error | Code | Description |
| ----- | ---- | ------|
| ALLOW_TRUST_MALFORMED | -1 | The asset specified in `type` is invalid. In addition, this error happens when the native asset is specified. |
|ALLOW_TRUST_NO_TRUST_LINE| -2| The `trustor` does not have a trustline with the issuer performing this operation.|
|ALLOW_TRUST_TRUST_NOT_REQUIRED| -3| The source account (issuer performing this operation) does not require trust.  In other words, it does not have the flag `AUTH_REQUIRED_FLAG` set.|
|ALLOW_TRUST_CANT_REVOKE| -4| The source account is trying to revoke the trustline of the `trustor`, but it cannot do so.|
| ALLOW_TRUST_SELF_NOT_ALLOWED | -5 | The source account attempted to allow a trustline for itself, which is not allowed because an account cannot create a trustline with itself. |

## Account Merge
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.accountMerge) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/AccountMergeOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/txnbuild#AccountMerge)

Transfers the native balance (the amount of XLM an account holds) to another account and removes the source account from the ledger.

Threshold: High

Result: `AccountMergeResult`

|Parameters| Type| Description|
| --- | --- | --- |
|Destination| account ID| The account that receives the remaining XLM balance of the source account.|

Possible errors:

| Error | Code | Description |
| ----- | ---- | ------|
|ACCOUNT_MERGE_MALFORMED| -1| The operation is malformed because the source account cannot merge with itself. The `destination` must be a different account.|
|ACCOUNT_MERGE_NO_ACCOUNT| -2| The `destination` account does not exist.|
|ACCOUNT_MERGE_IMMUTABLE_SET| -3| The source account has `AUTH_IMMUTABLE` flag set.|
|ACCOUNT_MERGE_HAS_SUB_ENTRIES | -4| The source account has trust lines/offers.|
|ACCOUNT_MERGE_SEQNUM_TOO_FAR | -5| Source's account sequence number is too high. It must be less than `(ledgerSeq << 32) = (ledgerSeq * 0x100000000)`. *(protocol version 10 and above)*|
|ACCOUNT_MERGE_DEST_FULL| -6| The `destination` account cannot receive the balance of the source account and still satisfy its lumen buying liabilities. *(protocol version 10 and above)*|

## Inflation
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.inflation) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/InflationOperation.html) | [Go](https://godoc.org/github.com/stellar/go/txnbuild#Inflation)

Runs the inflation process for the entire Stellar network.

Anyone can submit the Inflation operation that triggers the inflation process on the Stellar
Network. Because it can only be run once a week, this operation will fail if the network has
already had inflation processed within the past week.

Threshold: Low

Result: `InflationResult`

Possible errors:

| Error | Code | Description |
| ----- | ---- | ------|
|INFLATION_NOT_TIME| -1| Inflation only runs once a week. This failure means it is not time for a new inflation round yet.|

## Manage Data
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.manageData) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/ManageDataOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/txnbuild#ManageData)

Sets, modifies, or deletes a data entry (name/value pair) that is attached to a particular account.

An account can have a large amount of data entries attached to it (subject to sub-entry limits for
an account). Each data entry increases the minimum balance (via the base reserve) needed to be held
by the account.

Data entries can be used for storing application-specific data on the Stellar Network. They are not
used by the core Stellar Protocol.

Threshold: Medium

Result: `ManageDataResult`

|Parameters| Type| Description|
| --- | --- | --- |
|Name| string | String up to 64 bytes long. If this is a new Name it will add the given name/value pair to the account. If this Name is already present then the associated value will be modified.  |
|Value| binary data | (optional) If not present then the existing Name will be deleted. If present then this value will be set in the DataEntry. Up to 64 bytes long.  |

Possible errors:

| Error | Code | Description |
| ----- | ---- | ------|
|MANAGE_DATA_NOT_SUPPORTED_YET| -1| The network hasn't moved to this protocol change yet. This failure means the network doesn't support this feature yet.|
|MANAGE_DATA_NAME_NOT_FOUND| -2| Trying to remove a Data Entry that isn't there. This will happen if Name is set (and Value isn't) but the Account doesn't have a DataEntry with that Name.|
|MANAGE_DATA_LOW_RESERVE| -3| This account does not have enough XLM to satisfy the minimum XLM reserve increase caused by adding a subentry and still satisfy its XLM selling liabilities. For every new DataEntry added to an account, the minimum reserve of XLM that account must hold increases.|
|MANAGE_DATA_INVALID_NAME| -4| Name not a valid string.|

## Bump Sequence
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.bumpSequence) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/BumpSequenceOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/txnbuild#BumpSequence)

*Only available in Stellar Protocol >= v10*

Bumps forward the sequence number of the source account to the given sequence number.

This operation invalidates any transactions with a smaller sequence number, and is
often utilized in complex contracting scenarios.

If the specified `bumpTo` sequence number is greater than the source account's sequence number,
the account's sequence number is updated with that value, otherwise it's not modified.

Threshold: Low

Result: `BumpSequenceResult`

|Parameters| Type| Description|
| --- | --- | --- |
|bumpTo| SequenceNumber| desired value for the operation's source account sequence number.|

Possible errors:

| Error | Code | Description |
| ----- | ---- | ------|
|BUMP_SEQUENCE_BAD_SEQ| -1| The specified `bumpTo` sequence number is not a valid sequence number. It must be between 0 and `INT64_MAX` (9223372036854775807 or 0x7fffffffffffffff).|
