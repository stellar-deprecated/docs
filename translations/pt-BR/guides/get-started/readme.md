---
title: Visão Geral da Rede Stellar
---
![Stellar Ecosystem](https://www.stellar.org/wp-content/uploads/2016/06/Stellar-Ecosystem-v031.png)

Usando a rede Stellar, você pode construir wallets para celular, ferramentas bancárias, dispositivos inteligentes que se pagam sozinhos, e praticamente qualquer coisa que você possa imaginar que envolva pagamentos! Embora o Stellar seja um sistema distribuíod complexo, trabalhar com ele não precisa ser complicado.

## API: Horizon

**A maioria dos aplicativos interagem com a rede Stellar por meio do [Horizon](https://www.stellar.org/developers/horizon/reference/),** um servidor API HTTP RESTful. Horizon dá uma maneira simples e direta de submeter transações, checar contas e acompanhar eventos. Por ser apenas HTTP, você pode se comunicar com o Horizon por meio de seu navegador web, ferramentas simples de linhas de comando como cURL, ou o SDK do Stellar para sua linguagem de programação favorita.

A maneira mais fácil de instalar o Horizon é usando a [imagem **stellar/quickstart** do docker](https://hub.docker.com/r/stellar/quickstart/).

O Stellar.org mantém SDKs baseados em [JavaScript](https://github.com/stellar/js-stellar-sdk), [Java](https://github.com/stellar/java-stellar-sdk) e [Go](https://github.com/stellar/go/tree/master/clients/horizon) para comunicar-se com o Horizon. Também há SDKs mantidos pela comunidade para [Ruby](https://github.com/stellar/ruby-stellar-sdk), [Python](https://github.com/StellarCN/py-stellar-base) e [C#](https://github.com/QuantozTechnology/csharp-stellar-base).

## A Base da Rede: Stellar Core

Nos bastidores, cada servidor do Horizon se conecta ao **[Stellar Core](https://www.stellar.org/developers/stellar-core/software/admin.html), a base da rede Stellar.** O software do Stellar Core faz o trabalho pesado de validar e concordar com outras instâncias do Core sobre o status de toda transação por meio do [Protocolo de Consenso Stellar](../concepts/scp.md), ou Stellar Consensus Protocol (SCP). A rede Stellar em si é um conjunto de Stellar Cores conectados, sendo rodados por vários indivíduos e entidades ao redor do mundo. Algumas instâncias têm um servidor do Horizon com que é possível se comunicar, enquanto que outras existem apenas para dar mais confiabilidade à rede como um todo.

A maneira mais fácil de instalar o Horizon é usando a [imagem **stellar/quickstart** do docker](https://hub.docker.com/r/stellar/quickstart/).

Pode ser uma boa ideia hospedar sua própria instância do Stellar Core para submeter transações sem depender de terceiros, ter mais controle sobre quem confiar, ou apenas para ajudar a tornar a rede Stellar mais confiável e robusta para outros.

## O Panorama Geral: A Rede Stellar

A rede Stellar é um conjunto mundial de Stellar Cores, cada um mantido por pessoas e organizações diferentes. A natureza distribuída da rede torna-a confiável e segura.

Todos esses Stellar Cores — a rede de nós — eventualmente concordam em conjuntos de transações. Cada transação na rede custa uma pequena tarifa: 100 stroops (0.00001 <abbr title="Lumens">XLM</abbr>). Esta tarifa ajuda a impedir que maus atores façam spam na rede.

Para ajudá-lo a testar suas ferramentas e aplicativos, Stellar.org opera uma pequena rede de testes e uma instância do Horizon. [Comece a mexer na testnet.](../concepts/test-net.md)

<div class="sequence-navigation">
  <a class="button button--next" href="create-account.html">Próximo: Criar uma Conta</a>
</div>
