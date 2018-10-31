---
title: Protocolo Compliance
---

# Protocolo Compliance

Cumprir leis Anti-Money Laundering (AML) requer que instituições financeiras (IFs) conheçam não só para quem seus clientes estão enviando dinheiro, mas também de quem seus clientes recebem dinheiro. Em algumas jurisdições, bancos podem confiar nos procedimentos AML de outros bancos licenciados. Em outras jurisdições, cada banco deve fazer sua própria verificação de ambos remetente e destinatário de uma transação.
O Protocolo de Compliance cuida de todas essas situações.

As informações de clientes compartilhadas entre IFs são flexíveis, mas os campos típicos são:
 - Nome completo
 - Data de nascimento
 - Endereço físico

O Protocolo Compliance é um passo adicional após o [federation](https://www.stellar.org/developers/guides/concepts/federation.html). Neste passo, a IF remetente entra em contato com a IF destinatária para receber permissão para enviar a transação. Para fazer isso, a IF destinatária cria um `AUTH_SERVER` e adiciona sua localização ao [stellar.toml](https://www.stellar.org/developers/guides/concepts/stellar-toml.html) da IF.

Você pode criar seu próprio endpoint que implementa o protocolo compliance, ou pode usar este [serviço de compliance simples](https://github.com/stellar/bridge-server/blob/master/readme_compliance.md) que criamos.

## AUTH_SERVER

O `AUTH_SERVER` providencia um endpoint que é chamado por uma IF remetente para receber aprovação para enviar um pagamento a um cliente da IF destinatária. A URL `AUTH_SERVER` deve ser colocada no arquivo [stellar.toml](https://www.stellar.org/developers/guides/concepts/stellar-toml.html) da organização.

#### Request

Para enviar dados da transação para a organização recipiente, envie um HTTP POST ao `AUTH_SERVER` com `Content-Type` igual a `application/x-www-form-urlencoded` e o seguinte body:
```
data=<valor data>&sig=<valor sig>
```

**data** é um bloco de JSON que contém os seguintes campos:

Nome | Tipo de Dado | Descrição
-----|-----------|------------
`sender` | string | O endereço de pagamento do cliente que está iniciando o envio. Ex. `zezinho*banco.com.br`
`need_info` | boolean | Se o chamador precisa das informações AML do recipiente para enviar o pagamento.
`tx` | string: [xdr.Transaction](https://github.com/stellar/stellar-core/blob/4961b8bb4a64c68838632c5865389867e9f02840/src/xdr/Stellar-transaction.x#L297-L322) codificado em base64 | A transação que o remetente gostaria de enviar em formato XDR. Esta transação não está assinada e seu número sequencial deve ser igual a `0`.
`attachment` | string | O texto completo do anexo (attachment). O hash deste anexo está incluso como um memo na transação. O campo **attachment** segue a [Convenção de Anexos Stellar](./attachment.md) e deve conter pelo menos informações do remetente suficientes para permitir que a IF destinatária faça sua verificação.

**sig** é a assinatura do bloco data feita pela IF remetente. A instituição recipiente deve checar se essa assinatura é válida batendo-a com a chave para assinaturas pública postada no [stellar.toml](https://www.stellar.org/developers/guides/concepts/stellar-toml.html) da IF remetente (campo `SIGNING_KEY`).

Exemplo do body da request (favor notar que isso contém ambos os parâmetros `data` e `sig`):
```
data=%7B%22sender%22%3A%22aldi%2AbankA.com%22%2C%22need_info%22%3Atrue%2C%22tx%22%3A%22AAAAAEhAArfpmUJYq%2FQ9SFAH3YDzNLJEBI9i9TXmJ7s608xbAAAAZAAMon0AAAAJAAAAAAAAAAPUg1%2FwDrMDozn8yfiCA8LLC0wF10q5n5lo0GiFQXpPsAAAAAEAAAAAAAAAAQAAAADdvkoXq6TXDV9IpguvNHyAXaUH4AcCLqhToJpaG6cCyQAAAAAAAAAAAJiWgAAAAAA%3D%22%2C%22attachment%22%3A%22%7B%5C%22nonce%5C%22%3A%5C%221488805458327055805%5C%22%2C%5C%22transaction%5C%22%3A%7B%5C%22sender_info%5C%22%3A%7B%5C%22address%5C%22%3A%5C%22678+Mission+St%5C%22%2C%5C%22city%5C%22%3A%5C%22San+Francisco%5C%22%2C%5C%22country%5C%22%3A%5C%22US%5C%22%2C%5C%22first_name%5C%22%3A%5C%22Aldi%5C%22%2C%5C%22last_name%5C%22%3A%5C%22Dobbs%5C%22%7D%2C%5C%22route%5C%22%3A%5C%221%5C%22%2C%5C%22note%5C%22%3A%5C%22%5C%22%2C%5C%22extra%5C%22%3A%5C%22%5C%22%7D%2C%5C%22operations%5C%22%3Anull%7D%22%7D&sig=KgvyQTZsZQoaMy8jdwCUfLayfgfFMUdZJ%2B0BIvEwiH5aJhBXvhV%2BipRok1asjSCUS%2FUaGeGKDoizS1%2BtFiiyAA%3D%3D

```

Depois de decodificar o parâmetro `data`, a forma é a seguinte:

```json
{
  "sender": "aldi*bankA.com",
  "need_info": true,
  "tx": "AAAAAEhAArfpmUJYq/Q9SFAH3YDzNLJEBI9i9TXmJ7s608xbAAAAZAAMon0AAAAJAAAAAAAAAAPUg1/wDrMDozn8yfiCA8LLC0wF10q5n5lo0GiFQXpPsAAAAAEAAAAAAAAAAQAAAADdvkoXq6TXDV9IpguvNHyAXaUH4AcCLqhToJpaG6cCyQAAAAAAAAAAAJiWgAAAAAA=",
  "attachment": "{\"nonce\":\"1488805458327055805\",\"transaction\":{\"sender_info\":{\"address\":\"678 Mission St\",\"city\":\"San Francisco\",\"country\":\"US\",\"first_name\":\"Aldi\",\"last_name\":\"Dobbs\"},\"route\":\"1\",\"note\":\"\",\"extra\":\"\"},\"operations\":null}"
}
```

Favor notar que o valor memo de `tx` é um hash SHA256 do anexo.

#### Resposta

O `AUTH_SERVER` irá retornar um objeto JSON com os seguintes campos:

Nome | Tipo de Dado | Descrição
-----|-----------|------------
`info_status` | `ok`, `denied`, `pending` | Se esta IF está disposta a compartilhar informações AML ou não.
`tx_status` | `ok`, `denied`, `pending` | Se esta IF está disposta a aceitar esta transação.
`dest_info` | string | *(apenas presente se `info_status` estiver `ok`)* JSON *marshalled* das informações AML do recipiente.
`pending` | integer | *(apenas presente se `info_status` ou `tx_status` estiver `pending`)* Número estimado de segundos até que o remente possa verificar novamente por uma mudança de status. O remetente deve apenas reenviar esta request após o número de segundos dado.

*Exemplo de Resposta*

```json
{
    "info_status": "ok",
    "tx_status": "pending",
    "dest_info": "{\"name\": \"John Doe\"}",
    "pending": 3600
}
```


----



## Exemplo de Fluxo
Neste exemplo, Aldi `aldi*bankA.com` quer enviar a Bogart `bogart*bankB.com`:

**1) BankA recebe a informação necessária para interagir com BankB**

Isso é feito pela consulta ao arquivo `stellar.toml` de BankB.

BankA  -> realiza fetch de `https://bankB.com/.well-known/stellar.toml`

A partir deste arquivo .toml, são obtidas as seguintes informações de BankB:
 - `FEDERATION_SERVER`
 - `AUTH_SERVER`

**2) BankA recebe as informações de roteamento de Bogart para poder construir a transação**

Isso é feito por pedir ao servidor federation de BankB para resolver `bogart*bankB.com`.

BankA -> `FEDERATION_SERVER?type=name&q=bogart*bankB.com`

Veja em [Federation](https://www.stellar.org/developers/guides/concepts/federation.html) uma descrição completa. Os campos de interesse retornados aqui são:
 - ID da conta Stellar (AccountID) da IF de Bogart
 - Informações de roteamento de Bogart

Exemplo de resposta do federation:
```json
{
  "stellar_address": "bogart*bankB.com",
  "account_id": "GDJ2GYMIQRIPTJZXQAVE5IM675ITLBAMQJS7AEFIWM4HZNGHVXOZ3TZK",
  "memo_type": "id",
  "memo": 1
}
```

**3) BankA faz a Auth Request a BankB**

Esta request irá pedir a BankB as informações AML de Bogart e pedir permissão para enviar a Bogart.

BankA -> `AUTH_SERVER`

Exemplo de body da request (favor notar que estão contidos ambos os parâmetros `data` e `sig`):
```
data=%7B%22sender%22%3A%22aldi%2AbankA.com%22%2C%22need_info%22%3Atrue%2C%22tx%22%3A%22AAAAAEhAArfpmUJYq%2FQ9SFAH3YDzNLJEBI9i9TXmJ7s608xbAAAAZAAMon0AAAAJAAAAAAAAAAPUg1%2FwDrMDozn8yfiCA8LLC0wF10q5n5lo0GiFQXpPsAAAAAEAAAAAAAAAAQAAAADdvkoXq6TXDV9IpguvNHyAXaUH4AcCLqhToJpaG6cCyQAAAAAAAAAAAJiWgAAAAAA%3D%22%2C%22attachment%22%3A%22%7B%5C%22nonce%5C%22%3A%5C%221488805458327055805%5C%22%2C%5C%22transaction%5C%22%3A%7B%5C%22sender_info%5C%22%3A%7B%5C%22address%5C%22%3A%5C%22678+Mission+St%5C%22%2C%5C%22city%5C%22%3A%5C%22San+Francisco%5C%22%2C%5C%22country%5C%22%3A%5C%22US%5C%22%2C%5C%22first_name%5C%22%3A%5C%22Aldi%5C%22%2C%5C%22last_name%5C%22%3A%5C%22Dobbs%5C%22%7D%2C%5C%22route%5C%22%3A%5C%221%5C%22%2C%5C%22note%5C%22%3A%5C%22%5C%22%2C%5C%22extra%5C%22%3A%5C%22%5C%22%7D%2C%5C%22operations%5C%22%3Anull%7D%22%7D&sig=KgvyQTZsZQoaMy8jdwCUfLayfgfFMUdZJ%2B0BIvEwiH5aJhBXvhV%2BipRok1asjSCUS%2FUaGeGKDoizS1%2BtFiiyAA%3D%3D
```

Após decodificar o parâmetro `data`, a forma é a seguinte:

```json
{
  "sender": "aldi*bankA.com",
  "need_info": true,
  "tx": "AAAAAEhAArfpmUJYq/Q9SFAH3YDzNLJEBI9i9TXmJ7s608xbAAAAZAAMon0AAAAJAAAAAAAAAAPUg1/wDrMDozn8yfiCA8LLC0wF10q5n5lo0GiFQXpPsAAAAAEAAAAAAAAAAQAAAADdvkoXq6TXDV9IpguvNHyAXaUH4AcCLqhToJpaG6cCyQAAAAAAAAAAAJiWgAAAAAA=",
  "attachment": "{\"nonce\":\"1488805458327055805\",\"transaction\":{\"sender_info\":{\"address\":\"678 Mission St\",\"city\":\"San Francisco\",\"country\":\"US\",\"first_name\":\"Aldi\",\"last_name\":\"Dobbs\"},\"route\":\"1\",\"note\":\"\",\"extra\":\"\"},\"operations\":null}"
}
```

Favor notar que o valor memo de `tx` é um hash SHA256 do anexo e o destino do pagamento é retornado pelo servidor federation. Você pode checar a transação acima utilizando o [XDR Viewer](https://www.stellar.org/laboratory/#xdr-viewer?input=AAAAAEhAArfpmUJYq%2FQ9SFAH3YDzNLJEBI9i9TXmJ7s608xbAAAAZAAMon0AAAAJAAAAAAAAAAPUg1%2FwDrMDozn8yfiCA8LLC0wF10q5n5lo0GiFQXpPsAAAAAEAAAAAAAAAAQAAAADdvkoXq6TXDV9IpguvNHyAXaUH4AcCLqhToJpaG6cCyQAAAAAAAAAAAJiWgAAAAAA%3D&type=Transaction&network=test).

**4) BankB opera a Auth Request**

 - BankB obtém o domínio do remetente dividindo o endereço do remetente (`aldi*bankA.com`) em duas partes: `aldi` e `bankA.com`
 - BankB -> realiza fetch de `https://bankA.com/.well-known/stellar.toml`
   A partir disso, obtém-se a `SIGNING_KEY` de BankA
 - BankB verifica que a assinatura na Auth Request foi assinada com a `SIGNING_KEY` de BankA
 - BankB faz sua verificação em Aldi. Isso determina o valor de `tx_status`.
 - BankB decide revelar ou não a informação AML de Bogart, baseado no seguinte:
   - Bogart tornou suas informações públicas
   - Bogart permitiu BankA
   - Bogart permitiu Aldi
   - BankB permitiu BankA
 - Se nenhum destes critérios forem cumpridos, BankB deve perguntar a Bogart se ele quer revelar essas informações a BankA e aceitar este pagamento. Neste caso, BankB irá retornar `info_status: "pending"` na resposta à Auth request para dar a Bogart tempo para decidir se quer ou não aceitar o pagamento.
 - Se BankB determinar que pode compartilhar as informações AML com BankA, BankB envia essas informações no campo `dest_info` junto à resposta.

Veja em [resposta do Auth Server](#resposta) valores de retorno possíveis.

Exemplo de Resposta:

```json
{
    "info_status": "ok",
    "tx_status": "ok",
    "dest_info": "{\"name\": \"Bogart Doe\"}",
}
```

**5) BankA lida com a resposta à Auth request**

Se a chamada ao AUTH_SERVER tiver retornado `pending`, BankA deve reenviar a request novamente após o número estimado de segundos.

**6) BankA realiza as verificações**

Após BankA tiver recebido a `dest_info` de BankB, BankA realiza suas verificações usando as informações AML de Bogart. Se estas verificações passarem, BankA assina e submete a transação à rede Stellar.


**7) BankB opera o pagamento enviado**

 - BankB bate o hash da transação com um cache que tiver ou refaz suas verificações sobre o remetente.
 - BankB credita a conta de Bogart com a quantia enviada ou envia a transação de volta.
