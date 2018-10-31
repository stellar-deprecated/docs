---
title: Ledger
---

Um **ledger** representa o estado do universo Stellar em dado momento. Um ledger contém a lista de todas as contas e saldos, todas as ordens na exchange distribuída, e qualquer outro dado que persista.

O primeiro ledger na história da rede é chamado de ledger gênesis.

A cada rodada do [Protocolo de Consenso Stellar (SCP)](https://www.stellar.org/developers/learn/concepts/scp.html), a rede chega a um consenso sobre que [conjunto de transações](./transactions.md#conjuntos-de-transações) aplicar ao último ledger fechado; quando um novo conjunto é aplicado, é definido um novo "último ledger fechado".

Cada ledger está criptograficamente ligado a um ledger anterior único, criando uma corrente histórica de ledgers que chegam até o ledger gênesis.

Definimos o número sequencial de um ledger recursivamente:
* Ledger gênesis possui número sequencial 1
* O ledger que segue diretamente um ledger com número sequencial n possui número sequencial igual a n+1

## Ledger header
Todo ledger tem um **ledger header**. Esse header tem referências aos dados que estão dentro do ledger, assim como uma referência ao ledger anterior. Referências aqui são hashes criptográficos do conteúdo sendo referenciado – os hashes se comportam como ponteiros em estruturas de dados comuns, mas com garantias de segurança adicionais.

Pode-se pensar na cadeia histórica dos ledgers como uma lista de ledger headers encadeada:

[Genesis] <---- [LedgerHeader_1] <----- ... <---- [LedgerHeader_n]

Leia o arquivo sobre o protocolo para ver definições de objeto ([`src/xdr/Stellar-ledger.x`](https://github.com/stellar/stellar-core/blob/master/src/xdr/Stellar-ledger.x)).

Todo ledger header tem os seguintes campos:

- **Version**: Versão do protocolo deste ledger.

- **Previous Ledger Hash**: Hash do ledger anterior. Forma uma cadeia de ledgers que se estende até o ledger gênesis.

- **SCP value**: Durante o consenso, todos os nós da rede rodam o SCP e chegam a um acordo sobre um valor em particular. Esse valor é gravado aqui e nos próximos três campos (transaction set hash, close time e upgrades).

  - **Transaction set hash**: Hash do conjunto de transações que foi aplicado ao ledger anterior.

  - **Close time**: Quando a rede fechou este ledger. Timestamp UNIX.

  - **Upgrades**: Como a rede ajusta a [tarifa base](./fees.md) e migra para uma versão nova do protocolo. Este campo é normalmente vazio. Para mais informações, veja [versionamento](./versioning.md).

- **Transaction set result hash**: Hash dos resultados de se aplicar o conjunto de transações. Esses dados não são, a rigor, necessários para validar os resultados das transações. No entanto, esses dados tornam mais fácil para entidades validarem o resultado de dada transação sem ter que aplicar o conjunto de transações ao ledger anterior.

- **Bucket list hash**: Hash de todos os objetos neste ledger. A estrutura de dados que contém todos os objetos é chamada de [bucket list](https://github.com/stellar/stellar-core/tree/master/src/bucket).

- **Ledger sequence**: O número sequencial deste ledger.

- **Total coins**: Número total de lumens existentes.
- **Fee pool**: Número de lumens que foram pagos em tarifas. Este número será adicionado à inflation pool e resetado a 0 na próxima vez que a inflação rodar. Note que isso é denominado em lumens, mesmo que o campo [`fee`](./transactions.md#tarifa) esteja em stroops.


- **Inflation sequence**: Número de vezes que se rodou o inflation.

- **ID pool**: O último ID global usado. Estes IDs são usados para gerar objetos.

- **Maximum Number of Transactions**: O número máximo de [transações](./transactions.md) que os validadores concordaram em processar em dado ledger. Se forem submetidas mais transações do que este número, os validadores irão incluir aquelas com as maiores tarifas.

- **Base fee**: A [tarifa](./fees.md#tarifa-de-transação) que a rede cobra por [operação](./operations.md) em uma [transação](./transactions.md). Este campo está em stroops, que é 1/10,000,000 avos de um lumen.

- **Base reserve**: A [reserva](./fees.md#saldo-mínimo-da-conta) que a rede usa ao calcular o saldo mínimo de uma conta.

- **Skip list**: Hashes de ledgers passados. Permite pular de volta no tempo na cadeia de ledgers sem ter que andar ledger por ledger. Há 4 ledger hashes armazenados na skip list. Cada slot contém o ledger mais antigo que é mod de ora 50  5000  50000 ora 500000 dependendo do index skipList[0] mod(50), skipList[1] mod(5000), etc.



# Ledger Entries

O ledger é uma coleção de **entries**, ou entradas. Atualmente há 4 tipos de ledger entries. Eles estão especificados em
[`src/xdr/Stellar-ledger-entries.x`](https://github.com/stellar/stellar-core/blob/master/src/xdr/Stellar-ledger-entries.x).

## Account entry
Esta entrada representa uma [conta](./accounts.md). No Stellar, tudo é construído ao redor de contas: transações são realizadas por contas, e contas controlam o direito de acesso a saldos.

Outras entradas são add-ons, posse de uma account entry principal. Com cada nova entrada
anexa à conta, o saldo mínimo em XLM sobre para a
conta. Para mais detalhes, veja [tarifas e saldo mínimo](./fees.md#saldo-mínimo-da-conta).

## Trustline entry
[Trustlines](./assets.md) são linhas de crédito que a conta deu a um emissor particular em uma moeda específica.

Trustline entries definem as regras que envolvem o uso desta moeda. Regras podem ser definidas pelo usuário – ex.: definir um limite do saldo para limitar o risco – ou pelo emissor – ex.: uma flag authorized.

## Offer entry
Ofertas são entradas que uma conta cria no livro de ordens. São uma maneira de automatizar trocas simples dentro da rede Stellar. Para mais sobre ofertas, consulte o documento sobre a [exchange distribuída](exchange.md).

## Data entry
Data entries são pares chave-valor anexos a uma conta. Permitem aos controladores de uma conta anexar dados arbitrários à conta. Isso providencia um ponto de extensão flexível para adicionar dados específicos a aplicativos dentro do ledger.
