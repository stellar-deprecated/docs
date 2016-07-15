---
title: Issuing Assets
---

While you can always trade Lumens, the built-in, native currency of the Stellar network, you can also use Stellar to trade any sort of asset, such as US dollars, bitcoins, stocks, special coupons, or any token of value that you can think of.

At the end of the day, every asset (except Lumens, which are treated specially) is really just a credit from an particular account on the Stellar network. You can also think of an asset like an IOU. When you trade US dollars on the Stellar network, you don’t actually trade US dollars—you trade US dollars *from a particular account.* That account could be a large financial instition, like Chase Bank, or it could be your best friend. More people will probably trust assets from Chase Bank, though!

Assets in Stellar are represented by a combined *asset code* and *asset issuer*. The *code* identifies the type of currency, like `USD`. It can be any sequence of up to 12 letters and numbers, but codes of 4 or fewer characters are encouraged. Codes are case-sensitive, so `usd` is different from `USD`. Most of the time, you should stick to all uppercase to keep it simple.

The asset’s `issuer` is the ID of the account that the asset was issued by, such as the account for Chase Bank.

Because an asset simply represents a credit or IOU from an account, you don’t actually need to do anything to *issue* the asset. You simply pay it to someone else using the `payment` operation. If your asset represents some other store of value (like USD, EUR or even shares of a goat), it’s up to you to keep track of how much you can safely pay out.[^issuing-accounts]

## Trustlines

You can’t pay your own custom asset to just anyone, though. Because anyone can issue an asset, others have to *trust* your asset. After all, you might trust your neighbor to pay you back a few dollars, but maybe not a few thousand dollars. Or, if they aren’t too reliable, you might not trust them to pay you back at all. In the same way, you can trust the issuer of asset up to any amount that you like. You might trust Chase Bank’s account for a million USD, but only trust your friend’s account for a hundred.


[^issuing-accounts]: One technique you can use to simplify accounting for how much of an asset you can create is to keep an account that issues an asset separate from the account you use to transact with others. The “issuing” account issues the asset by paying a fixed amount to the transacting account, which is free to send and receive that asset at will. The issuing account can issue the asset when more of the underlying value (like actual dollar bills) is on hand and the accounts involved in public transactions never have to worry about how much can be created. 
