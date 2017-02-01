---
title: Compliance Protocol
---

# Compliance Protocol

Complying with Anti-Money Laundering (AML) laws requires financial institutions (FIs) to know not only who their customers are sending money to but who their customers are receiving money from. In some jurisdictions banks are able to trust the AML procedures of other licensed banks. In other jurisdictions each bank must do its own sanction checking of both the sender and the receiver.
The Compliance Protocol handles all these scenarios.

The customer information that is exchanged between FIs is flexible but the typical fields are:
 - Full Name
 - Date of birth
 - Physical address

The Compliance Protocol is an additional step after [federation](https://www.stellar.org/developers/guides/concepts/federation.html). In this step the sending FI contacts the receiving FI to get permission to send the transaction. To do this the receiving FI creates an `AUTH_SERVER` and adds it's location to the [stellar.toml](https://www.stellar.org/developers/guides/concepts/stellar-toml.html) of the FI.

You can create your own endpoint that implements the compliance protocol or we have also created this [simple compliance service](https://github.com/stellar/bridge-server/blob/master/readme_compliance.md) that you can use.

## AUTH_SERVER

The `AUTH_SERVER` provides one endpoint that is called by a sending FI to get approval to send a payment to one of the receiving FI's customers. The `AUTH_SERVER` url should be placed in organization's [stellar.toml](https://www.stellar.org/developers/guides/concepts/stellar-toml.html) file.

#### Request

To send transaction data to the receiving organization, send HTTP POST to `AUTH_SERVER` with `Content-Type` equal `application/x-www-form-urlencoded` and the following body:
```
data=<data value>&sig=<sig value>
```

**data** is a block of JSON that contains the following fields:

Name | Data Type | Description
-----|-----------|------------
`sender` | string | The payment address of the customer that is initiating the send. Ex. `bob*bank.com`
`need_info` | boolean | If the caller needs the recipient's AML info in order to send the payment.
`tx` | string: base64 encoded [xdr.Transaction](https://github.com/stellar/stellar-core/blob/4961b8bb4a64c68838632c5865389867e9f02840/src/xdr/Stellar-transaction.x#L297-L322) | The transaction that the sender would like to send in XDR format. This transaction is unsigned.
`attach` | string | The full text of the attachment. The hash of this attachment is included as a memo in the transaction. The **attach** field follows the [Stellar Attachment Convention](./attachment.md) and should contain at least enough information of the sender to allow the receiving FI to do their sanction check.

**sig** is the signature of the data block made by the sending FI. The receiving institution should check that this signature is valid against the public signature key that is posted in the sending FI's [stellar.toml](https://www.stellar.org/developers/guides/concepts/stellar-toml.html) (`SIGNING_KEY` field).

Example request body (please note it contains both parameters `data` and `sig`):
```
data=%7B%22sender%22%3A%22aldi*bankA.com%22%2C%22need_info%22%3Atrue%2C%22tx%22%3A%22AAAAACWmRKivpIAYP04lBlY1vwsVqzhHysdzPRKquPDyi0LBAAAAZAAAAAAAAABkAAAAAAAAAAMyQ9plXwM8%2FmUo8%2F2RP7UQh0qX%2F2xW4r6F8KwDbKhlawAAAAEAAAAAAAAAAQAAAADTo2GIhFD5pzeAKk6hnv9RNYQMgmXwEKizOHy0x63dnQAAAAAAAAACVAvkAAAAAAA%3D%22%2C%22memo%22%3A%22%7B%22transaction%22%3A%20%7B%22route%22%3A%20%22bogart*bankB.com%22%2C%20%22sender_info%22%3A%20%22%7B%5C%22name%5C%22%3A%20%5C%22Aldi%20Dobbs%5C%22%2C%20%5C%22address%5C%22%3A%20%5C%22678%20Mission%20St%2C%20San%20Francisco%2C%20CA%5C%22%7D%22%7D%7D%22%7D&sig=rphsdQJQPvKU7gF%2FwpmeeId9tJUM3eNqB%2FgaQykGO6IHcfpePquRBdwkxZuYVTRNtQlK3GrU%2FxvY5KoX3mQMBA%3D%3D
```

After decoding the `data` parameter it has a following form:

```json
{
  "sender": "aldi*bankA.com",
  "need_info": true,
  "tx": "AAAAACWmRKivpIAYP04lBlY1vwsVqzhHysdzPRKquPDyi0LBAAAAZAAAAAAAAABkAAAAAAAAAAMyQ9plXwM8/mUo8/2RP7UQh0qX/2xW4r6F8KwDbKhlawAAAAEAAAAAAAAAAQAAAADTo2GIhFD5pzeAKk6hnv9RNYQMgmXwEKizOHy0x63dnQAAAAAAAAACVAvkAAAAAAA=",
  "attach": "{\"transaction\": {\"route\": \"bogart*bankB.com\", \"sender_info\": \"{\\\"name\\\": \\\"Aldi Dobbs\\\", \\\"address\\\": \\\"678 Mission St, San Francisco, CA\\\"}\"}}"
}
```

Please note that the memo value of `tx` is a sha256 hash of the attachment. You can check the transaction above using [XDR Viewer](https://www.stellar.org/laboratory/#xdr-viewer?input=AAAAACWmRKivpIAYP04lBlY1vwsVqzhHysdzPRKquPDyi0LBAAAAZAAAAAAAAABkAAAAAAAAAAMyQ9plXwM8%2FmUo8%2F2RP7UQh0qX%2F2xW4r6F8KwDbKhlawAAAAEAAAAAAAAAAQAAAADTo2GIhFD5pzeAKk6hnv9RNYQMgmXwEKizOHy0x63dnQAAAAAAAAACVAvkAAAAAAA%3D&type=Transaction&network=test).

#### Response

`AUTH_SERVER` will return a JSON object with the following fields:

Name | Data Type | Description
-----|-----------|------------
`info_status` | `ok`, `denied`, `pending` | If this FI is willing to share AML information or not.
`tx_status` | `ok`, `denied`, `pending` | If this FI is willing to accept this transaction.
`dest_info` | string | *(only present if `info_status` is `ok`)* Marshalled JSON of the recipient's AML information in the [memo preimage](./memo-preimage.md).
`pending` | integer | *(only present if `info_status` or `tx_status` is `pending`)* Estimated number of seconds till the sender can check back for a change in status. The sender should just resubmit this request after the given number of seconds.

*Response Example*

```json
{
    "info_status": "ok",
    "tx_status": "pending",
    "dest_info": "{\"name\": \"John Doe\"}",
    "pending": 3600
}
```


----



## Example of Flow
In this example, Aldi `aldi*bankA.com` wants to send to Bogart `bogart*bankB.com`:

**1) BankA gets the info needed to interact with BankB**

This is done by looking up BankB's `stellar.toml` file.

BankA  -> fetches `https://bankB.com/.well-known/stellar.toml`

from this .toml file it pulls out the following info for BankB:
 - `FEDERATION_SERVER`
 - `AUTH_SERVER`

**2) BankA gets the routing info for Bogart so it can build the transaction**

This is done by asking BankB's federation server to resolve `bogart*bankB.com`.

BankA -> `FEDERATION_SERVER?type=name&q=bogart*bankB.com`

See [Federation](https://www.stellar.org/developers/guides/concepts/federation.html) for a complete description. The returned fields of interest here are:
 - Stellar AccountID of Bogart's FI
 - Bogart's routing info

Example federation response:
```json
{
  "stellar_address": "bogart*bankB.com",
  "account_id": "GDJ2GYMIQRIPTJZXQAVE5IM675ITLBAMQJS7AEFIWM4HZNGHVXOZ3TZK"
}
```

**3) BankA makes the Auth Request to BankB**

This request will ask BankB for Bogart's AML info and for permission to send to Bogart.

BankA -> `AUTH_SERVER`

Example request body (please note it contains both parameters `data` and `sig`):
```
data=%7B%22sender%22%3A%22aldi*bankA.com%22%2C%22need_info%22%3Atrue%2C%22tx%22%3A%22AAAAACWmRKivpIAYP04lBlY1vwsVqzhHysdzPRKquPDyi0LBAAAAZAAAAAAAAABkAAAAAAAAAAMyQ9plXwM8%2FmUo8%2F2RP7UQh0qX%2F2xW4r6F8KwDbKhlawAAAAEAAAAAAAAAAQAAAADTo2GIhFD5pzeAKk6hnv9RNYQMgmXwEKizOHy0x63dnQAAAAAAAAACVAvkAAAAAAA%3D%22%2C%22memo%22%3A%22%7B%22transaction%22%3A%20%7B%22route%22%3A%20%22bogart*bankB.com%22%2C%20%22sender_info%22%3A%20%22%7B%5C%22name%5C%22%3A%20%5C%22Aldi%20Dobbs%5C%22%2C%20%5C%22address%5C%22%3A%20%5C%22678%20Mission%20St%2C%20San%20Francisco%2C%20CA%5C%22%7D%22%7D%7D%22%7D&sig=rphsdQJQPvKU7gF%2FwpmeeId9tJUM3eNqB%2FgaQykGO6IHcfpePquRBdwkxZuYVTRNtQlK3GrU%2FxvY5KoX3mQMBA%3D%3D
```

After decoding `data` parameter it has a following form:

```json
{
  "sender": "aldi*bankA.com",
  "need_info": true,
  "tx": "AAAAACWmRKivpIAYP04lBlY1vwsVqzhHysdzPRKquPDyi0LBAAAAZAAAAAAAAABkAAAAAAAAAAMyQ9plXwM8/mUo8/2RP7UQh0qX/2xW4r6F8KwDbKhlawAAAAEAAAAAAAAAAQAAAADTo2GIhFD5pzeAKk6hnv9RNYQMgmXwEKizOHy0x63dnQAAAAAAAAACVAvkAAAAAAA=",
  "memo": "{\"transaction\": {\"route\": \"bogart*bankB.com\", \"sender_info\": \"{\\\"name\\\": \\\"Aldi Dobbs\\\", \\\"address\\\": \\\"678 Mission St, San Francisco, CA\\\"}\"}}"
}
```

Please note that memo value of `tx` is the sha256 hash of the attachment and payment destination is returned by the federation server. You can check the transaction above using the [XDR Viewer](https://www.stellar.org/laboratory/#xdr-viewer?input=AAAAACWmRKivpIAYP04lBlY1vwsVqzhHysdzPRKquPDyi0LBAAAAZAAAAAAAAABkAAAAAAAAAAMyQ9plXwM8%2FmUo8%2F2RP7UQh0qX%2F2xW4r6F8KwDbKhlawAAAAEAAAAAAAAAAQAAAADTo2GIhFD5pzeAKk6hnv9RNYQMgmXwEKizOHy0x63dnQAAAAAAAAACVAvkAAAAAAA%3D&type=Transaction&network=test).

**4) BankB handles the Auth request**

 - BankB gets sender domain by spliting the sender address (`aldi*bankA.com`) in 2 parts: `aldi` and `bankA.com`
 - BankB -> fetches `https://bankA.com/.well-known/stellar.toml`
   From this it gets BankA's `SIGNING_KEY`
 - BankB verifies the signature on the Auth Request was signed with BankA's `SIGNING_KEY`
 - BankB does its sanction check on Aldi. This determines the value of `tx_status`.
 - BankB makes the decision to reveal the AML info of Bogart or not based on the following:
   - Bogart has made their info public
   - Bogart has allowed BankA
   - Bogart has allowed Aldi
   - BankB has allowed BankA
 - If none of the above criteria are met, BankB should ask Bogart if he wants to reveal this info to BankA and accept this payment. In this case BankB will return `info_status: "pending"` in the Auth request reply to give Bogart time to accept the payment or not.
 - If BankB determines it can share the AML info with BankA, it sends this info in `dest_info` field with the reply.

See [Auth Server response](#response) for potential return values.

Example Response:

```json
{
    "info_status": "ok",
    "tx_status": "ok",
    "dest_info": "{\"name\": \"Bogart Doe\"}",
}
```

**5) BankA handles the reply from the Auth request**

If the call to the AUTH_SERVER returned `pending`, BankA must resubmit the request again after the estimated number of seconds.

**6) BankA does the sanction checks**

Once BankA has been given the `dest_info` from BankB, BankA does the sanction check using this AML info of Bogart. If the sanction check passes, BankA signs and submits the transaction to the Stellar network.


**7) BankB handles the incoming payment.**

 - It checks the transaction hash against a cache it has or redoes the sanction check on the sender.
 - It credits Bogart's account with the amount sent or sends the transaction back.


