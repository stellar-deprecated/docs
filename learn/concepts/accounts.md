
# Accounts

Accounts are the central data structure in Stellar. Accounts are identified by a public key and saved in the ledger. Everything else in the ledger, such as offers or trustlines, are owned by a particular account. 

Account are created with the [Create Account](./list-of-operations.md#create-account) operation. 

Account access is controlled by public/private key cryptography. For an account to perform a transaction�e.g., make a payment�the transaction must be signed by the private key that corresponds to that account's public key. You can also set up more complicated [multi-signature] (./multi-sig.md) schemes for authorizing transactions on an account.


## Account fields

Accounts have the following fields:

- **Account ID**: The public key that was first used to create the account. You can replace the key used for signing the account's transactions with a different public key, but the original account ID will always be used to identify the account. 

- **Balance**: The number of lumens held by the account. The balance is denominated in 1/10,000,000th of a lumen, the smallest divisible unit of a lumen.

- **Sequence number**: The current transaction sequence number of the account. This number starts equal to the ledger number at which the account was created. 

- **Number of subentries**: Number of other [entries](./ledger.md#ledger-objects) the account owns. This number is used to calculate the account's [minimum balance](./fees.md). 

- **Inflation destination**: (optional) Account designated to receive inflation. Every account can vote to send [inflation](./inflation.md) to a destination account.  

- **Flags**: Currently there are two flags, used by issuers of [assets](./assets.md).

  - **Authorization required**: Requires the account to give other accounts permission to hold its credit. This setting can't be used if the account has outstanding credit.

  - **Authorization revocable**: Allows the account to revoke its credit held by other accounts. This setting can't be used if the account has outstanding credit.

- **Home domain**: A domain name that can optionally be added to the account. Clients can look up a [stellar.txt](./stellar.txt.md) from this domain. This domain can be used for looking up the meaning of the memo field and for reverse federation to look up the common name of the account. For more on federation, check out the [federation guide](./federation.md).

- **Thresholds**: Operations have varying levels of access. This field specifies thresholds for low-, medium-, and high-access levels, as well as the weight of the master key. For more info, see [multi-sig](./multi-sig.md).

- **Signers**: Used for [multi-sig](./multi-sig.md). This field lists other public keys and their weights, which can be used to authorize transactions for this account.


