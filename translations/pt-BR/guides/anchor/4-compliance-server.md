---
title: Servidor Compliance
sequence:
  previous: 3-federation-server.md
  next: 5-conclusion.md
---

A tarefa de uma âncora é cuidar de compliance regulatório, como Anti-Money Laundering (<abbr title="Anti-Money Laundering">AML</abbr>). Para conseguir fazê-lo, você deve usar o [protocolo compliance Stellar](../compliance-protocol.md), uma maneira padrão de trocar informações de compliance e pré-aprovar uma transação com outra instituição financeira.

Você pode escrever seu próprio servidor que atende ao protocolo compliance, mas o Stellar.org também fornece um [servidor compliance](https://github.com/stellar/bridge-server/blob/master/readme_compliance.md) que cuida da maior parte do trabalho por você.

Seu servidor bridge contata seu servidor compliance para autorizar uma transação antes de enviá-la. Seu servidor compliance usa o protocolo compliance para liberar a transação com o servidor compliance do recipiente, para depois informar ao servidor bridge que a transação está pronta para ser enviada.

![](assets/anchor-send-payment-compliance.png)

Quando outro servidor compliance contata o seu para liberar uma transação, uma série de callbacks são usados para verificar as informações com você. Depois, quando seu servidor bridge recebe uma transação, ele contata seu servidor compliance para verificar que ela foi liberada.

![](assets/anchor-receive-payment-compliance.png)


## Criar uma Base de Dados

O servidor compliance requer uma base de dados MySQL ou PostgreSQL para salvar informações de transações e compliance. Crie uma nova base de dados chamada `stellar_compliance` e um usário para administrá-la. Não é preciso adicionar nenhuma tabela; o servidor inclui [um comando para configurar e atualizar sua base de dados](#iniciar-o-servidor).


## Baixar e Configurar o Servidor Compliance

Comece [baixando o servidor compliance mais recente](https://github.com/stellar/bridge-server/releases) para sua plataforma e instale o executável onde quiser. No mesmo diretório, crie um arquivo chamado `config_compliance.toml`. Ele irá armazenar as configurações do servidor compliance. Ele deverá ter mais ou menos essa cara:

<code-example name="config_compliance.toml">

```toml
external_port = 8003
internal_port = 8004
# Defina isto como `true` se você precisa verificar as informações da pessoa que está recebendo
# um pagamento sendo enviado por você (se `false`, apenas ocorrerá verificação no lado do remetente).
# Para mais informações, veja a seção de callbacks abaixo.
needs_auth = false
network_passphrase = "Test SDF Network ; September 2015"

[database]
type = "mysql" # Ou "postgres" se você criou uma base de dados PostgreSQL
url = "dbusuario:dbsenha@/stellar_compliance"

[keys]
# Esta deve ser a seed secreta da sua conta base (ou outra conta que
# pode autorizar transações a partir da sua conta base).
signing_seed = "SAV75E2NK7Q5JZZLBBBNUPCIAKABN64HNHMDLD62SZWM6EBJ4R7CUNTZ"
encryption_key = "SAV75E2NK7Q5JZZLBBBNUPCIAKABN64HNHMDLD62SZWM6EBJ4R7CUNTZ"

[callbacks]
sanctions = "http://localhost:8005/compliance/sanctions"
ask_user = "http://localhost:8005/compliance/ask_user"
fetch_info = "http://localhost:8005/compliance/fetch_info"

# O servidor compliance deve estar disponível via HTTPS. Especifique seu
# certificado e chave SSL aqui. Se o servidor estiver detrás de um proxy ou load balancer
# que implementa HTTPS, você pode omitir esta seção.
[tls]
certificate_file = "server.crt"
private_key_file = "server.key"
```

</code-example>

O arquivo de configuração lista ambos um `external_port` e um `internal_port`. O `external port` deve estar publicamente acessível. Este é o port que outras organizações irão contatar para determinar se você vai ou não aceitar um pagamento.

O `internal port` *não* deve estar publicamente acessível. Este é o port pelo qual se inicia operações de compliance e se transmite informações privadas. Fica por sua conta manter este port seguro por meio de um firewall, um proxy, ou outros meios.

Também será precisa informar ao seu servidor bridge que agora você tem um servidor compliance que pode ser usado por ele. Atualize o [`config_bridge.toml`](2-bridge-server.md#baixar-e-configurar-o-seu-servidor-bridge) com o endereço do port *interno* do seu servidor compliance:

<code-example name="config_bridge.toml">

```toml
port = 8001
horizon = "https://horizon-testnet.stellar.org"
network_passphrase = "Test SDF Network ; September 2015"
compliance = "https://sua_org.com:8004"

# ...o resto das suas configurações...
```

</code-example>


## Implementar Callbacks de Compliance

No arquivo de configuração do servidor, há três URLs de callback, muito semelhantes às do servidor bridge. Elas são URLs POST HTTP que enviarão dados form-encoded:

- `fetch_info` recebe um endereço federation (como `tunde_adebayo*sua_org.com`) e deve retornar todas as informações necessárias para que outra organização realize verificações de compliance. Pode ser qualquer dado que você julgue apropriado e deve estar formatado como JSON.

    Ao enviar um pagamento, `fetch_info` será chamado para pegar informações sobre o cliente que está enviando o pagamento para enviá-las à organização recebedora. Ao receber um pagamento, será chamado se a organização remetente requisitou informações sobre o recipiente para suas próprias verificações de compliance (baseado na [configuração `needs_auth`](#baixar-e-configurar-o-servidor-compliance)).

    <code-example name="Implementar o callback fetch_info">

    ```js
    app.post('/compliance/fetch_info', function (request, response) {
      var addressParts = response.body.address.split('*');
      var friendlyId = addressParts[0];

      // Você precisa criar `accountDatabase.findByFriendlyId()`. Deve consultar
      // dados de um cliente por meio de sua conta Stellar e retornar informações da conta.
      accountDatabase.findByFriendlyId(friendlyId)
        .then(function(account) {
          // Isto pode ser qualquer dado que você julga ser útil e não é limitado a
          // estes três.
          response.json({
            name: account.fullName,
            address: account.address,
            date_of_birth: account.dateOfBirth
          });
          response.end();
        })
        .catch(function(error) {
          console.error('Fetch Info Error:', error);
          response.status(500).end(error.message);
        });
    });
    ```

    ```java
    @POST
    @Path("compliance/fetch_info")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public Response fetchInfo(
      @FormParam("address") String address) {

      String friendlyId = address.split("\\*", 2)[0];

      // Isso pode ser qualquer dado que você julga ser útil e não é limitado a
      // estes três.
      try {
        Account account = accountDatabase.findByFriendlyId(friendlyId);
        return Response.ok(
        // Isto pode ser qualquer dado que você julga ser útil e não é limitado a
        // estes três.
          Json.createObjectBuilder()
            .add("name", account.fullName)
            .add("address", account.address)
            .add("date_of_birth", account.dateOfBirth)
            .build())
          .build();
        )
      } catch (Exception error) {
        System.out.println(
          String.format("Não foi possível encontrar a conta: %s", address));
        return Response.status(500).entity(error.getMessage()).build();
      }
    }
    ```

    </code-example>

- `sanctions` recebe informações sobre a pesosa que envia pagamento a você ou a um de seus clientes. São os mesmos dados que o servidor remetente teria receberia pelo seu próprio callback `fetch_info`. O código de resposta HTTP que ele produz indica se o pagamento será aceito (status `200`), rejeitado (status `403`), ou se você precisa de tempo adicional para processar (status `202`).

    <code-example name="Implementar o callback sanctions">

    ```js
    app.post('/compliance/sanctions', function (request, response) {
      var sender = JSON.parse(request.body.sender);

      // Você precisa criar uma função para verificar se há alguma sanção
      // contra alguém.
      sanctionsDatabase.isAllowed(sender)
        .then(function() {
          response.status(200).end();
        })
        .catch(function(error) {
          // Neste exemplo, supõe-se que `isAllowed` retorna um erro com uma
          // propriedade `type` que indica o tipo do erro. Seus sistemas podem
          // funcionar de maneira distinta; apenas retorne os mesmos códigos de status HTTP.
          if (error.type === 'DENIED') {
            response.status(403).end();
          }
          else if (error.type === 'UNKNOWN') {
            // Se você precisa esperar e realizar verificações manuais, será preciso
            // criar uma maneira de fazer isso também
            notifyHumanForManualSanctionsCheck(sender);
            // O valor de `pending` é um tempo em segundos para verificar novamente
            response.status(202).json({pending: 3600}).end();
          }
          else {
            response.status(500).end(error.message);
          }
        });
    });
    ```

    ```java
    import java.io.*;
    import javax.json.Json;
    import javax.json.JsonObject;
    import javax.json.JsonReader;

    @POST
    @Path("compliance/sanctions")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public Response sanctions(@FormParam("sender") String sender) {
      JsonReader jsonReader = Json.createReader(new StringReader(sender));
      JsonObject senderData = jsonReader.readObject();
      jsonReader.close();

      // Você precisa criar uma função para verificar se há alguma sanção
      // contra alguém.
      Permission permission = sanctionsDatabase.isAllowed(
        senderData.getString("name"),
        senderData.getString("address"),
        senderData.getString("date_of_birth"));

      // Neste exemplo, supõe-se que `isAllowed` returna um enum Permissions
      // que indica se alguém está Allowed (permitido), Denied (rejeitado), ou Unknown (desconhecido).
      // Seus sistemas podem funcionar de maneira distinta; apenas retorne os mesmos códigos de status HTTP.
      if (permission.equals(Permission.Allowed)) {
        return Response.ok().build();
      }
      else if (permission.equals(Permission.Denied)) {
        return Response.status(403).build();
      }
      else {
        // Se você precisa esperar e realizar verificações manuais, será preciso
        // criar uma maneira de fazer isso também.
        notifyHumanForManualSanctionsCheck(senderData);
        // O valor de `pending` é um tempo em segundos para verificar novamente.
        return Response.accepted(
          Json.createObjectBuilder()
            .add("pending", 3600)
            .build())
          .build();
      }
    }
    ```

    </code-example>

- `ask_user` é chamado ao receber um pagamento se o remetente requisitou informações sobre o recebedor. Seu código retornado indica se você enviará essas informações (`fetch_info` é então chamado para realmente pegar as informações). `ask_user` recebe informações tanto sobre o pagamento como sobre o remetente.

    <code-example name="Implementar o callback ask_user">

    ```js
    app.post('/compliance/ask_user', function (request, response) {
      var sender = JSON.parse(request.body.sender);

      // Você pode fazer qualquer verificação que faça sentido aqui. Por exemplo, você pode não
      // querer compartilhar informações com alguém que tem sanções como acima:
      sanctionsDatabase.isAllowed(sender)
        .then(function() {
          response.status(200).end();
        })
        .catch(function(error) {
          if (error.type === 'UNKNOWN') {
            // Se você precisa esperar e realizar verificações manuais, precisará
            // criar uma maneira de fazer isso também.
            notifyHumanForManualInformationSharing(sender);
            // O valor de `pending` é um tempo em segundos para verificar novamente.
            response.status(202).json({pending: 3600}).end();
          }
          else {
            response.status(403).end();
          }
        });
    });
    ```

    ```java
    @POST
    @Path("compliance/ask_user")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public Response askUser(@FormParam("sender") String sender) {
      JsonReader jsonReader = Json.createReader(new StringReader(sender));
      JsonObject senderData = jsonReader.readObject();
      jsonReader.close();

      // Você pode fazer qualquer verificação que faça sentido aqui. Por exemplo, você pode não
      // querer compartilhar informações com alguém que tem sanções como acima:
      Permission permission = sanctionsDatabase.isAllowed(
        senderData.getString("name"),
        senderData.getString("address"),
        senderData.getString("date_of_birth"));

      if (permission.equals(Permission.Allowed)) {
        return Response.ok().build();
      }
      else if (permission.equals(Permission.Denied)) {
        return Response.status(403).build();
      }
      else {
        // Se você precisa esperar e realizar verificações manuais, precisará
        // criar uma maneira de fazer isso também.
        notifyHumanForManualInformationSharing(senderData);
            // O valor de `pending` é um tempo em segundos para verificar novamente.
        return Response.accepted(
          Json.createObjectBuilder()
            .add("pending", 3600)
            .build())
          .build();
      }
    }
    ```

    </code-example>

Para simplificar as coisas, vamos adicionar todos os três callbacks ao mesmo servidor que estamos usando para os callbacks do servidor bridge. Porém, você pode implementá-los em qualquer serviço que faça sentido em sua infraestrutura. Só tome cuidado para que seja possível acessá-los por meio das URLs em seu arquivo de configuração.


## Atualizar o Stellar.toml

Quando outras organizações precisam contatar seu servidor compliance para autorizar um pagamento a um dos seus clientes, eles consultam o arquivo `stellar.toml` do seu domínio pelo endereço, assim como quando querem encontrar seu servidor federation.

Para operações de compliance, será preciso listar duas novas propriedades em seu `stellar.toml`:

<code-example name="stellar.toml">

```toml
FEDERATION_SERVER = "https://www.sua_org.com:8002/federation"
AUTH_SERVER = "https://www.sua_org.com:8003"
SIGNING_KEY = "GAIGZHHWK3REZQPLQX5DNUN4A32CSEONTU6CMDBO7GDWLPSXZDSYA4BU"
```

</code-example>

`AUTH_SERVER` é o endereço do port *externo* de seu servidor compliance. Assim como seu servidor federation, pode ser qualquer URL que quiser, mas **deve suportar HTTPS e usar um certificado SSL válido.**[^ssl]

`SIGNING_KEY` é a chave pública que bate com a seed secreta especificada em `signing_seed` nas configurações de seu servidor compliance. Outras organizações a usarão para verificar que mensagens foram realmente enviadas por você.


## Iniciar o Servidor

Antes de iniciar o servidor pela primeira vez, as tabelas em sua base de dados precisão ser criadas. Rodar o servidor compliance com o argumento `--migrate-db` irá deixar tudo pronto para começar:

```bash
./compliance --migrate-db
```

A cada vez que você atualizar o servidor compliance a uma nova versão, você deve rodar este comando novamente. Ele irá atualizar sua base de dados caso algo precise ser alterado.

Agora que sua base de dados está completamente preparada, você pode iniciar o servidor compliance rodando:

```bash
./compliance
```


## Experimente

Agora que seu servidor compiance está configurado e pronto para verificar transações, você pode testá-lo enviando um pagamento a alguém que está rodando seus próprios servidors compliance e federation.

O jeito mais fácil de fazer isso é simplesmente testar um pagamento de um de seus clientes a outro. Seus servidors compliance, federation e bridge irão realizar ambos os lados remetente e recipiente da transação.

Envie um pagamento por meio de seu servidor bridge, mas desta vez, use endereços federados para o remetente e o destinatário e um `extra_memo`[^compliance_memos] para acionar verificações de compliance:

<code-example name="Enviar um Pagamento">

```bash
# NOTE: `extra_memo` é necessário para compliance (use-o em vez de `memo`)
curl -X POST -d \
"amount=1&\
asset_code=USD&\
asset_issuer=GAIUIQNMSXTTR4TGZETSQCGBTIF32G2L5P4AML4LFTMTHKM44UHIN6XQ&\
destination=amy*sua_org.com&\
source=SAV75E2NK7Q5JZZLBBBNUPCIAKABN64HNHMDLD62SZWM6EBJ4R7CUNTZ&\
sender=tunde_adebayo*sua_org.com&\
extra_memo=Test%20transaction" \
http://localhost:8001/payment
```

```js
var request = require('request');

request.post({
  url: 'http://localhost:8001/payment',
  form: {
    amount: '1',
    asset_code: 'USD',
    asset_issuer: 'GAIUIQNMSXTTR4TGZETSQCGBTIF32G2L5P4AML4LFTMTHKM44UHIN6XQ',
    destination: 'amy*sua_org.com',
    source: 'SAV75E2NK7Q5JZZLBBBNUPCIAKABN64HNHMDLD62SZWM6EBJ4R7CUNTZ',
    sender: 'tunde_adebayo*sua_org.com',
    // `extra_memo` é necessário para compliance (use-o em vez de `memo`)
    extra_memo: 'Transação de teste',
  }
}, function(error, response, body) {
  if (error || response.statusCode !== 200) {
    console.error('ERRO!', error || body);
  }
  else {
    console.log('SUCCESSO!', body);
  }
});
```

```java
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;

import java.util.ArrayList;
import java.util.List;

public class PaymentRequest() {
  public static void main(String [] args) {
    HttpPost paymentRequest = new HttpPost("http://localhost:8001/payment");

    List<NameValuePair> params = new ArrayList<NameValuePair>();
    params.add(new BasicNameValuePair("amount", "1"));
    params.add(new BasicNameValuePair("asset_code", "USD"));
    params.add(new BasicNameValuePair("asset_issuer", "GAIUIQNMSXTTR4TGZETSQCGBTIF32G2L5P4AML4LFTMTHKM44UHIN6XQ"));
    params.add(new BasicNameValuePair("destination", "amy*sua_org.com"));
    params.add(new BasicNameValuePair("source", "SAV75E2NK7Q5JZZLBBBNUPCIAKABN64HNHMDLD62SZWM6EBJ4R7CUNTZ"));
    params.add(new BasicNameValuePair("sender", "tunde_adebayo*sua_org.com"));
    // `extra_memo` é necessário para compliance (use-o em vez de `memo`)
    params.add(new BasicNameValuePair("extra_memo", "Transação de teste"));

    HttpResponse response = httpClient.execute(paymentRequest);
    HttpEntity entity = response.getEntity();
    if (entity != null) {
      String body =  EntityUtils.toString(entity);
      System.out.println(body);
    }
  }
}
```

</code-example>

Para um teste mais realista, prepare uma cópia duplicada de seus servidores bridge, federation, e compliance em outro domínio e envie um pagamento a eles!

<nav class="sequence-navigation">
  <a rel="prev" href="3-federation-server.md">Anterior: Servidor Federation</a>
  <a rel="next" href="5-conclusion.md">Próximo: Próximos Passos</a>
</nav>


[^compliance_memos]: Transações compliance com o servidor bridge não dão suporte ao campo `memo`. O `memo` da transação de fato irá armazenar um has usado para verificar que a transação submetida à rede Stellar bate com aquela acordada durante as verificações de compliance iniciais. Seu `extra_memo` será transmitido em vez disso durante as verificações de compliance. Para detalhes, veja [o protocolo compliance](../compliance-protocol.md).

[^ssl]: Exigir que serviços públicos estejam disponíveis via SSL ajuda a manter a segurança. Para testes, é possível pegar certificados gratuitos em http://letsencrypt.org. Você também pode gerar seus próprios certificados autoassinados, mas você precisa adicioná-los a todos os computadores em seus testes.
