---
title: Convenção de Anexos do Stellar
---

# Anexos

Às vezes é preciso enviar mais informações sobre uma transação do que cabe no campo memo providenciado, como informações KYC, um recibo, uma pequena anotação. Dados desse tipo não devem ser colocados no [ledger](./concepts/ledger.md) por conta de seu tamanho ou natureza privada. Em vez disso, deve-se criar o que chamamos de um `Attachment`, ou anexo. Um anexo Stellar é simplesmente um documento JSON. O hash SHA256 do anexo é incluído como um hash no memo da transação. O documento anexo em si pode ser enviado para o recipiente por meio de outro canal, muito provavelmente pelo [servidor Auth](./compliance-protocol.md) do recipiente.

## Estrutura dos anexos

Anexos têm uma estrutura flexível. Eles podem incluir os campos a seguir, mas eles são opcionais e pode haver informações adicionais anexadas.

```json
{
  "nonce": "<nonce>",
  "transaction": {
    "sender_info": {
      "first_name": "<primeiro nome>",
      "middle_name": "<nome do meio>",
      "last_name": "<último nome>",
      "address": "<endereço>",
      "city": "<cidade>",
      "province": "<província ou estado>",
      "country": "<país em formato ISO 3166-1 alpha-2>",
      "date_of_birth": "<data de nascimento em formato YYYY-MM-DD>",
      "company_name": "<nome da empresa>"
    },
    "route": "<rota>",
    "note": "<anotação>"
  },
  "operations": [
    {
      "sender_info": <informações do emissor>,
      "route": "<rota>",
      "note": "<anotação>"
    },
    // ...
  ]
}
```

Nome | Tipo do Dado | Descrição
-----|-----------|------------
`nonce` | string | [Nonce](https://en.wikipedia.org/wiki/Cryptographic_nonce) é um valor único. Cada transação enviada deve possuir um valor distinto. Um nonce é necessário para distinguir anexos de duas transações que tenham sido enviadas com todos os outros detalhes idênticos. Por exemplo, caso você envie $10 para Bob em dois dias seguidos.
`transaction.sender_info` | JSON | JSON contendo informações KYC do emissor. Este objeto JSON pode ser extendido com mais campos se necessário.
`transaction.route` | string | Informações sobre a rota retornadas pelo servidor federation recipiente (valor `memo`). Informa ao recipiente como fazer a transação chegar ao recipiente final.
`transaction.note` | string | Uma anotação anexa à transação.
`operations[i]` | | Dado referente à operação `i`-ésima. Pode ser omitido se na transação só há uma operação.
`operations[i].sender_info` | JSON | `sender_info` para a operação `i`-ésima na transação. Se vazio, herdará valor a partir da `transaction`.
`operations[i].route` | string | `route` para a operação `i`-ésima na transação. Se vazio, herdará valor a partir da `transaction`.
`operations[i].note` | string | `note` para a operação `i`-ésima na transação. Se vazio, herdará valor a partir da `transaction`.

## Cálculo do hash do Anexo

Para calcular o hash do Anexo, é preciso converter o objeto JSON em string e calcular o hash `SHA-256`. Em Node.js:

```js
const crypto = require('crypto');
const hash = crypto.createHash('sha256');

hash.update(JSON.stringify(attachment));
var memoHashHex = hash.digest('hex');
```

Para adicionar o hash a sua transação, use o método [`TransactionBuilder.addMemo`](http://stellar.github.io/js-stellar-base/TransactionBuilder.html#addMemo).

## Envio dos Anexos

Para enviar um Anexo e seu hash (em uma transação) para o servidor Auth de uma organização recipiente, leia o documento sobre o [Protocolo de Compliance](./compliance-protocol.md) para mais informações.

## Exemplo

```js
var crypto = require('crypto');

var nonce = crypto.randomBytes(16);
var attachment = {
  "nonce": nonce.toString('hex'),
  "transaction": {
    "sender_info": {
      "name": "Sherlock Holmes",
      "address": "221B Baker Street",
      "city": "London NW1 6XE",
      "country": "UK",
      "date_of_birth": "1854-01-06"
    }
  },
  "operations": [
    // Operação #1: Pagamento para Dr. Watson
    {
      "route": "watson",
      "note": "Pagamento por ajudar a resolver caso de assassinato"
    },
    // Operação #2: Pagamento para Sra. Hudson
    {
      "route": "hudson",
      "note": "Aluguel"
    }
  ]
};

var hash = crypto.createHash('sha256');
hash.update(JSON.stringify(attachment));
var memoHashHex = hash.digest('hex');
console.log(memoHashHex);
```
