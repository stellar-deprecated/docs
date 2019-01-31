---
title: Adicione Stellar a sua Exchange
---

Este guia irá indicar os passos de integração para adicionar Stellar a sua exchange. Este exemplo usa Node.js e o [SDK de Stellar para JS](https://github.com/stellar/js-stellar-sdk), mas deve ser fácil adaptá-los a outras linguagens.

Há várias maneiras de arquitetar uma exchange. Este guia usa o seguinte design:
 - `issuing account`: Conta emissora. Uma conta Stellar que detém offline a maioria dos depósitos dos clientes.
 - `base account`: Conta base. Uma conta Stellar que detém online uma pequena quantidade de depósitos dos clientes e é usada para custear pedidos de saque.
 - `customerID`: ID do cliente. Cada usuário possui um customerID, usado para correlacionar envios de depósito e a conta de um usuário específico na exchange.

Os dois pontos principais de integração ao Stellar para uma exchange são:<br>
1) Escutar transações de depósito a partir da rede Stellar<br>
2) Submeter transações de saque à rede Stellar

## Configuração

### Operacional
* *(opcional)* Configurar [Stellar Core](https://www.stellar.org/developers/stellar-core/software/admin.html)
* *(opcional)* Configurar [Horizon](https://www.stellar.org/developers/horizon/reference/index.html)

Se sua exchange não tiver que lidar com muito volume, não é preciso montar suas próprias instâncias de Stellar Core e Horizon. Ao invés disso, use um dos servidores públicos de Horizon do Stellar.org.
```
  test net: {hostname:'horizon-testnet.stellar.org', secure:true, port:443};
  live: {hostname:'horizon.stellar.org', secure:true, port:443};
```

### Conta emissora
Uma conta emissora é tipicamente usada para guardar com segurança a maior parte dos fundos dos clientes. Uma conta emissora é uma conta Stellar cujas chaves secretas não estão em nenhum dispositivo que tenha contato com a Internet. transações são iniciadas manualmente por um humano e assinadas localmente na máquina offline — uma instalação local de `js-stellar-sdk` cria uma `tx_blob` que contém a transação assinada. Esta `tx_blob` pode ser transportada para uma máquina conectada à Internet por métodos offline (ex.: USB ou manualmente). Esta operação torna a chave secreta da conta emissora muito mais difícil de ser comprometida.

### Conta base
Uma conta base contém um número mais limitado de fundos que uma conta emissora. Uma conta base é uma conta Stellar usada em uma máquina que está conectada à Internet. Ela realiza operações cotidianas de envio e recebimento de lumens. O número limitado de fundos numa conta base evita maiores perdas em caso de uma quebra de segurança.

### Base de dados
- Necessário criar uma tabela de saques pendentes, `StellarTransactions`.
- Necessário criar uma tabela para guardar a última posição do cursor do stream de depósitos, `StellarCursor`.
- Necessário adicionar uma linha à sua tabela de usuários que cria um `customerID` único para cada usuário.
- Necessário popular a linha customerID.

```
CREATE TABLE StellarTransactions (UserID INT, Destination varchar(56), XLMAmount INT, state varchar(8));
CREATE TABLE StellarCursor (id INT, cursor varchar(50)); // id - AUTO_INCREMENT field
```

Os valores possíveis de `StellarTransactions.state` são "pending", "done", e "error".


### Código

Aqui está um template de código que pode ser usado para integrar Stellar à sua exchange. As seções a seguir descrevem cada passo.

Para este guia, usamos funções placeholder para ler/editar a base de dados da exchange. Cada biblioteca de base de dados se conecta de maneira de diferente, então abstraímos esses detalhes.

```js
// Configurar seu servidor
var config = {};
config.baseAccount = "endereço da sua conta base";
config.baseAccountSecret = "chave secreta da sua conta base";

// Pode-se usar a instância do Horizon do Stellar.org ou a sua própria
config.horizon = 'https://horizon-testnet.stellar.org';

// Incluir o SDK de Stellar para JS
// Ele fornece uma interface lado cliente para o Horizon
var StellarSdk = require('stellar-sdk');
// descomentar para usar a rede ativa:
// StellarSdk.Network.usePublicNetwork();

// Inicializar o SDK de Stellar com a instância do Horizon
// Conectar-se a
var server = new StellarSdk.Server(config.horizon);

// Receber a última posição do cursor
var lastToken = latestFromDB("StellarCursor");

// Escutar pagamentos a partir do último ponto onde parou
// GET https://horizon-testnet.stellar.org/accounts/{config.baseAccount}/payments?cursor={last_token}
let callBuilder = server.payments().forAccount(config.baseAccount);

// Se nenhum cursor estiver sido salvo ainda, não adicionar o parâmetro cursor
if (lastToken) {
  callBuilder.cursor(lastToken);
}

callBuilder.stream({onmessage: handlePaymentResponse});

// Carregar o número sequencial da conta a partir do Horizon e retornar a conta
// GET https://horizon-testnet.stellar.org/accounts/{config.baseAccount}
server.loadAccount(config.baseAccount)
  .then(function (account) {
    submitPendingTransactions(account);
  })
```

## Escutar depósitos
Quando um usuário quiser depositar lumens na sua exchange, instrua-os a enviar XLM à conta base que você possui, inserindo o customerID no campo memo da transação.

Você deve escutar pagamentos que caem na conta base e creditar todos os usuários que enviarem XLM lá. Aqui está um código que escuta esses pagamentos:

```js
// Começar a escutar pagamentos a partir do último ponto onde parou
var lastToken = latestFromDB("StellarCursor");

// GET https://horizon-testnet.stellar.org/accounts/{config.baseAccount}/payments?cursor={last_token}
let callBuilder = server.payments().forAccount(config.baseAccount);

// Se nenhum cursor tiver sido salvo ainda, não adicionar o parâmetro cursor
if (lastToken) {
  callBuilder.cursor(lastToken);
}

callBuilder.stream({onmessage: handlePaymentResponse});
```


Para cada pagamento recebido pela conta base, você deve:<br>
-checar o campo memo para determinar que usuário enviou o depósito.<br>
-gravar o cursor na tabela `StellarCursor` para poder continuar o processamento do pagamento de onde parou.<br>
-creditar a conta do usuário na base de dados com o número de XLM enviados no depósito.

Então, você passa essa função como a opção `onmessage` ao fazer stream dos pagamentos:

```js
function handlePaymentResponse(record) {

  // GET https://horizon-testnet.stellar.org/transaction/{id da transação que é parte deste pagamento}
  record.transaction()
    .then(function(txn) {
      var customer = txn.memo;

      // Se isso não for um pagamento à conta base, pular
      if (record.to != config.baseAccount) {
        return;
      }
      if (record.asset_type != 'native') {
         // Se você é uma exchange de XLM e o cliente envia a você
         // um ativo não nativo, algumas opções para tratá-lo é
         // 1. Trocar o ativo para nativo e creditar aquela quantia
         // 2. Devolvê-lo ao cliente
      } else {
        // Creditar o cliente no campo memo
        if (checkExists(customer, "ExchangeUsers")) {
          // Atualizar em uma transação atômica
          db.transaction(function() {
            // Armazenar a quantia paga pelo cliente em sua base de dados
            store([record.amount, customer], "StellarDeposits");
            // Armazenar o cursor em sua base de dados
            store(record.paging_token, "StellarCursor");
          });
        } else {
          // Se o cliente não pode ser encontrado, pode-se apontar um erro,
          // adicioná-lo a sua lista de clientes e creditá-los,
          // ou tomar qualquer outra ação apropriada a suas necessidades
          console.log(customer);
        }
      }
    })
    .catch(function(err) {
      // Processar erro
    });
}
```


## Submeter saques
Quando um usuário pede um saque de lumens da sua exchange, você deve gerar uma transação Stellar para enviar os lumens a ele. Aqui se encontra uma documentação adicional sobre [Construir Transações](https://www.stellar.org/developers/js-stellar-base/learn/building-transactions.html).

A função `handleRequestWithdrawal` irá enfileirar uma transação na tabela `StellarTransactions` da exchange sempre que houver um pedido de saque.

```js
function handleRequestWithdrawal(userID,amountLumens,destinationAddress) {
  // Atualizar em uma transação atômica
  db.transaction(function() {
    // Ler o saldo do usuário a partir da base de dados da exchange
    var userBalance = getBalance('userID');

    // Verificar se o usuário possui os lumens necessários
    if (amountLumens <= userBalance) {
      // Debitar o saldo de lumens interno do usuário na quantia de lumens que ele está sacando
      store([userID, userBalance - amountLumens], "UserBalances");
      // Salvar as informações da transação na tabela StellarTransactions
      store([userID, destinationAddress, amountLumens, "pending"], "StellarTransactions");
    } else {
      // Se o usuário não tiver XLM suficientes, você pode alertá-los
    }
  });
}
```

Então, você deve rodar `submitPendingTransactions`, que irá procurar em `StellarTransactions` por transações pendentes e submetê-las.

```js
StellarSdk.Network.useTestNetwork();
// Esta é a função que cuida de submeter uma transação individual

function submitTransaction(exchangeAccount, destinationAddress, amountLumens) {
  // Atualizar estado da transação para sending para que
  // ela não seja reenviada em caso de falha.
  updateRecord('sending', "StellarTransactions");

  // Verificar se o endereço de destino existe
  // GET https://horizon-testnet.stellar.org/accounts/{destinationAddress}
  server.loadAccount(destinationAddress)
    // Se sim, continuar e submeter uma transação à conta de destino
    .then(function(account) {
      var transaction = new StellarSdk.TransactionBuilder(exchangeAccount)
        .addOperation(StellarSdk.Operation.payment({
          destination: destinationAddress,
          asset: StellarSdk.Asset.native(),
          amount: amountLumens
        }))
        // Assinar a transação
        .build();

      transaction.sign(StellarSdk.Keypair.fromSecret(config.baseAccountSecret));

      // POST https://horizon-testnet.stellar.org/transactions
      return server.submitTransaction(transaction);
    })
    // Mas se o destino não existir...
    .catch(StellarSdk.NotFoundError, function(err) {
      // criar uma conta e colocar fundos
      var transaction = new StellarSdk.TransactionBuilder(exchangeAccount)
        .addOperation(StellarSdk.Operation.createAccount({
          destination: destinationAddress,
          // Criar uma conta requer financiá-la com XLM
          startingBalance: amountLumens
        }))
        .build();

      transaction.sign(StellarSdk.Keypair.fromSecret(config.baseAccountSecret));

      // POST https://horizon-testnet.stellar.org/transactions
      return server.submitTransaction(transaction);
    })
    // Submeter a transação criada em todo caso
    .then(function(transactionResult) {
      updateRecord('done', "StellarTransactions");
    })
    .catch(function(err) {
      // Dar catch em erros, provavelmente com a rede ou sua transação
      updateRecord('error', "StellarTransactions");
    });
}

// Esta função é responsável por submeter todas as transações pendentes, e chama a anterior
// Esta função deve estar rodando em segundo plano continuadamente

function submitPendingTransactions(exchangeAccount) {
  // Ver que transações na db ainda estão pendentes
  // Atualizar em uma transação atômica
  db.transaction(function() {
    var pendingTransactions = querySQL("SELECT * FROM StellarTransactions WHERE state =`pending`");

    while (pendingTransactions.length > 0) {
      var txn = pendingTransactions.pop();

      // Esta função é assíncrona, então não irá dar block. Para facilitar, estamos usando
      // a keyword ES7 `await` mas recomendamos criar uma "promise waterfall"
      // para que a linha `setTimeout` abaixo seja executada após todas as transações serem submetidas.
      // Se não fizer isso, será possível enviar uma transação duas vezes ou mais.
      await submitTransaction(exchangeAccount, tx.destinationAddress, tx.amountLumens);
    }

    // Aguardar 30 segundos e processar o próximo lote de transações.
    setTimeout(function() {
      submitPendingTransactions(sourceAccount);
    }, 30*1000);
  });
}
```

## Indo além...
### Federation
O protocolo federation permite dar a seus usuários endereços fáceis — ex.: zezinho*suaexchange.com — no lugar de endereços difíceis de usar, como GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ?19327.

Para mais informações, dê uma olhada no [guia sobre federation](./concepts/federation.md).

### Âncora
Se você for uma exchange, é fácil se tornar uma âncora Stellar também. Os pontos de integração são muito parecidos, com o mesmo nível de dificuldade. Tornar-se uma âncora poderia expandir seus negócios.

Para aprender mais sobre o que significa ser uma âncora, veja o [guia para âncoras](./anchor/).

### Aceitar ativos não nativos
Primeiro, abra uma [trustline](https://www.stellar.org/developers/guides/concepts/assets.html#trustlines) com a conta emissora do ativo não nativo; sem isso, não é possível começar a aceitar esse ativo.

```js
var someAsset = new StellarSdk.Asset('ASSET_CODE', issuingKeys.publicKey());

transaction.addOperation(StellarSdk.Operation.changeTrust({
        asset: someAsset
}))
```
Se o emissor do ativo definiu `authorization_required` como true, será preciso aguardar a trustline ser autorizada antes de começar a aceitar esse ativo. Leia mais sobre [autorização de trustlines aqui](https://www.stellar.org/developers/guides/concepts/assets.html#controlar-detentores-de-um-ativo).

Depois, faça algumas pequenas mudanças ao código de exemplo acima:
* Na função `handlePaymentResponse`, lidamos com o caso de receber ativos não nativos. Agora que estamos aceitando ativos não nativos, é preciso alterar essa condição; se o usuário nos enviar lumens, tomaremos uma das seguintes ações:
	1. Trocar lumens pelo ativo não nativo desejado
	2. Devolver os lumens ao remetente

*Note*: o usuário não pode nos enviar ativos não nativos de contas emissoras com que não tivermos aberto uma trustline explicitamente.

* Na função `withdraw`, ao adicionar uma operação à transação, precisamos especificar os detalhes do ativo que estamos enviando. Por exemplo:

```js
var someAsset = new StellarSdk.Asset('ASSET_CODE', issuingKeys.publicKey());

transaction.addOperation(StellarSdk.Operation.payment({
        destination: receivingKeys.publicKey(),
        asset: someAsset,
        amount: '10'
      }))
```

* Também na função `withdraw`, note que seu cliente deve ter aberto uma trustline com a conta emissora do ativo que estiver sacando. Assim é preciso levar em consideração o seguinte:
	* Confirmar que o usuário para quem você está enviando o ativo tem uma trustline
	* Parsear o [erro do Horizon](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#payment) que irá ocorrer após enviar um ativo à conta sem uma trustline


Para mais informações sobre ativos, dê uma olhada no [guia geral sobre ativos](https://www.stellar.org/developers/guides/concepts/assets.html) e o [guia para emitir ativos](https://www.stellar.org/developers/guides/issuing-assets.html).
