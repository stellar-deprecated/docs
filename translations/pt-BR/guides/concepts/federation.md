---
title: Federation
---

O protocolo federation do Stellar mapeia endereços Stellar a mais informações sobre dado usuário. É uma maneira para softwares clientes do Stellar
pegarem endereços parecidos como e-mails como `nome*seudominio.com` e resolvê-los em IDs de conta como: `GCCVPYFOHY7ZB7557JKENAX62LUAPLMGIWNZJAFV2MITK6T32V37KEJU`. Endereços Stellar dão uma maneira fácil
para usuários compartilharem detalhes de pagamentos usando uma sintaxe que interopera entre diferentes domínios e provedores.

![Mockup of using a payment address](assets/mockup.png)

## Endereços Stellar

Endereços Stellar são divididos em duas partes separadas por `*`, o nome de usuário e o domínio.

Por exemplo, em  `jed*stellar.org`:
* `jed` é o nome de usuário,
* `stellar.org` é o domínio.

O domínio pode ser qualquer nome de domínio RFC 1035 válido.
O nome de usuário é limitado a UTF-8 printável, excluídos espaços em branco e os seguintes caracteres: <*,> É claro, o administrator do domínio pode colocar restrições adicionais aos nomes de usuário que usem seu domínio.

Note que o símbolo `@` é permitido no nome de usuário. Isso permite usar endereços de e-mail no nome de usuário de um endereço Stellar. Por exemplo: `maria@gmail.com*stellar.org`.

## Dar Suporte ao Federation

### Passo 1: Criar um arquivo [stellar.toml](./stellar-toml.md)

Crie um arquivo chamado stellar.toml e coloque-o em `https://SEU_DOMINIO/.well-known/stellar.toml`.

### Passo 2: Adicionar federation_url

Adicione uma seção `FEDERATION_SERVER` em seu arquivo stellar.toml que informe a outras pessoas a URL do seu endpoint para federation.

Por exemplo: `FEDERATION_SERVER="https://api.seudominio.com/federation"`

Por favor note que o seu servidor federation **deve** usar o protocolo `https`.

### Passo 3: Implementar o endpoint HTTP do federation

A URL para federation especificada em seu arquivo stellar.toml deve aceitar um GET request HTTP e emitir respostas na forma detalhada abaixo.

Em vez de construir seu próprio servidor, é possível usar o [`federation server`](https://github.com/stellar/go/tree/master/services/federation) construído pela Stellar Development Foundation.

## Federation Requests
Você pode usar o endpoint federation para pesquisar IDs de conta a partir de um endereço Stellar. Também é possível fazer o que se chama de **federation reverso** e consultar endereços Stellar a partir de IDs de conta ou IDs de transações. Isso é útil para ver quem enviou um pagamento a você.

Federation requests são `GET` requests HTTP com a seguinte forma:

`?q=<string a ser pesquisada>&type=<name,forward,id,txid>`

Tipos suportados:
 - **name**: Exemplo: `https://SEU_SERVIDOR_FEDERATION/federation?q=jed*stellar.org&type=name`
 - **forward**: Usado para encaminhar o pagamento a diferentes redes ou instituições financeiras. Os outros parâmetros do query irão variar dependendo de que tipo de instituição é o destino final do pagamento e o que você, como a âncora que o está encaminhando, suporta. Seu arquivo [stellar.toml](./stellar-toml.md) deve especificar que parâmetros você espera em uma federation request `forward`. Se você não conseguir encaminhar o pagamento, ou se os outros parâmetros na request forem incorretos, você deverá retornar um erro para este efeito. Exemplo de request:  `https://SEU_SERVIDOR_FEDERATION/federation?type=forward&forward_type=bank_account&swift=BOPBPHMM&acct=2382376`
 - **id**: *não suportado por todos os servidores federation* Um federation reverso retorna o endereço Stellar registrado no federation que está associado a dado ID de conta. Em alguns casos isso é ambíguo. Por exemplo, se uma âncora envia transações em nome de seus usuários, o ID da conta será da âncora e o servidor federation não será capaz de resolver o usuário particular que enviou a transação. Em casos assim pode ser preciso usar **txid** no lugar. Exemplo: `https://SEU_SERVIDOR_FEDERATION/federation?q=GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD&type=id`
 - **txid**: *não suportado por todos os servidores federation* Retorna o registro federation do remetente da transação, se for conhecido pelo servidor. Exemplo: `https://SEU_SERVIDOR_FEDERATION/federation?q=c1b368c00e9852351361e07cc58c54277e7a6366580044ab152b8db9cd8ec52a
&type=txid`

### Resposta do Federation
O servidor federation deve responder com um código de status HTTP apropriado, headers e uma resposta JSON.

Você deve habilitar CORS no servidor federation para clientes poderem enviar requests a partir de outros sites. O header HTTP a seguir deve ser setado para todas as respostas de servidores federation.

```
Access-Control-Allow-Origin: *
```

Quando um registro for encontrado, a resposta deve retornar o código de status HTTP `200 OK` e o seguinte body em JSON:

```
{
  "stellar_address": <username*domain.tld>,
  "account_id": <account_id>,
  "memo_type": <"text", "id" , ou "hash"> *opcional*
  "memo": <memo anexo a qualquer pagamento. se for do tipo "hash", estará codificado em base64> *opcional*
}
```

Se um redirecionamento for necessário, o servidor federation deve retornar o código de status HTTP `3xx` e redirecionar imediatamente o usuário à URL correta utilizando o header `Location`.

Quando um registro não for encontrado, deve-se retornar o código de status HTTP `404 Not Found`.

Todo outro tipo de código de status HTTP será considerado um erro. O body deve conter detalhes sobre o erro:

```
{
   "detail": "detalhes adicionais dados pelo servidor federation"
}
```

## Consultar um provedor federation por uma entrada home domain
Facultativamente, contas podem ter um [home domain](./accounts.md#home-domain) especificado. Isso permite que uma conta especifique programaticamente onde está o provedor federation daquela conta.

## Cache

Recomenda-se não manter respostas de servidores federation em cache. Algumas organizações podem gerar IDs aleatórios para proteger a privacidade de seus usuários. Esses IDs podem mudar ao longo do tempo.
