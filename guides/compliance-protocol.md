---
title: Compliance Protocol
---

# Compliance Protocol

_Note, for most use cases, we actually recommend the workflow specified in [SEP-0006][sep-0006]
and [SEP-0012][sep-0012] instead of [SEP-0003][sep-0003] (which is described below). In the near
future, we'll be revamping this doc to support a [SEP-0012][sep-0012] workflow. For more
information, see our [documentation on stablecoins in
Stellar](./walkthroughs/connect-to-wallets.md)_.

Complying with Anti-Money Laundering (AML) laws requires financial institutions (FIs) to know not
only who their customers are sending money to but who their customers are receiving money from. In
some jurisdictions banks are able to trust the AML procedures of other licensed banks. In other
jurisdictions each bank must do its own sanction checking of both the sender and the receiver. The
Compliance Protocol handles all these scenarios.

The Compliance Protocol ([SEP-0003][sep-0003]) is an optional, additional protocol to adhere to
after [federation](./concepts/federation.md) that aids organizations in sharing AML information.

[SEP-0009][sep-0009] specifies standard customer information fields that are exchanged between FIs
via the Compliance Protocol.  The most common fields are:

* First Name
* Last Name
* Date of Birth
* Physical Address

## General Workflow

The standard process for financial institutions to interact with each other via the Compliance
Protocol is as follows:

