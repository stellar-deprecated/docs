Introduction to Stellar Gateways
================================

This is meant to be a detailed explanation of what gateways are and how they work. For an simpler alternate explanation of the concept of gateways, read the [intro blog post about gateways](https://www.stellar.org/blog/introducing-stellar/#gateways).

Gateways help move money in and out of the Stellar network. They provide a way to use the Stellar network to send currencies other than STR.

Users can deposit money into a gateway in return for credits issued by the gateway. The user can now use these credits to pay others that accept this credit. These credits can then later be redeemed for cash or sent to someone else.

For example, Maria deposits $20 USD into *Foo* gateway. The gateway issues her $20 *Foo* USD credits. Then she sends $2.50 *Foo* USD credits to pay for a drink at the tea store. The tea store can later send the $2.50 *Foo* USD credit back to the *Foo* gateway and get $2.50 back into her bank account (minus fees, if applicable).

This concept is not only limited to currency but can also be applied to other assets such as gold, frequent-flyer points, or rubber duckies.

## Credits
Credits are tokens issued by gateways that represent an amount of an asset. The credits have value because they can be redeemed at a gateway for the represented asset outside of Stellar.

They are represented as represented as a 3 letter currency code. If users trust two different gateways for the same currency (represented by the same 3 letter code), it could cause confusion for the client/user. For this reason, we do not recommend users to trust multiple gateways using the same currency code.

A user must "trust" a gateway issuing account before they can receive credits issued by the gateway.

## Trust
A credit is only as valuable as the ability to redeem it outside the Stellar network allows for.

In order to receive credits issued by a certain gateway, a user must extend trust to the issuing gateway. This is similar to how users trust their local bank to hold money on their behalf.

In Stellar, users have to specify the amount that they trust a gateway with. A user will not be able to receive more credits than the amount they have trusted the gateway with. If a user accumulates more credits than they trust, they will still be able to send them. They just can't receive more from another user.

However, users will be able to buy and sell credits issued by gateways they don't trust via the distributed exchange.

## Distributed exchange
The distributed exchange is a system where users can trade credits and stellars. There are no fees for using the distributed exchange. Users can buy and sell credits on the distributed exchange without needing to extend trust to the issuing gateway.

If a user wants to send credits issued by a gateway that the user does not trust, they can buy the credits on the distributed exchange and immediately send it.

To manually use the distributed exchange, the user can go into the client and buy or sell credits.

## Fees
A gateway can impose transit fees on every time a user sends credits they issue. This fee would apply to any transaction that moves credit issued by the gateway, even on the distributed exchange.
