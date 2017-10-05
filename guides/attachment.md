---
title: Stellar Attachment Convention
---

# Attachments

Sometimes there is a need to send more information about a transaction than fits in the provided memo field, for example: KYC info, an invoice, a short note. Such data shouldn't be placed in the [ledger](./concepts/ledger.md) because of it's size or private nature. Instead, you should create what we call an `Attachment`. A Stellar attachment is simply a JSON document. The sha256 hash of this attahment is included as a memo hash in your transaction. The actual document can be sent to the receiver through some other channel, most likely through the receiver's [Auth server](./compliance-protocol.md).

## Attachment structure

Attachments have a flexible structure. They can include the following fields but these are optional and there might be extra information attached.

```json
{
  "transaction": {
    "nonce": "<nonce>",
    "sender_info": {
      "first_name": "<first_name>",
      "middle_name": "<middle_name>",
      "last_name": "<last_name>",
      "address": "<address>",
      "city": "<city>",
      "province": "<province>",
      "country": "<country in ISO 3166-1 alpha-2 format>",
      "date_of_birth": "<date of birth in YYYY-MM-DD format>",
      "company_name": "<company_name>"
    },
    "route": "<route>",
    "note": "<note>"
  },
  "operations": [
    {
      "sender_info": <sender_info>,
      "route": "<route>",
      "note": "<note>"
    },
    // ...
  ]
}
```

Name | Data Type | Description
-----|-----------|------------
`transaction.nonce` | Random string | [Nonce](https://en.wikipedia.org/wiki/Cryptographic_nonce) is a random value. Every transaction you send should have a different value. Nonce is needed to distinguish attachments of two transactions sent between the same pair of customers.
`transaction.sender_info` | JSON | JSON containing KYC info of the sender. This JSON object can be extended with more fields if needed.
`transaction.route` | string | TODO
`transaction.note` | string | A note attached to transaction.
`operations[i]` | | `i`th operation data. Can be omitted if transaction has only one operation.
`operations[i].sender_info` | JSON | `sender_info` for `i`th operation in the transaction. If empty, will inherit value from `transaction`.
`operations[i].route` | string | `route` for `i`th operation in the transaction. If empty, will inherit value from `transaction`.
`operations[i].note` | string | `note` for `i`th operation in the transaction. If empty, will inherit value from `transaction`.

## Calculating Attachment hash

To calculate the Attachment hash you need to stringify the JSON object and calculate `sha-256` hash. In Node.js:

```js
const crypto = require('crypto');
const hash = crypto.createHash('sha256');

hash.update(JSON.stringify(attachment));
var memoHashHex = hash.digest('hex');
```

To add the hash to your transaction use the [`TransactionBuilder.addMemo`](http://stellar.github.io/js-stellar-base/TransactionBuilder.html#addMemo) method.

## Sending Attachments

To send an Attachment and its hash (in a transaction) to Auth server of a receiving organization read the [Compliance protocol](./compliance-protocol.md) doc for more information.

## Example

```js
var crypto = require('crypto');

var nonce = crypto.randomBytes(16);
var attachment = {
  "transaction": {
    "nonce": nonce.toString('hex'),
    "sender_info": {
      "name": "Sherlock Holmes",
      "address": "221B Baker Street",
      "city": "London NW1 6XE",
      "country": "UK",
      "date_of_birth": "1854-01-06"
    }
  },
  "operations": [
    // Operation #1: Payment for Dr. Watson
    {
      "route": "watson",
      "note": "Payment for helping to solve murder case"
    },
    // Operation #2: Payment for Mrs. Hudson
    {
      "route": "hudson",
      "note": "Rent"
    }
  ]
};

var hash = crypto.createHash('sha256');
hash.update(JSON.stringify(attachment));
var memoHashHex = hash.digest('hex');
console.log(memoHashHex); // TODO
```