1. Each organization that wishes to receive funds and participate in the compliance protocol
   creates an `AUTH_SERVER` and adds its location (URL) to the institution's
   [stellar.toml](https://www.stellar.org/developers/guides/concepts/stellar-toml.html).
2. The sending FI contacts the receiving FI's `AUTH_SERVER` providing information on the sender,
   whether it needs AML information on the recipient, the unsigned transaction, and any additional
   attachments.
3. The receiving FI responds with whether they're willing to send AML information on the recipient
   and whether they'll accept the payment, along with additional information pertaining to their
   response (such as sending along the AML information of the recipient).

You are free create to implement your own web service that implements the compliance protocol, but
we recommend that you use our [pre-built compliance
service](https://github.com/stellar/go/blob/master/services/compliance/).

## Implementation

### AUTH_SERVER

The `AUTH_SERVER` provides a single web endpoint where a compliance request can be sent. The URL is
up to you and where you host this service, but a simple example would be
`https://[YOUR_HOSTNAME]/aml`. Once established, you'll need to add this URL to your
[stellar.toml](./concepts/stellar-toml.md) under the `AUTH_SERVER` key. See [SEP-0001][sep-0001]
for more information.

### Sending A Request

To send a compliance request to the receiving financial institution, submit an HTTP POST
request to the receiving institution's AUTH_SERVER with the following specification:

* `Content-Type` should equal `application/x-www-form-urlencoded`
* The body of the request should be `data=<data value>&sig=<sig value>`

#### Request Components

`data` is a block of JSON that contains the following fields:

| Name | Data Type | Description |
|------|-----------|-------------|
| `sender` | string | The payment address of the customer that is initiating the send. Ex. `bob*bank.com` |
| `need_info` | boolean | If the caller needs the recipient's AML info in order to send the payment. |
| `tx` | string: base64 encoded [xdr.Transaction](https://github.com/stellar/stellar-core/blob/4961b8bb4a64c68838632c5865389867e9f02840/src/xdr/Stellar-transaction.x#L297-L322) | The transaction that the sender would like to send in XDR format. This transaction is unsigned and its sequence number should be equal `0`. |
| `attachment` | string | The full text of the attachment. The hash of this attachment is included as a memo in the transaction. The **attachment** field follows the [Stellar Attachment Convention](https://www.stellar.org/developers/guides/attachment.html) and should contain at least enough information for the sender to allow the receiving FI to do their sanction check. |

`sig` is the signature of the data block made by the sending FI. The receiving institution should
check that this signature is valid against the public signature key that is posted in the sending
FI's [stellar.toml](./concepts/stellar-toml.md) (`SIGNING_KEY` field).

#### Example Request

Example request body (please note it contains both parameters `data` and `sig`):
```
data=%7B%22sender%22%3A%22aldi%2Abanksender.com%22%2C%22need_info%22%3Atrue%2C%22tx%22%3A%22AAAAAEhAArfpmUJYq%2FQ9SFAH3YDzNLJEBI9i9TXmJ7s608xbAAAAZAAMon0AAAAJAAAAAAAAAAPUg1%2FwDrMDozn8yfiCA8LLC0wF10q5n5lo0GiFQXpPsAAAAAEAAAAAAAAAAQAAAADdvkoXq6TXDV9IpguvNHyAXaUH4AcCLqhToJpaG6cCyQAAAAAAAAAAAJiWgAAAAAA%3D%22%2C%22attachment%22%3A%22%7B%5C%22nonce%5C%22%3A%5C%221488805458327055805%5C%22%2C%5C%22transaction%5C%22%3A%7B%5C%22sender_info%5C%22%3A%7B%5C%22address%5C%22%3A%5C%22678+Mission+St%5C%22%2C%5C%22city%5C%22%3A%5C%22San+Francisco%5C%22%2C%5C%22country%5C%22%3A%5C%22US%5C%22%2C%5C%22first_name%5C%22%3A%5C%22Aldi%5C%22%2C%5C%22last_name%5C%22%3A%5C%22Dobbs%5C%22%7D%2C%5C%22route%5C%22%3A%5C%221%5C%22%2C%5C%22note%5C%22%3A%5C%22%5C%22%2C%5C%22extra%5C%22%3A%5C%22%5C%22%7D%2C%5C%22operations%5C%22%3Anull%7D%22%7D&sig=KgvyQTZsZQoaMy8jdwCUfLayfgfFMUdZJ%2B0BIvEwiH5aJhBXvhV%2BipRok1asjSCUS%2FUaGeGKDoizS1%2BtFiiyAA%3D%3D
```

After decoding the `data` parameter it has a following form:

```json
{
  "sender": "aldi*banksender.com",
  "need_info": true,
  "tx": "AAAAAEhAArfpmUJYq/Q9SFAH3YDzNLJEBI9i9TXmJ7s608xbAAAAZAAMon0AAAAJAAAAAAAAAAPUg1/wDrMDozn8yfiCA8LLC0wF10q5n5lo0GiFQXpPsAAAAAEAAAAAAAAAAQAAAADdvkoXq6TXDV9IpguvNHyAXaUH4AcCLqhToJpaG6cCyQAAAAAAAAAAAJiWgAAAAAA=",
  "attachment": "{\"nonce\":\"1488805458327055805\",\"transaction\":{\"sender_info\":{\"address\":\"678 Mission St\",\"city\":\"San Francisco\",\"country\":\"US\",\"first_name\":\"Aldi\",\"last_name\":\"Dobbs\"},\"route\":\"1\",\"note\":\"\",\"extra\":\"\"},\"operations\":null}"
}
```

A few things to note:

- `memo` value of `tx` is a SHA256 hash of the attachment.
- `nonce` is unique to each individual transaction. When a transaction on the receiving end is
  `pending`, the same `nonce` should be sent to fetch updates about the `pending` transaction

### Server Response

The receiving institution's `AUTH_SERVER` will return a JSON object with the following fields:

| Name | Data Type | Description |
| -----|-----------|------------ |
| `info_status` | `ok`, `denied`, `pending` | If the receiving institution is willing to share AML information or not. |
| `tx_status` | `ok`, `denied`, `pending` | If the receiving institution is willing to accept this transaction. |
| `dest_info` | string | Marshalled JSON of the recipient's AML information. *(only present if `info_status` is `ok`)* |
| `error` | string | Error message *(only present if `info_status` or `tx_status` is `error` or for internal server errors)* |
| `pending` | integer | Estimated number of seconds till the sender can check back for a change in status. The sender should just resubmit this request after the given number of seconds. *(only present if `info_status` or `tx_status` is `pending`)* |

HTTP status code must be equal:
* `200 OK` if both `info_status` and `tx_status` are `ok`.
* `202 Accepted` if both statuses are `pending` or one is `pending` and second `ok`.
* `400 Bad Request` if data sent by the sender is invalid.
* `403 Forbidden` if any of `info_status` and `tx_status` are `denied`.
* `500 Internal Server Error` for server side errors.

Examples:

```
200 OK
```
```json
{
    "info_status": "ok",
    "tx_status": "ok",
    "dest_info": "{\"name\": \"John Doe\"}"
}
```
---
```
202 Accepted
```
```json
{
    "info_status": "ok",
    "tx_status": "pending",
    "dest_info": "{\"name\": \"John Doe\"}",
    "pending": 3600
}
```
---
```
400 Bad Request
```
```json
{
    "info_status": "ok",
    "tx_status": "error",
    "error": "Invalid country code."
}
```
---
```
403 Forbidden
```
```json
{
    "info_status": "deny",
    "tx_status": "ok"
}
```
---
```
500 Internal Server Error
```
```json
{
    "error": "Internal server error"
}
```


## Putting It All Together
In this example, Aldi (`aldi*banksender.com`) wants to send to Bogart (`bogart*bankreceiver.com`).
If you haven't read up on [Federation](./concepts/federation.md) yet, we'd suggest you start there
first.

**1) BankSender fetches BankReceiver's stellar.toml file**

This is done to get BankReceiver's `AUTH_SERVER`, `FEDERATION_SERVER`, and other important
information for BankSender to interact with BankReceiver.

BankReceiver's stellar.toml should be hosted at
`https://bankreceiver.com/.well-known/stellar.toml`.

**2) BankSender gets the routing info for Bogart so it can build the transaction**

This is done by asking BankReceiver's federation server to resolve `bogart*bankreceiver.com`.

BankSender sends an HTTP GET request to `[FEDERATION_SERVER]?type=name&q=bogart*bankreceiver.com`

See [Federation](./concepts/federation.md) for a complete description. The returned fields of
interest here are:
 - Stellar AccountID of Bogart's FI (BankReceiver).
 - Bogart's routing info at BankReceiver.

Example federation response:
```json
{
  "stellar_address": "bogart*bankreceiver.com",
  "account_id": "GDJ2GYMIQRIPTJZXQAVE5IM675ITLBAMQJS7AEFIWM4HZNGHVXOZ3TZK",
  "memo_type": "id",
  "memo": 1
}
```

**3) BankSender makes the Auth (Compliance) Request to BankReceiver**

This request will ask BankReceiver for Bogart's AML info and for permission to send a transaction
from Aldi to Bogart.

BankSender -> `AUTH_SERVER`

Example request body (it contains both `data` and `sig`):

```
data=%7B%22sender%22%3A%22aldi%2Abanksender.com%22%2C%22need_info%22%3Atrue%2C%22tx%22%3A%22AAAAAEhAArfpmUJYq%2FQ9SFAH3YDzNLJEBI9i9TXmJ7s608xbAAAAZAAMon0AAAAJAAAAAAAAAAPUg1%2FwDrMDozn8yfiCA8LLC0wF10q5n5lo0GiFQXpPsAAAAAEAAAAAAAAAAQAAAADdvkoXq6TXDV9IpguvNHyAXaUH4AcCLqhToJpaG6cCyQAAAAAAAAAAAJiWgAAAAAA%3D%22%2C%22attachment%22%3A%22%7B%5C%22nonce%5C%22%3A%5C%221488805458327055805%5C%22%2C%5C%22transaction%5C%22%3A%7B%5C%22sender_info%5C%22%3A%7B%5C%22address%5C%22%3A%5C%22678+Mission+St%5C%22%2C%5C%22city%5C%22%3A%5C%22San+Francisco%5C%22%2C%5C%22country%5C%22%3A%5C%22US%5C%22%2C%5C%22first_name%5C%22%3A%5C%22Aldi%5C%22%2C%5C%22last_name%5C%22%3A%5C%22Dobbs%5C%22%7D%2C%5C%22route%5C%22%3A%5C%221%5C%22%2C%5C%22note%5C%22%3A%5C%22%5C%22%2C%5C%22extra%5C%22%3A%5C%22%5C%22%7D%2C%5C%22operations%5C%22%3Anull%7D%22%7D&sig=KgvyQTZsZQoaMy8jdwCUfLayfgfFMUdZJ%2B0BIvEwiH5aJhBXvhV%2BipRok1asjSCUS%2FUaGeGKDoizS1%2BtFiiyAA%3D%3D
```

After decoding the `data` parameter it has a following form:

```json
{
  "sender": "aldi*banksender.com",
  "need_info": true,
  "tx": "AAAAAEhAArfpmUJYq/Q9SFAH3YDzNLJEBI9i9TXmJ7s608xbAAAAZAAMon0AAAAJAAAAAAAAAAPUg1/wDrMDozn8yfiCA8LLC0wF10q5n5lo0GiFQXpPsAAAAAEAAAAAAAAAAQAAAADdvkoXq6TXDV9IpguvNHyAXaUH4AcCLqhToJpaG6cCyQAAAAAAAAAAAJiWgAAAAAA=",
  "attachment": "{\"nonce\":\"1488805458327055805\",\"transaction\":{\"sender_info\":{\"address\":\"678 Mission St\",\"city\":\"San Francisco\",\"country\":\"US\",\"first_name\":\"Aldi\",\"last_name\":\"Dobbs\"},\"route\":\"1\",\"note\":\"\",\"extra\":\"\"},\"operations\":null}"
}
```

Please note that the memo value of `tx` is the SHA256 hash of the attachment, and the payment
destination is what is returned by the federation server. You can check the transaction above using
the [XDR
Viewer](https://www.stellar.org/laboratory/#xdr-viewer?input=AAAAAEhAArfpmUJYq%2FQ9SFAH3YDzNLJEBI9i9TXmJ7s608xbAAAAZAAMon0AAAAJAAAAAAAAAAPUg1%2FwDrMDozn8yfiCA8LLC0wF10q5n5lo0GiFQXpPsAAAAAEAAAAAAAAAAQAAAADdvkoXq6TXDV9IpguvNHyAXaUH4AcCLqhToJpaG6cCyQAAAAAAAAAAAJiWgAAAAAA%3D&type=Transaction&network=test).

**4) BankReceiver handles the Auth request and sends a response to BankSender**

1. BankReceiver gets sender domain by spliting the sender address (`aldi*banksender.com`) in 2 parts: `aldi` and `banksender.com`
2. BankReceiver also fetches BandSender's stellar.toml file at
  `https://banksender.com/.well-known/stellar.toml`. This is done to get BankSender's
  `SIGNING_KEY`.
3. BankReceiver verifies the signature (the `sig` field) on the Auth Request was signed with
   BankSender's `SIGNING_KEY`.
4. BankReceiver does its sanction check on Aldi (the sender) utilizing its own AML/KYC
   infrastructure, defined outside of the Stellar protocol. This determines the value of
   `tx_status` in the response.
5. BankReceiver makes the decision to reveal the AML info of Bogart if any of the following
   criteria apply:
  - Bogart has made their info public.
  - Bogart has allowed BankSender for transactions.
  - Bogart has allowed Aldi for transactions.
  - BankReceiver has allowed BankSender for transactions.
6. If none of the above criteria are met, BankReceiver should ask Bogart if he wants to reveal this
   info to BankSender and accept this payment. In this case BankReceiver will return `info_status:
   "pending"` in the Auth request reply to give Bogart time to accept the payment or not.
7. If BankReceiver determines it can share the AML info with BankSender, it sends this info in
   `dest_info` field with the reply.

See the [Auth Server response](#server-response) section for potential return values.

Example Response:

```json
{
    "info_status": "ok",
    "tx_status": "ok",
    "dest_info": "{\"name\": \"Bogart Doe\"}",
}
```

**5) BankSender handles the reply from the Auth request**

If the call to the AUTH_SERVER returned `pending`, BankSender must resubmit the request again after
the estimated number of seconds in the response.

**6) BankSender does AML checks on the receiver (Bogart)**

Once BankSender has been given the `dest_info` from BankReceiver, BankSender does the sanction
check using Bogart's AML info. If the AML/KYC check passes, BankSender signs and submits the
transaction to the Stellar network.

**7) BankReceiver handles the incoming payment.**

- BankReceiver checks the transaction hash against a cache it has or redoes the sanction check on the sender
  (it's up to the receiving FI to implement any caching for performance).
- BankReceiver credits Bogart's account with the amount sent or sends the transaction back.

## Testing Your Auth Server

To test and verify that your application adheres to the Stellar Compliance Protocol, please visit
[our compliance verification tool](https://gostellar.org/app/). With the tool you can run a variety
of tests for different compliance scenarios for both sending and receiving assets. In addition, the
[Stellar Laboratory](https://www.stellar.org/laboratory/) also exists to run operations and inspect
the ledger for additional information.

## Reference Implementations

* [Reference Compliance
  server](https://github.com/stellar/go/tree/master/services/compliance/) developed by
  Stellar Development Foundation.
* [Compliance Structures](https://github.com/stellar/go/tree/master/protocols/compliance).

[sep-0001]: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md
[sep-0003]: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0003.md
[sep-0006]: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0006.md
[sep-0009]: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0009.md
[sep-0012]: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0012.md
