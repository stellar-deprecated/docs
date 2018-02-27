---
title: Custom Assets
---

In order to distribute a custom asset or token on the Stellar Network, three unique accounts will be used. First, is the source account. The source account is the account of the entity looking to create a new token. Second is the issuing account. The issuing account is created by the source account as a mechanism to create new tokens. The third account is the distribution account. The goal of distribution account is to act as the mechanism for distributing tokens to the public. 

Most of the Stellar documentation is centered on financial institutions as anchors. An anchor is an entity that acts as a bridge between existing currencies and the Stellar Network, and involves setting up systems like a compliance server and a bridge server. It is not necessary to become an anchor in order to create custom assets and tokens on the Stellar Network. 

The following presents a breakdown of the transactions required to create a custom token. The transactions can be translated to API requests or can be executed using [Stellar Laboratory](https://www.stellar.org/laboratory/).


## Steps 

#### Transaction 1: Create the issuing account
**Account**: source account  
**Operations**:
- [Create Account](../concepts/list-of-operations.md#create-account): create issuing account in system
	 - starting balance: [minimum balance](../concepts/fees.md#minimum-account-balance) + [transaction fee](../concepts/fees.md#transaction-fee)

**Signers**: source account

#### Transaction 2: Create the distribution account
**Account**: source account  
**Operations**:
- [Create Account](../concepts/list-of-operations.md#create-account): create distribution account in system
	 - starting balance: [minimum balance](../concepts/fees.md#minimum-account-balance) including trustlines  

**Signers**: source account


Transaction 1 and Transaction 2 are submitted to the network by the token creator. This creates the issuing and distribution accounts and gives the source entity access to the public and private key of each account. The issuing account is funded with minimum balance with no entries. It is given additional money to handle the transfer fee of transferring the assets at the end of the escrow agreement, but additional money to handle the fee of transferring the assets to the distribution account. The distribution account must be funded with the minimum balance with one entry, as it will need to create a trustline (an entry) in the future. The starting balances are minimums need in order to make the accounts valid on the Stellar Network - the actual amount used to create the two accounts can be any amount, as long as its larger than the minimums. The distribution account can start off being funded with the minimum balance without entries, but the next transaction will create a trustline for the account, thus raising its minimum balance. 


#### Transaction 3: Creating Trust
**Account**: distribution account  
**Operations**:
- [Change Trust](../concepts/list-of-operations.md#change-trust): create a trustline to the issuing account
	 - asset: asset code format
	 	- code: asset code
	 	- issuer account: issuing account
	 - trust limit: max tokens  

**Signers**: distribution account


Transaction 3 is submitted to the network by the token creator. It creates a trustline between the issuing account and the distribution account. There are currently two formats of asset code supported for tokens: Alphanumeric 4-character maximum (Alphanumeric 4) and Alphanumeric 12-character maximum (Alphanumeric 12). The alphanumeric character set is any characters from the set [a-z][A-Z][0-9]. In this step, you are introducing your token/asset to the Stellar network, but you are not creating any for trading. The trust limit parameter limits the number of tokens the distribution account will be able to hold at once.  It is recommended to either make this number larger than the total number of tokens expected to be available on the network or set it to be the maximum value (a total of max int64 stroops) that an account can hold.


#### Transaction 4: Asset Creation
**Account**: issuing account  
**Operations**:
- [Payment](../concepts/list-of-operations.md#payment): give the distribution account the tokens
	 - destination: distribution account
	 - asset: asset code format
	 	- code: asset code
	 	- issuer account: issuing account
	 - trust limit: tokens to be created 

**Signers**: issuing account

Transaction 4 is created and submitted to the network by the issuing account. In this transaction, it pays the distribution account the tokens, creating them on the network. The total number of tokens paid to the distribution account is the total number of tokens created. 

#### Transaction 5: Asset Creation
**Account**: issuing account  
**Operations**:
- [Set Option - Home Domain](../concepts/list-of-operations.md#set-options): set home domain of stellar.toml
	 - home domain: domain location 

**Signers**: issuing account


Transaction 5 is created and submitted to the network. The domain location should be set to the domain that is hosting your stellar.toml file (which contains metadata regarding your token).

At this step, a stellar.toml must be created and hosted on a domain of choice. The stellar.toml file should contain metadata relevant to the token being created. Maintaining a stellar.toml file is important, as it provides transparency for the asset and its usage. 
A standard stellar.toml declaration of an asset should contain the following for each asset issued (all values in curly brackets are variable, and should be filled in):
```
[[CURRENCIES]]
code="{asset code}"
issuer="{public key of issuing account}"
display_decimals={integer}
```

The field display_decimals represents the maximum decimal place that should be displayed by clients (wallets, exchanges, etc) on their user interface. 

Other fields that can be included in the stellar.toml file include:
```
name="{name}"
desc="{description of asset}"
conditions="{conditions for usage and distributions of the asset}"
image="{url of an image to associate with the asset}"
```


#### (OPTIONAL) Transaction A: Limit Token Supply
**Account**: issuing account  
**Operations**:
- [Set Option - Thresholds & Weights](../concepts/list-of-operations.md#set-options): remove all weights and thresholds
	 - master weight: 0
	 - low threshold: 0
	 - medium threshold: 0
	 - high threshold: 0 

**Signers**: issuing account


Transaction A is created and submitted to the network by the issuing account. By setting the weights and thresholds all to zero, this creates a lockout scenario. All keys, including the master key of the account, will become invalid keys. Locking an account prevents any further transaction to be created using this account, consequently meaning that no more tokens can be created. The[XDR form](https://www.stellar.org/developers/horizon/reference/xdr.html) of this transaction can be published once submitted to show proof of the account being locked. 



***WARNING: AFTER CARRYING OUT THIS STEP YOU CAN NO LONGER CREATE NEW OPERATIONS OR SUBMIT NEW TRANSACTIONS WITH THE ISSUING ACCOUNT. THIS STEP IS FINAL.***


#### Transaction 6: Token Distribution
**Account**: distribution account  
**Operations**:
- [Manage Offer - Sell](../concepts/list-of-operations.md#manage-offer): create an offer to sell the created tokens
	- selling: created asset code format
		- code: asset code
		- issuer account: issuer account
	- buying: asset code format
		- code: asset code
		- issuer account: issuer account
	- amount: amount to sell
	- price: sale price in lumens
	- offer id: 0  

**Signer**: distribution account

Transaction 6 is created and submitted to the network by the distribution account. In this step, the created asset is being sold for a different asset. The different asset could be another created asset, a fiat currency, a cryptocurrency, or lumens.  The offer id is set to zero, as a new offer is being created.The amount is the price of 1 unit of asset to be sold (selling) in terms of the asset that is being bought (buying). 

By submitting Transaction 6, the created token is listed on the decentralized exchange maintained by the Stellar Network. By creating the offer, the token will be listed on the Stellar Network decentralized exchange. In order to be listed on exchange clients like Stellar Term and Stellar Port, please refer to their websites for listing instructions. It’s encouraged to be listed on exchange clients to increase visibility.



## Additional Examples:
Examples for some of the transactions and more about issuing assets can be found [here](../issuing-assets.md). In addition, [this article](../concepts/assets.md#anchors-issuing-assets) provides more in-depth explanations of key terms regarding asset creation. A preliminary guide that walks through explaining token creation using Stellar Laboratory is available [here](https://www.stellar.org/blog/tokens-on-stellar/).

## Resources:
- [Becoming an Anchor](../anchor/readme.md) - Stellar<span>.org
- [Minimum Account Balance Calculation](../concepts/fees.md#minimum-account-balance) - Stellar<span>.org
- [Concept: stellar.toml](../concepts/stellar-toml.md) - Stellar<span>.org
- [Concept: Trustlines](../concepts/assets.md#trustlines) - Stellar<span>.org
