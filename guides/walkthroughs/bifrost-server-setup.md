---
title: Bifrost Server Setup
---

Bifrost is a service that enables users to move BTC/ETH to the Stellar network. It can either be used to give a representation of BTC or ETH on the network or trade it to another custom token. This is particularly useful for ICOs (Initial Coin Oferrings). 
This guide will focus on how to setup the Bifrost server to move ETH to the Stellar network.

## What you will need

- Postgresql DB 
- Bitcoin/Ethereum node
- Bifrost Server

## Setting up Postgresql

This won't be covered here as there are handy documentation on how to set this up online, depending on your OS.

## Setting up Ethereum node

- Download the [geth version 1.7.1 or above](https://geth.ethereum.org/downloads/).
- Extract the contents of the downloaded file
- Start the listener on the test network

```bash  
./geth --testnet --rpc
```

- Read more about [managing geth](https://github.com/ethereum/go-ethereum)

## Create a Sell Order for your Asset

Bifrost will automatically exchange the received BTC or ETH for your custom token. For this to happen, there has to be a sell order for the CUSTOM-TOKEN/BTC OR CUSTOM-TOKEN/ETH asset pairs on the Stellar's distributed exchange.

For example, let's say the exchange rate is 1 `TOKE` for 0.2 `ETH`. You can use [Stellar Laboratory](https://www.stellar.org/laboratory/) to create and submit a manage sell offer operation:

- Go to the "Transaction Builder" tab
- Take note of the toggle button on the top right of the page with “test/public” ensure it is set to public for live transactions and test for transactions on the testnet
- Fill the form on the page:
  - Enter Source account (Asset Issuer or Distributing Account)
  - Click the "Fetch next sequence number" button
  - Scroll down, add select operation type: "Manage Sell Offer"
  - For selling: Select Alphanumeric 4
  - Enter Asset Code: `TOKE`
  - Enter Issuer Account ID: Issuer Account
  - For buying: Select Alphanumeric 4
  - Enter Asset Code: `ETH`
  - Enter Issuer Account ID: Issuer Account
  - Amount: Enter the amount of TOKE you are selling 
  - Price: This is represented in terms of the buying asset. That is `1 selling_asset = X buying_asset`. In our case, since we want to sell 1TOKE for 0.2ETH, the value here should be 0.2
  - Offer ID: Enter "0" to create a new offer
  - Scroll down click "Sign transaction in Signer"
  - Enter the secret key of the Asset Issuer or Distributing Account or sign a transaction using Ledger device
  - Click on "Submit to Post transaction"
  - Click on "Submit".

The steps above will create a sell order for your asset on the distributed exchange.

## Setting up Bifrost

- Download [the latest version](https://github.com/stellar/go/releases/tag/bifrost-v0.0.2) and extract its component into a folder.
- Rename downloaded file to `bifrost-server` (optional)
- Generate your ethereum master public keys according to [BIP-0032](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).  You can download [this implementation](https://iancoleman.io/bip39/) from GitHub and generate the keys on an offline machine. You can also extract master public key from the Ledger device.
- Create a config file: `bifrost.cfg`, similar to the one below:

<code-example name="bifrost.cfg">

```toml
port = 8002
using_proxy = false
access_control_allow_origin_header = "*"

#uncomment bitcoin parameters if you will be accepting BTC
#[bitcoin]
#master_public_key = "xpub6DxSCdWu6jKqr4isjo7bsPeDD6s3J4YVQV1JSHZg12Eagdqnf7XX4fxqyW2sLhUoFWutL7tAELU2LiGZrEXtjVbvYptvTX5Eoa4Mamdjm9u"
#rpc_server = "localhost:18332"
#rpc_user = "user"
#rpc_pass = "password"
#testnet = true
#minimum_value_btc = "0.0001"
#token_price = "1"

[ethereum]
master_public_key = "xpub68VNckQn96Y23e5GsGh9X7zVmbPT4ho5Vdf6RdgMGG3LyNhH2cLFDCib9zgn8QWgj261xu7MYbmBsX8Fp5VkfDUrecUnpEGWkyCo7qK2gxn"
rpc_server = "localhost:8545"
network_id = "3"
minimum_value_eth = "0.00001"
token_price = "1"

[stellar]
issuer_public_key = "GDNPOP72ZO6AZXZ7LQJ4GKYT7UIH4JEG4X3ZRZBFUCRB467RNV3SFK5D"
distribution_public_key = "GCSSFPPVERDH4ZPWH5BSONEJERHCVS4DPZRWJG3FP3STOA5ZFTD3GMZ5"
signer_secret_key = "SB3WH2NLOFW2K2B5MWN34CWF35ZLQXH33ABZYL7KZFKTVEFP72Q574LM"
token_asset_code = "ZEN"
needs_authorize = false
horizon = "https://horizon-testnet.stellar.org"
network_passphrase = "Test SDF Network ; September 2015"
starting_balance = "4"

[database]
type="postgres"
dsn="postgres://stellar:pass1234@localhost/bifrost?sslmode=disable"
```

</code-example>


- Complete the config file with the values as described [here](https://github.com/stellar/go/tree/master/services/bifrost#config)
- Check that you have the correct master public keys by running:

```bash 
./bifrost-server check-keys
```

Output should be similar to:

```bash
MAKE SURE YOU HAVE PRIVATE KEYS TO CORRESPONDING ADDRESSES:
Bitcoin MainNet:
No master key set...
Ethereum:
0 0xAF484B67cC184259d22edfA4aFe874f68275B714
1 0x0163DF805B87A9aB2dd3177f674B275163272630
2 0x42069115ba5802736444Aacba5F0bD4a9a007E69
3 0xA219bCCFeE13B94fcf505120Cb7b8CD090749A4e
4 0x3AB571B247b0CF45E44d111691F9D03eE1bfE705
5 0x1Fe3101B058Aa3b6Fb69B84Cd1cc7766959dcFc2
6 0x1B07c658614F6D4F13225b63d76055EaB07114c9
7 0x3C3459c47388163E56e544F9616ac0E46668420E
8 0x08fb48e4f54f699cDa3B97cd97D9fB6A594354D7
9 0xC5CD4b9E6c5D9c0cd1AAe5A52f6DCA3d20CF08BC
```

## Start the Bifrost server

Once you are done setting up the config file, you can start the server by running:

```bash
./bifrost-server server
```
The Bifrost server will be responsible for generating ethereum addresses, listening for payments on these addresses and transferring the token purchased to the user.

## Using Bifrost JS SDK.

The Bifrost JS SDK provides a way for a client to communicate with the Bifrost server. 
Download the [latest version](https://github.com/stellar/bifrost-js-sdk/releases) of the SDK, and include it in your frontend application. See the [example html file](https://github.com/stellar/bifrost-js-sdk/blob/master/example.html) in the [bifrost-js-sdk repo](https://github.com/stellar/bifrost-js-sdk) for an example on how this can be implemented.
