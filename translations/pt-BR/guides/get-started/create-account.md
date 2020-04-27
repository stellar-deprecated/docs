---
title: Criar uma Conta
---

A primeira coisa necessária para fazer qualquer coisa na rede Stellar é uma conta. Nas contas fica todo o seu dinheiro dentro do Stellar e lhe permitem enviar e receber pagamentos — pode-se dizer que praticamente tudo no Stellar está de alguma maneira atrelado a uma conta.

Toda conta Stellar tem uma **chave pública** e uma **seed secreta**. Stellar usa criptografia em chaves públicas para garantir que toda transação é segura. É sempre seguro compartilhar a chave pública — outras pessoas precisam dela para identificar sua conta e verificar que você autorizou uma transação. A seed, no entanto, é uma informação privada que prova que você é o dono de sua conta. Recomenda-se nunca compartilhar a seed com ninguém. É tipo como a combinação de um cadeado — qualquer um que souber a combinação pode abrí-lo. Da mesma maneira, qualquer um que souber a seed da sua conta pode controlá-la.

Se você tem familiaridade com criptografia de chaves públicas, pode estar se perguntando qual é a diferença entre a seed e uma chave privada. A seed, na verdade, é o único dado secreto que é usado para gerar tanto a chave pública como a chave privada para a sua conta. As ferramentas do Stellar usam a seed no lugar da chave privada para sua conveniência: para ter acesso pleno a uma conta, é preciso apenas informar uma seed em vez das duas chaves, pública e privada.[^1]

Como a seed deve ser mantida em segredo, o primeiro passo para criar uma conta é criando sua própria seed e chave — quando finalmente criar a conta, você enviará apenas a chave pública ao servidor do Stellar. Você pode gerar a seed e chave com o seguinte comando:

<code-example name="Gerar Chaves">

```js
// criar um par de chaves completamente novo e único
// veja mais sobre objetos KeyPair: https://stellar.github.io/js-stellar-sdk/Keypair.html
var pair = StellarSdk.Keypair.random();

pair.secret();
// SAV76USXIJOBMEQXPANUOQM6F5LIOTLPDIDVRJBFFE2MDJXG24TAPUU7
pair.publicKey();
// GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB
```

```java
// criar um par de chaves completamente novo e único
// veja mais sobre objetos KeyPair: https://stellar.github.io/java-stellar-sdk/org/stellar/sdk/KeyPair.html
import org.stellar.sdk.KeyPair;
KeyPair pair = KeyPair.random();

System.out.println(new String(pair.getSecretSeed()));
// SAV76USXIJOBMEQXPANUOQM6F5LIOTLPDIDVRJBFFE2MDJXG24TAPUU7
System.out.println(pair.getAccountId());
// GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB
```

```go
package main

import (
	"log"

	"github.com/stellar/go/keypair"
)

func main() {
	pair, err := keypair.Random()
	if err != nil {
		log.Fatal(err)
	}

	log.Println(pair.Seed())
	// SAV76USXIJOBMEQXPANUOQM6F5LIOTLPDIDVRJBFFE2MDJXG24TAPUU7
	log.Println(pair.Address())
	// GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB
}
```

</code-example>

Agora que você possui uma seed e uma chave pública, você pode criar uma conta. Para impedir pessoas de criar um número enorme de contas desnecessárias, cada conta deve ter um saldo mínimo de 1 lumen (lumens é a moeda embutida na rede Stellar).[^2] Porém, como você ainda não tem nenhum lumen, você ainda não pode pagar para ativar uma conta. No mundo real, normalmente você pagaria a uma exchange que vende lumens para conseguir criar uma nova conta.[^3] Na rede de testes do Stellar, por outro lado, você pode pedir ao FriendBot, nosso robozinho amigável que tem uma carteira bem gorda, para criar uma conta para você.

Para criar uma conta teste, mande ao FriendBot a chave pública que criou. Ele vai criá-la e colocar fundos usando aquela chave pública como o ID da conta.

