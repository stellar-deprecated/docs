---
title: Emitir Ativos
---

Um dos recursos mais poderosos do Stellar é a habilidade de trocar qualquer tipo de ativo. Dólares americanos, nairas nigerianos, bitcoins, cupons especiais, [tokens de ICOs](https://www.stellar.org/blog/tokens-on-stellar/) ou praticamente qualquer coisa que quiser.

Isso funciona no Stellar porque, na verdade, um ativo é só um crédito de uma conta particular. Ao comprar dólares dos EUA na rede Stellar, não se troca realmente dólares — troca-se dólares *creditados de uma conta particular.* Com frequência, essa conta será um banco, mas se seu vizinho tivesse uma bananeira, ele poderia emitir ativos de banana que você poderia trocar com outras pessoas.

Todo tipo de ativo (exceto lumens) é definido por duas propriedades:

- `asset_code`: um pequeno identificador de 1–12 letras ou números, como `USD` ou `EUR`. Pode ser o nome que quiser, até `AstroDollars`.
- `asset_issuer`: o ID da conta que emite o ativo.

No SDK do Stellar, ativos são representados com a classe `Asset`:

<code-example name="Representar Ativos">

```js
var astroDollar = new StellarSdk.Asset(
  'AstroDollar', 'GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF');
```

```java
KeyPair issuer = StellarSdk.Keypair.fromAccountId(
  "GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF");
Asset astroDollar = Asset.createNonNativeAsset("AstroDollar", issuer);
```

```json
// Wherever assets are used in Horizon, they use the following JSON structure:
{
  "asset_code": "AstroDollar",
  "asset_issuer": "GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF",
  // `asset_type` é usado para determinar como os dados do ativo são armazenados.
  // Pode ser `native` (lumens), `credit_alphanum4`, ou `credit_alphanum12`.
  "asset_type": "credit_alphanum12"
}
```

</code-example>


## Emitir um Novo Tipo de Ativo

Para emitir um novo tipo de ativo, tudo que você precisa é escolher um código. Pode ser qualquer combinação de até 12 letras ou números, mas recomenda-se usar o [código ISO 4217][ISO 4217] adequado (ex.: `USD` para dólares americanos) ou [ISIN] para moedas nacionais ou títulos financeiros. Após ter escolhido o código, você pode começar a pagar pessoas usando esse código de ativo. Você não precisa fazer nada para declarar seu ativo na rede.

Porém, outras pessoas não podem receber o seu ativo até terem escolhido confiar nele. Como um ativo Stellar é na verdade um crédito, deve-se confiar que o emissor tem como resgatar esse crédito se necessário. Você pode acabar decidindo não confiar no seu vizinho para emitir ativos de banana se ele nem tem uma bananeira, por exemplo.

Uma conta pode criar uma *trustline,* ou uma declaração de que ela confia em um ativo específico, usando a operação [change trust](concepts/list-of-operations.md#change-trust). Uma trustline pode também ser limitada a uma quantia específica. Se o seu vizinho que planta bananas não possui muitas bananeiras, você pode não querer confiar nele para mais de 200 bananas. *Note: cada trustline aumenta o saldo mínimo de uma conta por 0.5 lumens (a reserva base, ou base reserve). Para mais detalhes, veja o [guia de tarifas](concepts/fees.html#saldo-mínimo-da-conta).*

Uma vez que você escolheu um código de ativo e outra pessoa criou uma trustline para o seu ativo, você está livre para começar a fazer operações de pagamento a eles usando o seu ativo. Se alguém para quem você quer pagar não confia em seu ativo, você pode também usar a [exchange distribuída](concepts/exchange.md).

### Experimente

Enviar e receber ativos personalizados é muito parecido com [enviar e receber lumens](get-started/transactions.md#construir-uma-transação). Aqui está um exemplo simples:

<code-example name="Enviar Ativos Personalizados">

```js
var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// Chaves para contas emitirem e receberem o novo ativo
var issuingKeys = StellarSdk.Keypair
  .fromSecret('SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4');
var receivingKeys = StellarSdk.Keypair
  .fromSecret('SDSAVCRE5JRAI7UFAVLE5IMIZRD6N6WOJUWKY4GFN34LOBEEUS4W2T2D');

// Criar um objeto para representar o novo ativo
var astroDollar = new StellarSdk.Asset('AstroDollar', issuingKeys.publicKey());

// Primeiro, a conta recipiente deve confiar no ativo
server.loadAccount(receivingKeys.publicKey())
  .then(function(receiver) {
    var transaction = new StellarSdk.TransactionBuilder(receiver)
      // A operação `changeTrust` cria (ou altera) uma trustline
      // O parâmetro `limit` abaixo é opcional
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: astroDollar,
        limit: '1000'
      }))
      .build();
    transaction.sign(receivingKeys);
    return server.submitTransaction(transaction);
  })

  // Depois, a conta emissora de fato envia um pagamento usando o ativo
  .then(function() {
    return server.loadAccount(issuingKeys.publicKey())
  })
  .then(function(issuer) {
    var transaction = new StellarSdk.TransactionBuilder(issuer)
      .addOperation(StellarSdk.Operation.payment({
        destination: receivingKeys.publicKey(),
        asset: astroDollar,
        amount: '10'
      }))
      .build();
    transaction.sign(issuingKeys);
    return server.submitTransaction(transaction);
  })
  .catch(function(error) {
    console.error('Error!', error);
  });
```

```java
Network.useTestNetwork();
Server server = new Server("https://horizon-testnet.stellar.org");

// Chaves para contas emitirem e receberem o novo ativo
KeyPair issuingKeys = KeyPair
  .fromSecretSeed("SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4");
KeyPair receivingKeys = KeyPair
  .fromSecretSeed("SDSAVCRE5JRAI7UFAVLE5IMIZRD6N6WOJUWKY4GFN34LOBEEUS4W2T2D");

// Criar um objeto para representar o novo ativo
Asset astroDollar = Asset.createNonNativeAsset("AstroDollar", issuingKeys);

// Primeiro, a conta recipiente deve confiar no ativo
AccountResponse receiving = server.accounts().account(receivingKeys);
Transaction allowAstroDollars = new Transaction.Builder(receiving)
  .addOperation(
    // A operação `ChangeTrust` cria (ou altera) uma trustline
    // O segundo parâmetro limita a quantidade que a conta pode manter
    new ChangeTrustOperation.Builder(astroDollar, "1000").build())
  .build();
allowAstroDollars.sign(receivingKeys);
server.submitTransaction(allowAstroDollars);

// Depois, a conta emissora de fato envia um pagamento usando o ativo
AccountResponse issuing = server.accounts().account(issuingKeys);
Transaction sendAstroDollars = new Transaction.Builder(issuing)
  .addOperation(
    new PaymentOperation.Builder(receivingKeys, astroDollar, "10").build())
  .build();
sendAstroDollars.sign(issuingKeys);
server.submitTransaction(sendAstroDollars);
```

```go
issuerSeed := "SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4"
recipientSeed := "SDSAVCRE5JRAI7UFAVLE5IMIZRD6N6WOJUWKY4GFN34LOBEEUS4W2T2D"

// Chaves para contas emitirem e receberem o novo ativo
issuer, err := keypair.Parse(issuerSeed)
if err != nil { log.Fatal(err) }
recipient, err := keypair.Parse(recipientSeed)
if err != nil { log.Fatal(err) }

// Criar um objeto para representar o novo ativo
astroDollar := build.CreditAsset("AstroDollar", issuer.Address())

// Primeiro, a conta recipiente deve confiar no ativo
trustTx, err := build.Transaction(
    build.SourceAccount{recipient.Address()},
    build.AutoSequence{SequenceProvider: horizon.DefaultTestNetClient},
    build.TestNetwork,
    build.Trust(astroDollar.Code, astroDollar.Issuer, build.Limit("100.25")),
)
if err != nil { log.Fatal(err) }
trustTxe, err := trustTx.Sign(recipientSeed)
if err != nil { log.Fatal(err) }
trustTxeB64, err := trustTxe.Base64()
if err != nil { log.Fatal(err) }
_, err = horizon.DefaultTestNetClient.SubmitTransaction(trustTxeB64)
if err != nil { log.Fatal(err) }

// Depois, a conta emissora de fato envia um pagamento usando o ativo
paymentTx, err := build.Transaction(
    build.SourceAccount{issuer.Address()},
    build.TestNetwork,
    build.AutoSequence{SequenceProvider: horizon.DefaultTestNetClient},
    build.Payment(
        build.Destination{AddressOrSeed: recipient.Address()},
        build.CreditAmount{"AstroDollar", issuer.Address(), "10"},
    ),
)
if err != nil { log.Fatal(err) }
paymentTxe, err := paymentTx.Sign(issuerSeed)
if err != nil {	log.Fatal(err) }
paymentTxeB64, err := paymentTxe.Base64()
if err != nil { log.Fatal(err) }
_, err = horizon.DefaultTestNetClient.SubmitTransaction(paymentTxeB64)
if err != nil { log.Fatal(err) }
```

</code-example>

## Facilidade de Descoberta e Metainformações

Outra coisa importante ao emitir um ativo é fornecer informações claras sobre o que o seu ativo representa. Essas informações podem ser descobertas e exibidas por clientes para que usuários saibam exatamente o que eles estão ganhando ao deter o seu ativo.
Para tanto, é preciso fazer duas coisas simples. Primeiro, adicione uma seção em seu [arquivo stellar.toml](concepts/stellar-toml.md) que contenha os seguintes metacampos necessários:
```
# stellar.toml de um ativo hipotético
[[CURRENCIES]]
code="BODE"
issuer="GD5T6IPRNCKFOHQWT264YPKOZAWUMMZOLZBJ6BNQMUGPWGRLBK3U7ZNP"
display_decimals=2
name="títulos BODE"
desc="1 token BODE dá direito a uma porcentagem dos rendimentos da Fazenda de Bodes Elkins."
conditions="Só haverá 10,000 tokens BODE em existência. Distribuiremos a porcentagem dos rendimentos anualmente em 15 de Janeiro."
image="https://pbs.twimg.com/profile_images/666921221410439168/iriHah4f.jpg"
```

Depois, use a operação [set options](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#set-options) para definir o `home_domain` de sua conta emissora como o domínio onde está hospedado o arquivo stellar.toml acima.

<code-example name="Definir o Home Domain">

```js
var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// Chaves para a conta emissora
var issuingKeys = StellarSdk.Keypair
  .fromSecret('SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4');

server.loadAccount(issuingKeys.publicKey())
  .then(function(issuer) {
    var transaction = new StellarSdk.TransactionBuilder(issuer)
      .addOperation(StellarSdk.Operation.setOptions({
        homeDomain: 'seudominio.com',
      }))
      .build();
    transaction.sign(issuingKeys);
    return server.submitTransaction(transaction);
  })
  .catch(function(error) {
    console.error('Erro!', error);
  });
```

```java
Network.useTestNetwork();
Server server = new Server("https://horizon-testnet.stellar.org");

// Chaves para a conta emissora
KeyPair issuingKeys = KeyPair
  .fromSecretSeed("SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4");
AccountResponse sourceAccount = server.accounts().account(issuingKeys);

Transaction setHomeDomain = new Transaction.Builder(sourceAccount)
  .addOperation(new SetOptionsOperation.Builder()
    .setHomeDomain("seudominio.com").build()
  .build();
setAuthorization.sign(issuingKeys);
server.submitTransaction(setHomeDomain);

```

</code-example>

## Boas Práticas

Após começar a emitir seus próprios ativos, há algumas boas práticas para se seguir que podem melhorar a segurança e facilitar o gerenciamento.

### Contas Emissoras Especializadas

Nas situações mais simples, é possível emitir ativos com a sua conta Stellar que usa normalmente. Porém, se você opera uma instituição financeira ou um negócio, você deveria ter uma conta separada especificamente para emitir ativos. Por quê?

- Rastreamento fácil: como um ativo representa um crédito, ele desaparece ao ser enviado de volta para a conta que o emitiu. Para rastrear melhor e controlar a quantidade do seu ativo em circulação, pague uma quantidade fixa do ativo da conta emissora para a conta de trabalho que você usa para transações normais.

  A conta emissora pode emitir o ativo quando tiver mais do seu valor subjacente (como bananas de verdade ou notas de dólar) em mãos e as contas envolvidas em transações públicas nunca tiverem que se preocupar sobre quanto desse valor está disponível fora do Stellar.

- Simplificar a confiança: enquanto cresce o seu uso do Stellar, você pode considerar ter mais de uma conta por várias razões, tais como fazer transações a altas frequências. Manter uma conta emissora canônica torna mais fácil para outros saberem em que conta confiar.


### Exigir ou Revogar Autorização

Contas possuem [diversas flags](concepts/accounts.md#flags) relacionadas à emissão de ativos. Setar a [flag `AUTHORIZATION REVOCABLE`](concepts/assets.md#revogar-acesso) o permite congelar ativos emitidos, em caso de roubo ou outras circunstâncias especiais. Isso pode ser útil para moedas nacionais, mas não é sempre aplicável a outros tipos de ativo.

Se seu ativo é para um propósito especial, ou você gostaria de controlar quem pode ser pago com ele, use a [flag `AUTHORIZATION REQUIRED`](concepts/assets.md#controlar-detentores-de-um-ativo), que requer que a conta emissora também aprove uma trustline antes que a conta recipiente tenha permissão para ser paga com o ativo.

O exemplo a seguir define a autorização tanto como exigida (required) como revogável:

<code-example name="Autorização de Ativos">

```js
StellarSdk.Network.useTestNetwork();
var transaction = new StellarSdk.TransactionBuilder(issuingAccount)
  .addOperation(StellarSdk.Operation.setOptions({
    setFlags: StellarSdk.AuthRevocableFlag | StellarSdk.AuthRequiredFlag
  }))
  .build();
transaction.sign(issuingKeys);
server.submitTransaction(transaction);
```

```java
import org.stellar.sdk.AccountFlag;

Network.useTestNetwork();
Server server = new Server("https://horizon-testnet.stellar.org");

// Chaves para a conta emissora
KeyPair issuingKeys = KeyPair
  .fromSecretSeed("SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4");
AccountResponse sourceAccount = server.accounts().account(issuingKeys);

Transaction setAuthorization = new Transaction.Builder(sourceAccount)
  .addOperation(new SetOptionsOperation.Builder()
    .setSetFlags(
      AccountFlag.AUTH_REQUIRED_FLAG.getValue() |
      AccountFlag.AUTH_REVOCABLE_FLAG.getValue())
    .build())
  .build();
setAuthorization.sign(issuingKeys);
server.submitTransaction(setAuthorization);
```

</code-example>


### Verificar a Confiança antes de Pagar

Como toda transação vem com uma pequena tarifa, você pode preferir se certificar que uma conta realmente tem uma trustline e que ela pode receber o seu ativo antes de enviar um pagamento. Se uma conta tem uma trustline, ela será listada nos `balances` ("saldos") da conta (mesmo que o saldo seja `0`).

<code-example name="Verificar a Confiança">

```js
var astroDollarCode = 'AstroDollar';
var astroDollarIssuer =
  'GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF';

var accountId = 'GA2C5RFPE6GCKMY3US5PAB6UZLKIGSPIUKSLRB6Q723BM2OARMDUYEJ5';
server.loadAccount(accountId).then(function(account) {
  var trusted = account.balances.some(function(balance) {
    return balance.asset_code === astroDollarCode &&
           balance.asset_issuer === astroDollarIssuer;
  });

  console.log(trusted ? 'Com confiança :)' : 'Sem confiança :(');
});
```

```java
Asset astroDollar = Asset.createNonNativeAsset(
  "AstroDollar",
  KeyPair.fromAccountId(
    "GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF"));

// Carregar a conta que se quer verificar
KeyPair keysToCheck = KeyPair.fromAccountId(
  "GA2C5RFPE6GCKMY3US5PAB6UZLKIGSPIUKSLRB6Q723BM2OARMDUYEJ5");
AccountResponse accountToCheck = server.accounts().account(keysToCheck);

// Ver se há saldos referentes ao código do ativo e emissora que estamos procurando
boolean trusted = false;
for (AccountResponse.Balance balance : accountToCheck.getBalances()) {
  if (balance.getAsset().equals(astroDollar)) {
    trusted = true;
    break;
  }
}

System.out.println(trusted ? "Com confiança :)" : "Sem confiança :(");
```

</code-example>


## Mais sobre Ativos

Agora que você tem um entendimento básico sobre ativos personalizados, familiarize-se com os detalhes técnicos no nosso [documento sobre o conceito "ativos"](concepts/assets.md).


[ISO 4217]: https://pt.wikipedia.org/wiki/ISO_4217
[ISIN]: https://pt.wikipedia.org/wiki/International_Securities_Identification_Number
