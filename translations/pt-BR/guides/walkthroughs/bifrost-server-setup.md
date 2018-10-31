---
title: Configurar um Servidor Bifrost
---

Bifrost é um serviço que permite que usuários movam BTC/ETH à rede Stellar. Pode ser usado tanto para representar BTC ou ETH na rede como para trocá-los por outro token personalizado. Isso é particularmente útil para ICOs (Initial Coin Offerings).
Este guia se foca em como configurar o servidor Bifrost para mover ETH à rede Stellar.

## O que você vai precisar

- Base de Dados Postgresql
- Nó de Bitcoin/Ethereum
- Servidor Bifrost

## Configurar Postgresql

Isso não será abordado aqui, sendo que já há boas documentações sobre como preparar isso online, dependendo do seu OS.

## Configurar um nó de Ethereum

- Baixe o [geth versão 1.7.1 ou acima](https://geth.ethereum.org/downloads/).
- Extraia os conteúdos do arquivo baixado
- Inicie o listener na rede de testes

```bash  
./geth --testnet --rpc
```

- Leia mais sobre [como administrar o geth](https://github.com/ethereum/go-ethereum)

## Criar uma Ordem de Venda para seu Ativo

O Bifrost vai trocar automaticamente os BTC ou ETH recebidos pelo seu token personalizado. Para isso acontecer, deve haver uma ordem de venda para os pares de ativos CUSTOM-TOKEN/BTC ou CUSTOM-TOKEN/ETH na exchange distribuída do Stellar.

Por exemplo, digamos que a taxa de câmbio seja de 1 `TOKE` por 0.2 `ETH`. Você pode usar o [Laboratório Stellar](https://www.stellar.org/laboratory/) para criar e submeter uma operação manage offer:

- Vá até a aba "Transaction Builder"
- Repare no botão no canto superior direito da página com "test/public". Tome cuidado para deixá-lo como "public" para transações reais e "test" para transações na testnet
- Preencha o formulário na página:
  - Coloque a conta fonte na Source account (emissora do ativo ou conta distribuidora)
  - Clique no botão "Fetch next sequence number"
  - Desça e selecione um "Operation Type" como "Manage Offer"
  - Para "Selling": selecione Alphanumeric 4
  - Insira o Asset Code `TOKE`
  - Insira o Issuer Account ID: ID da conta emissora
  - Para buying: selecione Alphanumeric 4
  - Insira o Asset Code `ETH`
  - Insira o Account ID: Conta Emissora
  - Amount: Insira a quantidade de TOKE que você está vendendo
  - Price: O preço é representado na razão para o ativo a ser comprado, ou seja, `1 selling_asset = X buying_asset`. No nosso caso, já que queremos vender 1TOKE por 0.2ETH, o valor aqui deve ser igual a 0.2
  - Offer ID: Insira "0" para criar uma nova oferta
  - Desça e clique em "Sign transaction in Signer"
  - Insira a chave secreta da emissora do ativo ou conta distribuidora ou assine uma transação usando um dispositivo Ledger
  - Clique em "Submit to Post transaction"
  - Clique em "Submit".

Os passos acima irão criar uma ordem de venda para seu ativo na exchange distribuída.

## Configurar o Bifrost

- Baixe [a versão mais recente](https://github.com/stellar/go/releases/tag/bifrost-v0.0.2) e extraia seu componente em uma pasta.
- Renomeie o arquivo baixado para `bifrost-server` (opcional)
- Gere suas chaves públicas mestras de Ethereum de acordo com a [BIP-0032](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki). Você pode baixar [esta implementação](https://iancoleman.io/bip39/) do GitHub e gerar as chaves em uma máquina offline. Você pode também extrair a chave pública mestra do dispositivo Ledger.
- Crie um arquivo config: `bifrost.cfg`, parecido com o seguinte:

<code-example name="bifrost.cfg">

```toml
port = 8002
using_proxy = false
access_control_allow_origin_header = "*"

#descomentar parâmetros do bitcoin se você for aceitar BTC
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


- Complete o arquivo config com os valores descritos [aqui](https://github.com/stellar/go/tree/master/services/bifrost#config)
- Verifique que você tem as chaves públicas mestras rodando:

```bash
./bifrost-server check-keys
```

O output deve ser parecido com:

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

## Inicie o Servidor Bifrost

Após ter terminado o setup de seu arquivo config, você pode iniciar o servidor rodando:

```bash
./bifrost-server server
```
O servidor Bifrost será responsável por gerar endereços de ethereum, escutar pagamentos nesses endereços e transferir o token comprado ao usuário.

## Usar o SDK do Bifrost para JS

O SDK do Bifrost para JS fornece uma maneira para um cliente se comunicar com o servidor Bifrost.
Baixe a [versão mais recente](https://github.com/stellar/bifrost-js-sdk/releases) do SDK, e o inclua em sua aplicação frontend. Veja o [exemplo de arquivo html](https://github.com/stellar/bifrost-js-sdk/blob/master/example.html) no [repositório bifrost-js-sdk](https://github.com/stellar/bifrost-js-sdk) para ter um exemplo de como isso pode ser implementado.
