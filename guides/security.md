---
title: Security
---

You’ll trade assets that are very valuable with Stellar, so security is important. The following guidelines can help keep your Stellar integration secure.


## Built-in security

Stellar uses industry-standard public-key cryptography tools and techniques, which means the code is well tested and well understood. All transactions on the network are public, which means the movement of funds can always be audited. Each transaction is signed by whomever sent it using the [Ed25519 algorithm](https://ed25519.cr.yp.to), which cryptographically proves that the sender was authorized to make the transaction.

While all transactions are public, banks using Stellar to exchange funds on behalf of individual account holders can keep information about the individuals sending and receiving it private by storing encrypted or unique identifiers in the transaction’s memo field. This allows banks to meet regulatory compliance requirements and keep transaction history verifiable while still keeping privileged information secure.


## Secure offline accounts

One of the simplest methods for securing an account is keeping its secret seed stored offline—it could be on a computer with no connection to the internet or just a piece of paper in someone’s wallet. Transactions can be created and signed on an offline computer, then saved to a USB drive (or some other means of storage) and transferred to a computer with internet access, which sends the transactions to a Horizon server or Stellar Core instance. If storing the seed on paper instead of a computer, use a program that doesn’t save the seed to create and sign the transaction.

Since an offline computer has no connection, it is extremely hard for someone without physical access to it to access the account’s keys. However, this also makes every transaction an extremely manual process. A common practice instead is to maintain two accounts: one offline account that securely holds the majority of your assets and another online account that holds only a few assets. Most transactions can be performed with the online account and, when its funds are low, a person can manually replenish it from the offline account.

You can think of this method like having both a bank vault and a cash register drawer. Most of the time the vault is closed and locked. It is only opened occasionally (and under specific procedures) to replenish a register drawer that is running low or to store excess funds from a register drawer that is overflowing. If someone attempts to rob the bank, it is extremely hard for them to get away with anything more than what was in the register drawer.


## Require multiple authorizations or signers

Sensitive accounts can be secured by requiring authorization from multiple individuals to make a transaction. Read the [multisignature guide](concepts/multi-sig.md) to learn more about how.

If you require multiple signers, you should also ensure that you do not require all the possible signers to sign a transaction. If one of the signers loses the keys to their account, you will no longer be able to perform transactions if they have to sign them.


## Ensure assets are revocable

If you issue your own assets, you should usually ensure that they can be revoked using the [“authorization revocable” flag on the account](concepts/accounts.md#flags). This allows you to effectively freeze your assets in someone else’s account in case of theft or in other extenuating circumstances.


## Perform compliance checks

Stellar’s core protocol limits itself to being a simple and verifiable means for exchanging assets. If you are a financial institution or are making large transactions, you should also perform <abbr title="Know Your Customer">KYC</abbr> and any related regulatory compliance checks. You can find more information in our [compliance protocol guide](compliance-protocol.md) or use the [Stellar Bridge Server](https://github.com/stellar/bridge-server) to simplify the process.


## What if an account’s keys are compromised?

Because Stellar’s security is based around public key encryption, it’s critical that an account’s secret seed is not shared. Anyone who has access to the seed effectively has control of the account. However, if someone learns your account’s seed or you accidentally share it with someone who shouldn’t know it, you can remove its ability to control the account with the following steps:

1. Make a new key pair.
2. Add the new public key as a signer on the compromised account. (Use the [`set options` operation](concepts/list-of-operations.md#set-options)).
3. Remove the compromised key’s signing authority on the compromised account.
4. Now the new public key controls the account and the compromised keys are no longer able to sign transactions.
5. Notify the owners of other accounts that the key has signing authority on that the key was compromised. They need to follow steps 2 and 3 for their accounts as well.

It’s important to understand that accounts that allow multiple signatures need to be able to remove a compromised key. You should always be careful that signature weights are set up so that this is possible—never require *all* signers to be involved in a transaction.


## What if there’s a bug in Stellar’s code?

Every node keeps a history archive, so you always have a strong and reliable record of what happened. Parties affected by a bug can examine all the historical details and agree on a method of remediation while the bug is being fixed.


## Securing a Stellar Core Instance

It’s generally a good idea to make sure access to Stellar Core is extremely limited. Make sure only the ports needed to communicate with Horizon and other Stellar Core instances on the public network are open. Access to Stellar Core’s databases should also be highly restricted.


## Keep Up to Date with Security Patches

Make sure that you’re using the most secure software available by keeping up-to-date with the latest releases. Stellar.org publishes release announcements on a mailing list you can subscribe to at https://www.freelists.org/list/sdf-releases.
