---
title: Enviar e Receber Dinheiro
---

Agora que você tem uma conta, você pode enviar e receber fundos por meio da rede Stellar. Se não tiver criado uma conta ainda, leia o [passo 2 do guia Para Começar](./create-account.md).

Na maioria das vezes, você estará enviando dinheiro para outra pessoa que tem sua própria conta. Porém, para este guia interativo, é melhor você fazer uma segunda conta com a qual transacionar, pelo mesmo método que usou para fazer sua primeira conta.

## Enviar Pagamentos

Ações que alteram coisas no Stellar, como enviar pagamentos, mudar sua conta, ou fazer ofertas de troca entre vários tipos de moedas, são chamadas **operações**, ou operations.[^1] Para realizar de fato uma operação, cria-se uma **transação** (transaction), que é apenas um grupo de operações acompanhado de algumas informações adicionais, como que conta está fazendo a transação e uma assinatura criptográfica para verificar que a transação é autêntica.[^2]

Se qualquer operação na transação falhar, todas falham. Por exemplo, digamos que você tem 100 lumens e faz duas operações de pagamento de 60 lumens cada. Se fizer duas transações (cada uma com uma operação), a primeira terá sucesso e a segunda irá falhar, pois você não terá lumens suficientes. Restarão 40 lumens. No entanto, se agrupar os dois pagamentos em apenas uma transação, ambos irão falhar e todos os 100 lumens permanecerão na sua conta.

Por último, toda transação custa uma pequena tarifa. Assim como o saldo mínimo nas contas, a tarifa ajuda a impedir que pessoas sobrecarreguem o sistema com um monte de transações. Conhecida como **tarifa base** (base fee), é uma tarifa bem pequena — 100 stroops por operação (igual a 0.00001 XLM; é mais fácil falar em stroops do que em frações de lumen tão minúsculas). Uma transação com duas operações custaria 200 stroops.[^3]

### Construir uma Transação

Stellar armazena e comunica os dados das transações em um formato binário chamado XDR.[^4] Por sorte, os SDKs de Stellar dão ferramentas que cuidam de tudo isso. Aqui está como você poderia enviar 10 lumens para outra conta:

<code-example name="Submeter uma Transação">

```js
var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
var sourceKeys = StellarSdk.Keypair
  .fromSecret('SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4');
var destinationId = 'GA2C5RFPE6GCKMY3US5PAB6UZLKIGSPIUKSLRB6Q723BM2OARMDUYEJ5';
// A variável transaction irá guardar uma transação pré-construída caso o resultado seja desconhecido.
var transaction;

// Primeiro, checar para ter certeza de que a conta de destino existe.
// Você pode pular isso, mas se a conta não existir, será cobrada
// a tarifa de transação quando a transação falhar.
server.loadAccount(destinationId)
  // Se a conta não for encontrada, subir uma mensagem de erro mais agradável.
  .catch(StellarSdk.NotFoundError, function (error) {
    throw new Error('A conta de destino não existe!');
  })
  // Se não houver erro, carregar informações atualizadas sobre a sua conta.
  .then(function() {
    return server.loadAccount(sourceKeys.publicKey());
  })
  .then(function(sourceAccount) {
    // Começar a construir a transação.
    transaction = new StellarSdk.TransactionBuilder(sourceAccount)
      .addOperation(StellarSdk.Operation.payment({
        destination: destinationId,
        // Como o Stellar permite transações em várias moedas, é preciso
        // especificar o tipo do ativo (asset). O ativo especial "native" representa Lumens.
        asset: StellarSdk.Asset.native(),
        amount: "10"
      }))
      // Um memo permite adicionar seus próprios metadados a uma transação.
      // É opcional e não afeta como o Stellar trata a transação.
      .addMemo(StellarSdk.Memo.text('Transação teste'))
      .build();
    // Assinar a transação para provar que você é realmente a pessoa que está enviando.
    transaction.sign(sourceKeys);
    // E, finalmente, enviar para o Stellar!
    return server.submitTransaction(transaction);
  })
  .then(function(result) {
    console.log('Successo! Resultados:', result);
  })
  .catch(function(error) {
    console.error('Algo deu errado!', error);
    // Se o resultado for desconhecido (sem body da resposta, tempo esgotado, etc.),
    // simplesmente reenviamos a transação já construída:
    // server.submitTransaction(transaction);
  });
```

