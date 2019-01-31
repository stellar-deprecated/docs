---
title: Arquitetura
sequence:
  next: 2-bridge-server.md
---

Âncoras são entidades em que pessoas confiam para manter seus depósitos e [emitir crédito](../issuing-assets.md) na rede Stellar por esses depósitos. Todas as transações monetárias na rede Stellar (exceto lumens) ocorrem na forma de crédito emitido por âncoras, tal que as âncoras agem como uma ponte entre moedas preexistentes e a rede Stellar. A maioria das âncoras são organizações como bancos, instituições de poupança, cooperativas de fazendas, bancos centrais e empresas de remessas.

Antes de continuar, recomendamos que você se familizarize com:

- [Emissão de ativos](../issuing-assets.md), a atividade mais básica de uma âncora.
- [Federation](../concepts/federation.md), que permite que uma única conta Stellar represente várias pessoas.
- [Compliance](../compliance-protocol.md), se você estiver sujeito a qualquer tipo de regulamentação financeira.


## Estrutura das Contas

Como uma âncora, você deve manter pelo menos duas contas:

- Uma **conta emissora** ou issuing account, usada apenas para emitir e destruir ativos.
- Uma **conta base** ou base account, usada para transacionar com outras contas Stellar. Ela detém um saldo dos ativos emitidos pela *conta emissora*.

Crie-as na rede de testes usando o [laboratório](https://stellar.org/laboratory/) ou os passos do [guia “para começar”](../get-started/create-account.md).

Neste guia usaremos as seguintes chaves:

<dl>
  <dt>ID da Conta Emissora</dt>
  <dd><code>GAIUIQNMSXTTR4TGZETSQCGBTIF32G2L5P4AML4LFTMTHKM44UHIN6XQ</code></dd>
  <dt>Seed da Emissora</dt>
  <dd><code>SBILUHQVXKTLPYXHHBL4IQ7ISJ3AKDTI2ZC56VQ6C2BDMNF463EON65U</code></dd>
  <dt>ID da Conta Base</dt>
  <dd><code>GAIGZHHWK3REZQPLQX5DNUN4A32CSEONTU6CMDBO7GDWLPSXZDSYA4BU</code></dd>
  <dt>Seed da Base</dt>
  <dd><code>SAV75E2NK7Q5JZZLBBBNUPCIAKABN64HNHMDLD62SZWM6EBJ4R7CUNTZ</code></dd>
</dl>



### Contas de Clientes

Há duas maneiras simples de contabilizar os fundos dos seus clientes:

1. Manter uma conta Stellar para cada cliente. Quando um cliente depositar dinheiro com a sua instituição, você deve pagar uma quantia equivalente de seu ativo na conta Stellar do cliente a partir da sua *conta base*. Quando um cliente precisar obter moeda física de você, deduza a quantia equivalente de seu ativo da conta Stellar do cliente.

    Este método simplifica a contabilidade usando a rede Stellar em vez de seus próprios sistemas internos. Assim, também é possível permitir a seus clientes um pouco mais de controle sobre como as contas funcionam no Stellar.

2. Usar [federation](../concepts/federation.md) e o campo [`memo`](../concepts/transactions.md#memo) em transações para enviar e receber pagamentos em nome de seus clientes. Neste método, transações feitas para seus clientes são todas realizadas usando sua *conta base*. O campo `memo` da transação é usado para identificar o cliente a que se destina o pagamento.

    Usando apenas uma conta requer que você faça um esforço de contabilidade adicional, mas significa que você tem menos chaves para gerenciar e mais controle sobre as contas. Se você já possuir sistemas bancários, esta é a forma mais simples de integrar ao Stellar com eles.

Você pode também criar suas próprias variações dos métodos acima. **Para este guia, seguiremos o método 2 — usar uma única conta Stellar para transacionar em nome de seus clientes..**


## Fluxo de Dados

Para agir como uma âncora, sua infraestrutura terá que:

- Fazer pagamentos.
- Monitorar uma conta Stellar e atualizar as contas de clientes ao receber pagamentos.
- Consultar e responder a requests por endereços federados.
- Cumprir regulações Anti-Money Laundering (AML).

Stellar oferece um [servidor federation](https://github.com/stellar/go/tree/master/services/federation) e um [servidor compliance regulatório](https://github.com/stellar/bridge-server/blob/master/readme_compliance.md) pré-construídos, desenhados para você instalar e integrar com sua infraestrutura já existente. O [servidor bridge](https://github.com/stellar/bridge-server/blob/master/readme_bridge.md) os coordena e simplifica a interação com a rede Stellar. Este guia demonstra como integrá-los com sua infraestrutura, mas você também pode escrever suas próprias versões personalizadas.

### Fazer Pagamentos

Ao usar os serviços acima, um pagamento complexo usando federation e compliance funciona como se segue:

![Diagram of sending a payment](assets/anchor-send-payment-compliance.png)

1. Usando o app ou site da sua organização, um cliente envia um pagamento usando os seus serviços.
2. Seus serviços internos enviam um pagamento usando o servidor bridge.
3. O servidor bridge determina se verificações de compliance são necessárias e repassa as informações da transação ao servidor compliance.
4. O servidor compliance determina o ID da conta recipiente consultando o endereço federation.
5. O servidor compliance contata seus serviços internos e pega informações sobre o cliente que está enviando o pagamento para fornecê-lo aos sistemas de compliance da organização recipiente.
6. Se o resultado for bem-sucedido, o servidor bridge cria a transação, a assina, e a envia à rede Stellar.
7. Após a transação ser confirmada na rede, o servidor bridge retorna o resultado aos seus serviços, que devem atualizar a conta do seu cliente.


### Receber Pagamentos:

Quando alguém estiver enviando uma transação a você, o fluxo é ligeiramente diferente:

![Diagram of receiving a payment](assets/anchor-receive-payment-compliance.png)

1. O remetente consulta o ID da conta Stellar para o qual enviar o pagamento baseado no endereço federado do seu cliente a partir do seu servidor federation.
2. O remetente contata seu servidor compliance com informações sobre a pessoa que está enviando o pagamento.
3. Seu servidor compliance contata três serviços implementados por você:
    1. Um callback de sanções (sanctions sallback) para determinar se o remetente tem permissão para pagar seu cliente.
    2. Caso o remetente queira verificar as informações do seu cliente, um callback é usado para determinar se você está disposto a compartilhar as informações de seu cliente.
    3. O mesmo callback usado ao enviar um pagamento (acima) é usado para de fato pegar as informações do seu cliente.
4. O remetente submete a transação à rede Stellar.
5. O servidor bridge monitora a rede Stellar procurando pela transação e a envia a seu servidor compliance para verificar que era a mesma transação aprovada no passo 3.1.
6. O servidor bridge contata um serviço que você implementou para notificá-lo sobre a transação. Você pode usar este passo para atualizar os saldos das contas de seus clientes.

**Por mais que estes passos pareçam complicados, os serviços bridge, federation e compliance do Stellar fazem a maior parte do trabalho.** Você só precisa implementar quatro callbacks e criar um arquivo [stellar.toml](../concepts/stellar-toml.md) onde outros podem encontrar a URL de seus serviços.

No resto deste guia, veremos passo a passo como configurar cada parte dessa infraestrutura.

<nav class="sequence-navigation">
  <a rel="next" href="2-bridge-server.md">Próximo: Servidor Bridge</a>
</nav>
