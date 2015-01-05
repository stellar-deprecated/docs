# Hot Wallets and Cold Wallets

## Overview
A Gateway’s issuing address secret key is like a printing press for its issued credits (or in the poker chip analogy, the machine that makes a casino’s poker chips). If an attacker compromises the secret key, they can issue unlimited credit at will, making any existing credits worthless because now the Gateway cannot cover withdrawals as it no longer has 1:1 parity between its reserves and its credits on the network. Additionally, the issuing account’s address can no longer be used as it is compromised (in our analogy, the casino would need to mint completely new poker chips to differentiate between the old, compromised chips). This is a worst case scenario for a Gateway and it’s crucial to take steps to ensure this will never happen.

## Store Issuing Address in Cold Storage
"Cold storage" is a storage device with no connectivity to the the public internet (preferably through an air gap). A "Cold Wallet" is a Stellar address whose secret key is stored in cold storage.

It is recommended that a Gateway's issuing secret key be created and stored in cold storage. Any transactions needed to be signed by the issuing address should be signed locally on cold storage, and manually moved to an internet connected machine for propogation to the Stellar network.

This solution has some problems. Each time you need to pay a user your credits, you will need to manually create a transaction. Additionally, if you require Authorization to hold credits, you'll need to manually create a transaction to authorize each user's account. Obviously, this solution will not scale. What we need is an account that lives on a connected server to automatically create these payment and authorization transactions, while keeping the cold wallet's secret key safely in cold storage.

## Fund a Hot Wallet with credits

In contrast to a cold wallet, a "hot wallet" is an account whose secret key lives on a network connected server. Transactions can be automatically signed with this account's secret key and sent to the network. However, this makes the secret key vulnerable to attack from the internet, which is why we stored the issuing key in cold storage.

To automatically send credit payments on your server, fund a hot wallet account with a small amount of credits from the issuing address. (This hot wallet account will first need to sign and submit a TrustSet transaction trusting the issuing address.) The hot wallet should be funded with the maximum amount of funds the Gateway can lose in the case of a security breach.

Payout user accounts from the hot wallet, and top up the hot wallet from the cold wallet from time to time.

### Hot Wallet trusts Issuing Address
```
curl -X POST https://<STELLARD_HOST>:<STELLARD_PORT> -d '
{
  "method": "sign",
  "params": [
    {
      "secret": "<HOT_WALLET_SECRET>",
      "tx_json": {
        "TransactionType": "TrustSet",
        "Account": "<HOT_WALLET_ADDRESS>",
        "LimitAmount": {
          "currency": "<ISSUING_CURRENCY>",
          "value": "1e+19",
          "issuer": "<GATEWAY_ISSUING_ADDRESS>"
        },
        "Flags": 131072
      }
    }
  ]
}'
```

### Cold Wallet funds Hot Wallet
```
curl -X POST https://<STELLARD_HOST>:<STELLARD_PORT> -d '
{
  "method": "sign",
  "params": [
    {
      "secret": "<GATEWAY_ISSUING_SECRET>",
      "tx_json": {
        "TransactionType": "Payment",
        "Account": "<GATEWAY_ISSUING_ADDRESS>",
        "Destination": "<HOT_WALLET_ADDRESS>",
        "Amount": {
          "currency": "<ISSUED_CURRENCY>",
          "value": "<MAX_AMOUNT>",
          "issuer": "<GATEWAY_ISSUING_ADDRESS>"
        }
      }
    }
  ]
}'
```

## Create a AuthKey Account

A gateway can specify a seperate account ("AuthKey") to sign TrustSet transactions on behalf of the issuing account. The AuthKey can only be used to sign TrustSet transactions, and therefore can be safely stored on the server.

### Set AuthKey
```
curl -X POST https://<STELLARD_HOST>:<STELLARD_PORT> -d '
{
  "method": "sign",
  "params": [
    {
      "secret": "<GATEWAY_ISSUING_SECRET>",
      "tx_json": {
        "TransactionType": "AccountSet",
        "SetAuthKey": "<AUTH_KEY_ADDRESS>",
        "Account": "<GATEWAY_ISSUING_ACCOUNT>"
      }
    }
  ]
}'
```
