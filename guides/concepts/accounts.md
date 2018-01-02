---
title: Accounts
---

Accounts are the central data structure in Stellar. Accounts are identified by a public key and saved in the ledger.
Everything else in the ledger, such as offers or [trustlines](./assets.md#trustlines), are owned by a particular account.

Accounts are created with the [Create Account](./list-of-operations.md#create-account) operation.

Account access is controlled by public/private key cryptography. For an account to perform a transaction--e.g., make a
payment--the transaction must be signed by the private key that corresponds to that account's public key. You can also
set up more complicated [multi-signature](./multi-sig.md) schemes for authorizing transactions on an account.


## Account fields

Accounts have the following fields:

> #### Account ID
> The public key that was first used to create the account. You can replace the key used for signing the account's transactions with a different public key, but the original account ID will always be used to identify the account.
>
> #### Balance
> The number of lumens held by the account. The balance is denominated in 1/10,000,000th of a lumen, the smallest divisible unit of a lumen.
>
> #### Sequence number
> The current transaction sequence number of the account. This number starts equal to the ledger number at which the account was created.
>
> #### Number of subentries
> Number of other [entries](./ledger.md#ledger-entries) the account owns. This number is used to calculate the account's [minimum balance](./fees.md#minimum-account-balance).
>
> #### Inflation destination
> (optional) Account designated to receive inflation. Every account can vote to send [inflation](./inflation.md) to a destination account.
>
> #### Flags
> Currently there are three flags, used by issuers of [assets](./assets.md).
>
>   - **Authorization required (0x1)**: Requires the issuing account to give other accounts permission before they can hold the issuing account's credit.
>   - **Authorization revocable (0x2)**: Allows the issuing account to revoke its credit held by other accounts.
>   - **Authorization immutable (0x4)**: If this is set then none of the authorization flags can be set and the account can never be deleted.
>
> #### Home domain
> A domain name that can optionally be added to the account. Clients can look up a [stellar.toml](./stellar-toml.md) from this domain. This should be in the format of a [fully qualified domain name](https://en.wikipedia.org/wiki/Fully_qualified_domain_name) such as `example.com`.
>
> The federation protocol can use the home domain to look up more details about a transaction's memo or [address](https://www.stellar.org/developers/learn/concepts/federation.html#stellar-addresses) details about an account. For more on federation, see the [federation guide](./federation.md).
>
>
> #### Thresholds
> Operations have varying levels of access. This field specifies thresholds for low-, medium-, and high-access levels, as well as the weight of the master key. For more info, see [multi-sig](./multi-sig.md).
>
> #### Signers
> Used for [multi-sig](./multi-sig.md). This field lists other public keys and their weights, which can be used to authorize transactions for this account.
