Stellar Gateways Guide
======================

## Introduction to gateways
Gateways help move money in and out of the Stellar network. They provide a way to use the Stellar network to send currencies other than STR.

Users can deposit money into a gateway in return for credits issued by the gateway. The user can now use these credits to pay others that accept this credit. These credits can then later be redeemed for cash or sent to someone else.

For example, Maria deposits $20 USD into Foo gateway. The gateway issues her $20 FooUSD credits. Then she sends $2.50 FooUSD credits to pay for a drink at the tea store. The tea store can later send the $2.50 FooUSD credit back to the Foo gateway and get $2.50 back into her bank account (minus fees, if applicable).

This concept is not only limited to currency but can also be applied to other assets such as gold and t-shirts.


## Credits
Credits are tokens issued by gateways that represent an amount of an asset. They represent a promise from the issuing gateway that these credits can be redeemed for their equivalent value outside the Stellar network. Users are able to instantly.

## Fees
By default, the only fees to send credits is the same fee required for sending transactions (~0.000010 STR). However, a gateway can impose fees on various actions inside the Stellar network such as sending and use of the distributed exchange.

## Trust
A credit is only as valuable as the ability to redeem it outside the Stellar network allows for. 

In order to hold and receive credits issued by a certain gateway, a user must extend trust to the issuing gateway. This is similar to how users trust their local bank to hold money on their behalf. The trust line will allow a user to hold up to a specified amount of these credits.

## Setting up the gateway account
Read about the API calls used to create a gateway on the _Gateway setup tutorial_.

## Entering the Stellar system
 - This guide only covers parts relevant to Stellar
 - Stellar has no separate concept of sending an issuing credits. To issue credits, the issuing account just needs to send the credits to someone that it trusts.

## Exiting the Stellar system
 - Receiving to an address via [Destination Tags](Destination-Tags.md)

## Transaction Robustness
Software is not perfect, and there are many things that can go wrong when sending a transaction. When dealing with finances, mistakes can be extremely costly.

Read more on how to prevent these issues on the _Transaction Robustness_ guide.

## Security concerns
 - Maintaining a coldwallet and a hotwallet
 - Running stellard securely (separate page)
 	- an isolated stellard instance	
