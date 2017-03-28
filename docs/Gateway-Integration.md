Stellar Gateways Integration Guide
==================================

###Security precautions
 - Ensure device used to generate keys has not been compromised.
  - Use a new device
  - Dedicate the device for key generation
  - Never connect it to a network
  - Never connect it to untrusted devices
 - Ensure the device used to generate keys is capable of generating cryptographically secure random numbers.
 - Ensure the device you use to store your keys remains secure.
  - http://www.techopedia.com/definition/17037/air-gap

###Creating accounts

#####Generating keys
 - (code examples)

#####Funding accounts
 - Fund the account with STR to meet the minimum required balance (20STR).
 - The minimum required balance is a reserve that can be used to pay fees, but not used as payment.
 - The reserve increases when the account creates offers and decreases by the same amount when the offer is filled or canceled. This ensures that the account can pay the fee to cancel the offer.

###Configuring accounts
 - Requiring destination tags (code examples)
 - Requiring authorization (code examples)
 - Setting a transfer rate (code examples)

###Trusing accounts
 - Trust between an organization's accounts (code examples)
 - Trust between users and organizations (code examples)

###Setup stellar.txt
 - SSL (links)
 - CORS (links)
 - Adding currencies (code examples)
 - Adding federation (code examples)