```java
Network.useTestNetwork();
Server server = new Server("https://horizon-testnet.stellar.org");

KeyPair source = KeyPair.fromSecretSeed("SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4");
KeyPair destination = KeyPair.fromAccountId("GA2C5RFPE6GCKMY3US5PAB6UZLKIGSPIUKSLRB6Q723BM2OARMDUYEJ5");

// Primeiro, checar para ter certeza de que a conta de destino existe.
// Você pode pular isso, mas se a conta não existir, será cobrada
// a tarifa de transação quando a transação falhar.
// Será lançada uma HttpResponseException se a conta não existir ou se tiver tido outro erro.
server.accounts().account(destination);

// Se não houver erro, carregar informações atualizadas sobre a sua conta.
AccountResponse sourceAccount = server.accounts().account(source);

// Começar a construir a transação.
Transaction transaction = new Transaction.Builder(sourceAccount)
        .addOperation(new PaymentOperation.Builder(destination, new AssetTypeNative(), "10").build())
        // Um memo permite adicionar seus próprios metadados a uma transação.
        // É opcional e não afeta como o Stellar trata a transação.
        .addMemo(Memo.text("Transação Teste"))
        .build();
// Assinar a transação para provar que você é realmente a pessoa que está enviando.
transaction.sign(source);

// E, finalmente, enviar para o Stellar!
try {
  SubmitTransactionResponse response = server.submitTransaction(transaction);
  System.out.println("Successo!");
  System.out.println(response);
} catch (Exception e) {
  System.out.println("Algo deu errado!");
  System.out.println(e.getMessage());
  // Se o resultado for desconhecido (sem body da resposta, tempo esgotado, etc.),
  // simplesmente reenviamos a transação já construída:
  // SubmitTransactionResponse response = server.submitTransaction(transaction);
}
```

```go
package main

import (
	"github.com/stellar/go/build"
    "github.com/stellar/go/clients/horizon"
    "fmt"
)

func main () {
	source := "SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4"
	destination := "GA2C5RFPE6GCKMY3US5PAB6UZLKIGSPIUKSLRB6Q723BM2OARMDUYEJ5"

	// Verificar que a conta de destino existe
	if _, err := horizon.DefaultTestNetClient.LoadAccount(destination); err != nil {
		panic(err)
	}

	passphrase := network.TestNetworkPassphrase

	tx, err := build.Transaction(
		build.TestNetwork,
		build.SourceAccount{source},
		build.AutoSequence{horizon.DefaultTestNetClient},
		build.Payment(
			build.Destination{destination},
			build.NativeAmount{"10"},
		),
	)

	if err != nil {
		panic(err)
	}

	// Assinar a transação para provar que você é realmente a pessoa que está enviando.
	txe, err := tx.Sign(source)
	if err != nil {
		panic(err)
	}

	txeB64, err := txe.Base64()
	if err != nil {
		panic(err)
	}

	// E, finalmente, enviar para o Stellar!
	resp, err := horizon.DefaultTestNetClient.SubmitTransaction(txeB64)
	if err != nil {
		panic(err)
	}

	fmt.Println("Transação bem-sucedida:")
	fmt.Println("Ledger:", resp.Ledger)
	fmt.Println("Hash:", resp.Hash)
}
```

</code-example>

O que exatamente aconteceu aí? Vamos ver por partes.

1. Confirmar que o ID da conta para a qual está enviando realmente existe, carregando a partir da rede Stellar os dados associados à conta. Nada vai dar errado se pular essa parte, mas fazer isso dá uma oportunidade de evitar fazer uma transação que você sabe que irá falhar. Você também pode usar esta chamada para realizar qualquer outra verificação que possa querer fazer na conta de destino. Se estiver escrevendo um software bancário, por exemplo, esse é um bom lugar para inserir checagens regulatórias de compliance e verificações <abbr title="Know Your Customer">KYC</abbr>.

    <code-example name="Carregar uma conta">

    ```js
    server.loadAccount(destinationId)
      .then(function(account) { /* validar a conta */ })
    ```

    ```java
    server.accounts().account(destination);
    ```

    ```go
	if _, err := horizon.DefaultTestNetClient.LoadAccount(destination); err != nil {
		panic(err)
	}
    ```

    </code-example>

