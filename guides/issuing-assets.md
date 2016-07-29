---
title: Issuing Assets
---

One of Stellar’s most powerful features is the ability to trade any kind of asset, like US dollars, Nigerian naira, bitcoins, special coupons, or just about anything you like.

This works in Stellar because an asset is really just a credit from a particular account. When you trade US dollars on the Stellar network, you don’t actually trade US dollars—you trade US dollars *backed by a particular account.* Often, that account will be a bank, but if your neighbor had an orange tree, they might issue orange assets that you could trade with other people.

Every asset type (except lumens) is defined by two properties:

- `asset_code`: a short identifier of 1–12 letters or numbers, such as `USD`, or `EUR`. It can be anything you like, even `AstroDollars`.
- `asset_issuer`: the ID of the account that issues the asset.

## Creating a New Asset Type

To issue or create a new type of asset, all you need to do is choose a code. It can be any combination of up to 12 letters or numbers, but you should use the appropriate [ISO 4217 code][ISO 4217]  or [ISIN] for national currencies or securities. Once you’ve chosen a code, you can begin paying people using that asset code. You don’t need to do anything to declare your asset on the network.

However, other people can’t receive your asset until they’ve chosen to trust it. Because a Stellar asset is really a credit, you should trust that the issuer can redeem that credit if necessary later on. You might not want to trust your neighbor to issue orange assets if they don’t even have an orange tree, for example.

An account can create a *trustline,* or a declaration that it trusts a particular asset, using the [change trust operation](concepts/list-of-operations.md#change-trust). A trustline can also be limited to a particular amount. If your orange-growing neighbor only has one tree, you might not want to trust them for more than about 2000 oranges. *Note: each trustline an account sets up slightly increases its minimum balance. For more details, see the [fees guide](concepts/fees.html#minimum-balance).*

Once you’ve chosen an asset code and someone else has created a trustline for your asset, you’re free to start making payment operations to them using your asset. If someone you want to pay doesn’t trust your asset, you might also be able to use the [distributed exchange](concepts/exchange.md).


## Other Considerations

Once you begin issuing your own assets, there are few other practices you might want to follow.

### Specialized Issuing Accounts

In the simplest situations, you can issue assets from your everyday Stellar account. However, if you operate a financial institution or a business, you should keep a separate account specifically for issuing assets. Why?

- Easier tracking: because an asset represents a credit, it disappears when it is sent back to the account that issued it. To better track and control the amount of your asset in circulation, pay a fixed amount of the asset from the issuing account to the working account that you use for normal transactions.

  The issuing account can issue the asset when more of the underlying value (like actual oranges or dollar bills) is on hand and the accounts involved in public transactions never have to worry about how much is available outside Stellar.

- Keeping trust simple: as your usage of Stellar grows, you might consider having multiple accounts for a variety of reasons, such as making transactions at high rates. Keeping a canonical issuing account makes it easier for others to know which account to trust.


### Requiring or Revoking Authorization

Accounts have [several flags](concepts/accounts.md#flags) related to issuing assets. You might want to make sure your issuing account has the [`AUTHORIZATION REVOCABLE` flag set](concepts/assets.md#revoking-access). This allows you to freeze your assets in another account.

If your asset is special purpose or you’d like to control who can be paid with it, use the [`AUTHORIZATION REQUIRED` flag](concepts/assets.md#controlling-asset-holders), which requires that the issuing account also approves a trustline before the receiving account is allowed to be paid with the asset.


### Check Trust Before Paying

Because every transaction comes with a small fee, you might want to check to ensure an account has a trustline and can receive your asset before sending a payment. If an account has a trustline, it will be listed in the accounts `balances` (even if the balance is `0`).


### More About Assets

Read more about the details of assets in our [assets concept document](concepts/assets.md)


[ISO 4217]: https://en.wikipedia.org/wiki/ISO_4217
[ISIN]: https://en.wikipedia.org/wiki/International_Securities_Identification_Number
