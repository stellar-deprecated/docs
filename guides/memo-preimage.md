---
title: Memo preimage
---

# Memo preimage

Sometimes there is a need to send more information about the transaction, for example: KYC info and/or a short note. Such data shouldn't be placed in a [ledger](./concepts/ledger.md) because of it's public nature. Instead, you should create a JSON document: memo preimage, send it to receiver's [Auth server](./compliance-protocol.md) and then attach the sha-256 hash as a memo hash in your transaction.

## Memo preimage structure

Memo preimage is a JSON document with the following structure:

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
`transaction.nonce` | Random string | [Nonce](https://en.wikipedia.org/wiki/Cryptographic_nonce) is a random value. Every transaction you send should have a different value. Nonce is needed to distinguish memos of two transactions sent between the same pair of customers.
`transaction.sender_info` | JSON | JSON containing KYC info of the sender. This JSON object can be extended with more fields if needed.
`transaction.route` | string | TODO
`transaction.note` | string | A note attached to transaction.
`operations[i]` | | `i`th operation data. Can be omitted if transaction has only one operation.
`operations[i].sender_info` | JSON | `sender_info` for `i`th operation in the transaction. If empty, will inherit value from `transaction`.
`operations[i].route` | string | `route` for `i`th operation in the transaction. If empty, will inherit value from `transaction`.
`operations[i].note` | string | `note` for `i`th operation in the transaction. If empty, will inherit value from `transaction`.

## Calculating memo preimage hash

To calculate memo preimage hash you need to stringify JSON object and calculate `sha-256` hash. In Node.js:

```js
const crypto = require('crypto');
const hash = crypto.createHash('sha256');

hash.update(JSON.stringify(memoPreimage));
var memoHashHex = hash.digest('hex');
```

To add the hash to your transaction use [`TransactionBuilder.addMemo`](http://stellar.github.io/js-stellar-base/TransactionBuilder.html#addMemo) method.

## Sending memo preimage

Send memo preimage and it's hash (in a transaction) to Auth server of a receiving organization. Read [Compliance protocol](./compliance-protocol.md) doc for more information.

## Example

```js
var crypto = require('crypto');

var nonce = crypto.randomBytes(16);
var memoPreimage = {
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
hash.update(JSON.stringify(memoPreimage));
var memoHashHex = hash.digest('hex');
console.log(memoHashHex); // TODO
```