2. Carregar dados da conta a partir da qual você está enviando. Uma conta pode realizar apenas uma transação por vez[^5] e possui algo chamado [**número sequencial**,](../concepts/accounts.md#sequence-number) (sequence number) que ajuda o Stellar a verificar a ordem das transações. O número sequencial de uma transação precisa bater com o número sequencial da conta, sendo assim necessário puxar da rede o número sequencial da conta.

    <code-example name="Carregar a Conta Fonte">

    ```js
    .then(function() {
    return server.loadAccount(sourceKeys.publicKey());
    })
    ```

    ```java
    AccountResponse sourceAccount = server.accounts().account(source);
    ```

    </code-example>

    O SDK vai automaticamente incrementar o número sequencial da conta quando você construir uma transação, então não será preciso puxar essa informação novamente caso queira realizar uma segunda transação.

3. Começar a construir a transação. Isso requer um objeto account (conta), não só um ID de conta, porque ele irá incrementar o número sequencial da conta.

    <code-example name="Construir uma Transação">

    ```js
    var transaction = new StellarSdk.TransactionBuilder(sourceAccount)
    ```

    ```java
    Transaction transaction = new Transaction.Builder(sourceAccount)
    ```

    ```go
	tx, err := build.Transaction(
	// ...
	)
    ```

    </code-example>

4. Adicionar a operação de pagamento (payment) à conta. Note que é preciso especificar o tipo de ativo que está sendo enviado — a moeda "native" do Stellar é o lumen, mas você pode enviar qualquer tipo de ativo ou moeda que quiser, de dólares a bitcoin ou qualquer outro tipo de ativo que confiar que o emissor pode resgatar [(mais detalhes abaixo)](#transacionar-em-outras-moedas). Por enquanto, vamos ficar só com lumens, que são chamados de ativos "native" pelo SDK:

    <code-example name="Adicionar uma Operação">

    ```js
    .addOperation(StellarSdk.Operation.payment({
      destination: destinationId,
      asset: StellarSdk.Asset.native(),
      amount: "10"
    }))
    ```

    ```java
    .addOperation(new PaymentOperation.Builder(destination, new AssetTypeNative(), "10").build())
    ```

    ```go
    tx, err := build.Transaction(
		build.Network{passphrase},
		build.SourceAccount{from},
		build.AutoSequence{horizon.DefaultTestNetClient},
		build.MemoText{"Transação Teste"},
		build.Payment(
			build.Destination{to},
			build.NativeAmount{"10"},
		),
	)
    ```

    </code-example>

    Note também que o valor é uma string em vez de um número. Quando se trabalha com frações extremamente pequenas ou valores altos, [cálculos baseados em ponto flutuante podem introduzir pequenas imprecisões](https://pt.wikipedia.org/wiki/V%C3%ADrgula_flutuante#Problemas_com_o_uso_de_ponto_flutuante). Já que nem todos os sistemas têm uma maneira nativa de representar com precisão decimais extremamente pequenos ou grandes, Stellar usa strings como uma maneira confiável de representar o valor exato em qualquer sistema.

5. Opcionalmente, você pode adicionar seus próprios metadados, chamados [**memo,**](../concepts/transactions.md#memo) a uma transação. O Stellar não faz nada com esses dados, mas você pode usá-los para qualquer fim que quiser. Se você é um banco que está recebendo ou enviando pagamentos em nome de outras pessoas, por exemplo, você poderia incluir aqui informações sobre a pessoa à qual se destina o pagamento.

    <code-example name="Adicionar um Memo">

    ```js
    .addMemo(StellarSdk.Memo.text('Transação Teste'))
    ```

    ```java
    .addMemo(Memo.text("Transação Teste"));
    ```

    ```go
    build.MemoText{"Transação Teste"},
    ```

    </code-example>

6. Agora que a transação tem todos os dados que precisa, você tem que assiná-la criptograficamente usando sua seed secreta. Isso prova que os dados realmente vieram de você e não de alguém fingindo ser você.

    <code-example name="Assinar a Transação">

    ```js
    transaction.sign(sourceKeys);
    ```

    ```java
    transaction.sign(source);
    ```

    ```go
    txe, err := tx.Sign(from)
    ```

    </code-example>

7. E finalmente, enviá-la à rede Stellar!

    <code-example name="Submeter a Transação">

    ```js
    server.submitTransaction(transaction);
    ```

    ```java
    server.submitTransaction(transaction);
    ```

    ```go
    resp, err := horizon.DefaultTestNetClient.SubmitTransaction(txeB64)
    ```

    </code-example>

**IMPORTANTE** É possível que você não receba uma resposta do servidor Horizon devido a um bug, condições de conexão, etc. Nessas situações é impossível determinar o status da sua transação. É por isso que se recomenda sempre salvar uma transação construída (ou uma transação codificada em formato XDR) em uma variável ou base de dados e reenviá-la caso não souber seu status. Se a transação já tiver sido aplicada ao ledger com sucesso, o Horizon irá simplesmente retornar o resultado salvo e não irá tentar submeter a transação novamente. Somente em casos em que o status de uma transação é desconhecido (e assim terá uma chance de ser incluída em um ledger) é que ocorrerá um reenvio à rede.

## Receber Pagamentos

Não é realmente necessário fazer nada para receber pagamentos em uma conta Stellar — se um pagante fizer uma transação bem-sucedida enviando ativos a você, esses ativos serão automaticamente adicionados a sua conta.

No entanto, você vai querer saber que alguém pagou de fato a você. Se você for um banco que aceita pagamentos em nome de outros, precisa descobrir o que foi enviado a você para poder repassar os fundos ao recipiente final. Se estiver operando um negócio de varejo, você precisa saber que seu cliente fez um pagamento para então entregar a ele a mercadoria. E se você for um carro para locação automatizada com uma conta Stellar, provavelmente vai querer verificar que o cliente sentado ao volante tenha pago antes de poder ligar o motor.

Um programa simples que escuta payments na rede e dá print a partir de cada um pode ser assim:

<code-example name="Receber Pagamentos">

```js
var StellarSdk = require('stellar-sdk');

var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
var accountId = 'GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF';

// Criar uma chamada de API para consultar (query) pagamentos envolvendo a conta.
var payments = server.payments().forAccount(accountId);

// Se já houver pagamentos que foram abordados, iniciar os resultados a partir
// do último pagamento visto. (Veja abaixo em `handlePayment` onde ele é salvo.)
var lastToken = loadLastPagingToken();
if (lastToken) {
  payments.cursor(lastToken);
}

// `stream` vai enviar cada pagamento gravado, um por um, para depois manter
// a conexão aberta e continuar a enviar novos pagamentos enquanto eles ocorrem.
payments.stream({
  onmessage: function(payment) {
    // Gravar o token de paginação para podermos começar daqui da próxima vez.
    savePagingToken(payment.paging_token);

    // O stream de pagamentos inclui tanto pagamentos enviados como recebidos.
    // Aqui, queremos processar apenas pagamentos recebidos.
    if (payment.to !== accountId) {
      return;
    }

    // Na API do Stellar, refere-se aos Lumens como sendo do tipo "native".
    // Outros tipos de ativo têm informações mais detalhadas.
    var asset;
    if (payment.asset_type === 'native') {
      asset = 'lumens';
    }
    else {
      asset = payment.asset_code + ':' + payment.asset_issuer;
    }

    console.log(payment.amount + ' ' + asset + ' from ' + payment.from);
  },

  onerror: function(error) {
    console.error('Erro no stream de pagamentos');
  }
});

function savePagingToken(token) {
  // Na maioria das vezes, recomenda-se salvar isto em um arquivo ou base de dados local
  // para poder carregá-lo da próxima vez que fizer stream com novos pagamentos.
}

function loadLastPagingToken() {
  // Pegar o último token de paginação a partir de um arquivo ou base de dados local
}
```

```java
Server server = new Server("https://horizon-testnet.stellar.org");
KeyPair account = KeyPair.fromAccountId("GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF");

// Criar uma chamada de API para consultar (query) pagamentos envolvendo a conta.
PaymentsRequestBuilder paymentsRequest = server.payments().forAccount(account);

// Se já houver pagamentos que foram abordados, iniciar os resultados a partir
// do último pagamento visto. (Veja abaixo em `handlePayment` onde ele é salvo.)
String lastToken = loadLastPagingToken();
if (lastToken != null) {
  paymentsRequest.cursor(lastToken);
}

// `stream` vai enviar cada pagamento gravado, um por um, para depois manter
// a conexão aberta e continuar a enviar novos pagamentos enquanto eles ocorrem.
paymentsRequest.stream(new EventListener<OperationResponse>() {
  @Override
  public void onEvent(OperationResponse payment) {
    // Gravar o token de paginação para podermos começar daqui da próxima vez.
    savePagingToken(payment.getPagingToken());

    // O stream de pagamentos inclui tanto pagamentos enviados como recebidos.
    // Aqui, queremos processar apenas pagamentos recebidos.
    if (payment instanceof PaymentOperationResponse) {
      if (((PaymentOperationResponse) payment).getTo().equals(account)) {
        return;
      }

      String amount = ((PaymentOperationResponse) payment).getAmount();

      Asset asset = ((PaymentOperationResponse) payment).getAsset();
      String assetName;
      if (asset.equals(new AssetTypeNative())) {
        assetName = "lumens";
      } else {
        StringBuilder assetNameBuilder = new StringBuilder();
        assetNameBuilder.append(((AssetTypeCreditAlphaNum) asset).getCode());
        assetNameBuilder.append(":");
        assetNameBuilder.append(((AssetTypeCreditAlphaNum) asset).getIssuer().getAccountId());
        assetName = assetNameBuilder.toString();
      }

      StringBuilder output = new StringBuilder();
      output.append(amount);
      output.append(" ");
      output.append(assetName);
      output.append(" from ");
      output.append(((PaymentOperationResponse) payment).getFrom().getAccountId());
      System.out.println(output.toString());
    }

  }
});
````

```go
package main

import (
	"context"
	"fmt"
	"github.com/stellar/go/clients/horizon"
)

func main() {
	const address = "GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF"
	ctx := context.Background()

	cursor := horizon.Cursor("now")

	fmt.Println("Aguardando pagamento...")

	err := horizon.DefaultTestNetClient.StreamPayments(ctx, address, &cursor, func(payment horizon.Payment) {
		fmt.Println("Tipo de Pagamento", payment.Type)
		fmt.Println("Token de Paginação", payment.PagingToken)
		fmt.Println("Pagamento de", payment.From)
		fmt.Println("Pagamento para", payment.To)
		fmt.Println("Tipo de Ativo", payment.AssetType)
		fmt.Println("Código do Ativo", payment.AssetCode)
		fmt.Println("Emissor do Ativo", payment.AssetIssuer)
		fmt.Println("Valor", payment.Amount)
		fmt.Println("Tipo do Memo", payment.Memo.Type)
		fmt.Println("Memo", payment.Memo.Value)
	})

	if err != nil {
		panic(err)
	}

}
```

</code-example>

Há duas partes principais neste programa. Primeiro, cria-se uma query para pagamentos que envolvam uma conta específica. Como a maioria dos queries no Stellar, isso poderia retornar um número enorme de itens, então a API retorna tokens de paginação, que você pode usar depois para começar sua query do mesmo ponto onde parou. No exemplo acima, as funções para salvar e carregar tokens de paginação são deixadas em branco, mas em um aplicativo real é recomendado salvar os tokens de paginação em um arquivo ou base de dados para poder continuar de onde parou caso o programa dê crash ou seja fechado pelo usuário.

<code-example name="Criar um Query de Pagamentos">

```js
var payments = server.payments().forAccount(accountId);
var lastToken = loadLastPagingToken();
if (lastToken) {
  payments.cursor(lastToken);
}
```

```java
PaymentsRequestBuilder paymentsRequest = server.payments().forAccount(account)
String lastToken = loadLastPagingToken();
if (lastToken != null) {
  paymentsRequest.cursor(lastToken);
}
```

</code-example>

Segundo, se faz `stream` com os resultados da query. Essa é maneira mais fácil de vigiar se há pagamentos ou outras transações. Cada pagamento existente é enviado pelo stream, um por um. Quando todos os pagamentos existentes tiverem sido enviados, o stream se mantém aberto e novos pagamentos são enviados assim que forem feitos.

Experimente: Rode este programa, e então, em outra janela, crie e submeta um pagamento. Você verá este programa logar o pagamento.

<code-example name="Stream de Pagamentos">

```js
payments.stream({
  onmessage: function(payment) {
    // tratar um pagamento
  }
});
```

```java
paymentsRequest.stream(new EventListener<OperationResponse>() {
  @Override
  public void onEvent(OperationResponse payment) {
    // Cuidar de um pagamento
  }
});
```

</code-example>

Também é possível solicitar pagamentos em grupos, ou páginas. Quando tiver processado cada página de pagamentos, será preciso solicitar a próxima até não sobrar nenhuma.

<code-example name="Pagamentos Paginados">

```js
payments.call().then(function handlePage(paymentsPage) {
  paymentsPage.records.forEach(function(payment) {
    // tratar um pagamento
  });
  return paymentsPage.next().then(handlePage);
});
```

```java
Page<OperationResponse> page = payments.execute();

for (OperationResponse operation : page.getRecords()) {
	// tratar um pagamento
}

page = page.getNextPage();
```

</code-example>


## Transacionar em Outras Moedas

Uma das coisas incríveis sobre a rede Stellar é que é possível enviar e receber muitos tipos de ativos como dólares americanos, nairas nigerianos, moedas digitais como o Bitcoin, ou até mesmo ou seu próprio e inédito tipo de ativo.

Enquanto que o ativo nativo do Stellar, o lumen, é bem simples, pode-se pensar em todos os outros ativos como um crédito emitido por uma conta específica. Inclusive, ao trocar dólares na rede Stellar, não se troca dólares realmente — troca-se dólares *de uma conta específica*. É por isso que os ativos no exemplo acima tinham tanto um `code` (código) e um `issuer` (emissor). O `issuer` é o ID da conta que criou o ativo. Entender que conta emitiu o ativo é importante — é preciso confiar que, se você quiser resgatar seus dólares da rede Stellar e recebê-los em cédulas, o emissor irá providenciá-los a você. Por isso, normalmente recomenda-se confiar apenas em grandes instituições financeiras quanto a ativos que representem moedas nacionais.

Stellar também permite pagamentos enviados como um tipo de ativo e recebidos em outro. É possível enviar nairas nigerianos a um amigo na Alemanha e fazer que ele receba em euros. Essas transações multimoedas são possíves por causa de um mecanismo de mercado embutido onde pessoas podem fazer ofertas para comprar e vender diferentes tipos de ativos. O Stellar vai automaticamente encontrar as melhores pessoas com quem trocar moedas para converter seus nairas em euros. Esse sistema é chamado de [exchange distribuída](../concepts/exchange.md).

Leia mais sobre os detalhes dos ativos na [visão geral sobre ativos](../concepts/assets.md).

## E Agora?

Agora que você consegue enviar e receber pagamentos usando a API do Stellar, você já está encaminhado para escrever softwares financeiros incríveis de todos os tipos. Teste outras partes da API, depois dê uma lida em tópicos mais detalhados:

- [Tornar-se uma âncora](../anchor/)
- [Segurança](../security.md)
- [Federation](../concepts/federation.md)
- [Compliance](../compliance-protocol.md)

<div class="sequence-navigation">
  <a class="button button--previous" href="create-account.md">Voltar para Passo 2: Criar uma Conta</a>
</div>


[^1]:  Uma lista de todas as operações possíveis pode ser encontrada na [página de operações](../concepts/operations.md).

[^2]: Os detalhes completos sobre transações podem ser encontrados na [página de transações](../concepts/transactions.md).

[^3]: Os 100 stroops são a **tarifa base** do Stellar. A tarifa base pode ser mudada, mas é improvável que mudanças nas tarifas do Stellar aconteçam mais do que uma vez a cada vários anos. Você pode descobrir as tarifas atuais [checando os detalhes do último ledger](https://www.stellar.org/developers/horizon/reference/endpoints/ledgers-single.html).

[^4]: Embora a maioria das respostas da API REST do Horizon use JSON, a maior parte dos dados no Stellar na verdade é armazenada em um formato chamado XDR, ou External Data Representation. XDR não só é mais compacto do que JSON, como também armazena dados de uma maneira previsível, o que torna mais fácil assinar e verificar uma mensagem codificada em XDR. Pegue mais detalhes na [nossa página sobre XDR](https://www.stellar.org/developers/horizon/reference/xdr.html).

[^5]: Em situações em que é preciso realizar um número alto de transações em um curto período de tempo (por exemplo, um banco pode realizar transações em nome de vários clientes usando uma conta Stellar), você pode criar várias contas Stellar que trabalham simultaneamente. Leia mais sobre isso no [guia para canais](../channels.md).
