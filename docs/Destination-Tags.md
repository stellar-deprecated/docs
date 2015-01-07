Stellar Destination Tags
========================
Destination tags are identifiers that can be attached to a transaction. This is useful for those (such as gateways and merchants) that want to accept payments to a single account and identify what the payment is for.

This guide describes the use cases for destination tags as well as the process of using them.

## Bitcoin Addresses vs Stellar Accounts

This sub-section is tailored for developers already familiar with Bitcoin and wanting to understand the motivation behind destination tags.

In Bitcoin, addresses have no minimum balance and anyone can generate thousands of Bitcoin addresses. For example, a gateway could create a new Bitcoin address for each user, and thus know which user any given transaction belongs to.

Stellar is designed differently and uses the concept of accounts. Accounts are required to have a minimum balance to keep bloat down (20 STR as of August 2014). The minimum balance helps prevent spam and ledger bloat.

A gateway creating one account per user (or a merchant creating one account per payment) would have to keep a 20 STR minimum balance in each account. This would be quite cumbersome.

As a result, the Stellar system has a feature that makes things a lot easier: **destination tags**.

## Destination Tags

Destination tags (abbreviated as dt) are used to distinguish what a specific payment was intended for.

Gateways can use destination tags to create a unique deposit target for each user — namely, each user gets assigned their own destination tag. The user just includes that destination tag on all of their payments, which lets the gateway identify whose deposit it is.

A destination tag is stored as a `unit32` that contains a number ranging from `0` to `4294967295` (2^32-1).

## Requiring Destination Tags

An account can be configured to reject payments that are missing a destination tag. This safeguard prevents users from forgetting to add a destination tag to their payment. To require destination tags on an account, submit an AccountSet transaction and use `SetFlag` with a value of `1`. To make destination tags optional, use `ClearFlag` with the same value of `1`.

```json
curl -X POST https://live.stellar.org:9002 -d '
{
  "method": "submit",
  "params": [
    {
      "secret": "sMasterSeedHereXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "tx_json": {
        "TransactionType": "AccountSet",
        "Account": "gAccountIDHereXXXXXXXXXXXXXXXXXXXX",
        "SetFlag": 1
      }
    }
  ]
}'
```

To check whether an account requires destination tags, make a request to the  [account_info](https://www.stellar.org/api/#api-account_info) endpoint. Assuming that there are no other flags set, it will show that `Flags` is `65536` if destination tags are required or `131072` if optional.

## Sending a transaction with a destination tag
To send a transaction using the dev api, add `DestinationTag` to the `tx_json` parameter in a payment.
```json
curl -X POST https://live.stellar.org:9002 -d '
{
  "method": "submit",
  "params": [
    {
      "secret": "sMasterSeedHereXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "tx_json": {
        "TransactionType": "Payment",
        "Account": "gSourceAccountIDHereXXXXXXXXXXXXXX",
        "Destination": "gDestAccountIDHereXXXXXXXXXXXXXXXX",
        "Amount": "1000000",
        "DestinationTag": "215923937"
      }
    }
  ]
}'
```

## End user usage

Users can send a payment with a destination tag in several ways.

An address with a destination tag is a normal address appended with `?dt=` and then the tag.

For example, an address with a destination tag of `215923937` would look like this:
<!-- Ha .. using the C syntax highlighter makes it look nice :D -->
```c
gHQWDV1qa55xQmGRUEdYhuYP14yJnDtGkS?dt=215923937
```

Some clients will also show a prompt to enter a destination tag if the recipient has enabled requiring of destination tags.