<code-example name="Criar uma Conta Teste">

```js
// O SDK não tem ferramentas para criar contas teste, então você precisará
// fazer seu próprio request HTTP.
var request = require('request');
request.get({
  url: 'https://friendbot.stellar.org',
  qs: { addr: pair.publicKey() },
  json: true
}, function(error, response, body) {
  if (error || response.statusCode !== 200) {
    console.error('ERRO!', error || body);
  }
  else {
    console.log('SUCCESSO! Você tem uma nova conta :)\n', body);
  }
});
```

```java
// O SDK não tem ferramentas para criar contas teste, então você precisará
// fazer seu próprio request HTTP.
import java.net.*;
import java.io.*;
import java.util.*;

String friendbotUrl = String.format(
  "https://friendbot.stellar.org/?addr=%s",
  pair.getAccountId());
InputStream response = new URL(friendbotUrl).openStream();
String body = new Scanner(response, "UTF-8").useDelimiter("\\A").next();
System.out.println("SUCCESSO! Você tem uma nova conta :)\n" + body);
```

```go
package main

import (
	"net/http"
	"io/ioutil"
	"log"
	"fmt"
)

func main() {
	// pair é o par que foi gerado no exemplo anterior, ou crie um par baseado em
	// chaves já existentes.
	address := pair.Address()
	resp, err := http.Get("https://friendbot.stellar.org/?addr=" + address)
	if err != nil {
		log.Fatal(err)
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(body))
}
```

</code-example>

Agora o último passo: pegar os detalhes da conta e verificar seu saldo. Contas podem ter múltiplos saldos — um para cada tipo de moeda que possuírem.

<code-example name="Pegar detalhes da conta">

```js
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// o SDK de JS usa promises para a maioria das ações, como retirar uma conta
server.loadAccount(pair.publicKey()).then(function(account) {
  console.log('Saldos para conta: ' + pair.publicKey());
  account.balances.forEach(function(balance) {
    console.log('Tipo:', balance.asset_type, ', Saldo:', balance.balance);
  });
});
```

```java
import org.stellar.sdk.Server;
import org.stellar.sdk.responses.AccountResponse;

Server server = new Server("https://horizon-testnet.stellar.org");
AccountResponse account = server.accounts().account(pair.getAccountId());
System.out.println("Saldos para conta" + pair.getAccountId());
for (AccountResponse.Balance balance : account.getBalances()) {
  System.out.println(String.format(
    "Tipo: %s, Código: %s, Saldo: %s",
    balance.getAssetType(),
    balance.getAssetCode(),
    balance.getBalance()));
}
```

```go
package main

import (
	"fmt"
	"log"

	"github.com/stellar/go/clients/horizon"
)

func main() {
	account, err := horizon.DefaultTestNetClient.LoadAccount(pair.Address())
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Saldos para conta:", pair.Address())

	for _, balance := range account.Balances {
		log.Println(balance)
	}
}
```

</code-example>

Agora que você tem uma conta, pode [começar a enviar e receber pagamentos](transactions.md).

<div class="sequence-navigation">
  <a class="button button--previous" href="index.html">Anterior: Visão Geral da Rede Stellar</a>
  <a class="button button--next" href="transactions.html">Próximo: Enviar e Receber Dinheiro</a>
</div>


[^1]: Uma chave privada ainda é usada para encriptar dados e assinar transações. Ao criar um objeto `KeyPair` usando uma seed, a chave privada é gerada imediatamente e armazenada internamente.

[^2]: Outros recursos do Stellar, como [trust lines](../concepts/assets.md#trustlines), requerem saldos mínimos maiores. Para mais sobre saldos mínimos, veja [tarifas](../concepts/fees.md#saldo-mínimo-da-conta)

[^3]: CoinMarketCap tem uma lista de corretoras que vendem lumens em http://coinmarketcap.com/currencies/stellar/#markets
