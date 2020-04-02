---
title: Transações
---

Transações são comandos que modificam o estado do ledger. Entre outras coisas, transações são usadas para enviar pagamentos, colocar
ordens na [exchange distribuída](./exchange.md), mudar configurações em contas e autorizar outra conta a deter sua
moeda. Pensando no ledger como uma base de dados, então transações são comandos SQL.


Cada transação tem os seguintes atributos:
> #### Conta fonte
> Esta é a conta (source account) que gera a transação. A transação precisa ser assinada por esta conta, e a tarifa de transação deve ser paga por esta conta. O número sequencial da transação é baseado nesta conta.
>
> #### Tarifa
> Cada transação seta uma [tarifa](./fees.md#tarifa-de-transação) (fee) que é paga pela conta fonte. Se esta tarifa for menor que o mínimo da rede, a transação irá falhar. Quanto mais operações na transação, maior a tarifa exigida.
>
> #### Número sequencial
> Cada transação tem um número sequencial. Transações seguem uma regra de ordenação rígida quanto a processar transações por conta. Para a transação ser válida, o número sequencial deve ser 1 a mais que o número sequencial armazenado na [entrada da conta](./accounts.md) fonte quando a transação for aplicada. No momento da aplicação da transação, o número sequencial armazenado na conta fonte é incrementado por 1 antes de aplicar as operações. Se o número sequencial na conta for 4, então a transação deverá ter um número sequencial igual a 5. Depois da transação ser aplicada, o número sequencial na conta é movido para 5.
>
> Note que se várias transações com a mesma conta fonte chegarem ao mesmo conjunto de transações, elas são ordenadas e aplicadas de acordo com o número sequencial. Por exemplo, se 3 transações são submetidas e a conta está com um número sequencial de 5, as transações devem ter números sequenciais de 6, 7 e 8.
>
> #### Lista de operações
> Transações contêm dentro de si uma lista arbitrária de [operações](./operations.md). Tipicamente há apenas uma operação, mas é possível haver várias (até 100). Operações são executadas em ordem como uma transação ACID, o que quer dizer que ou todas as operações são aplicadas ou nenhuma. Se qualquer operação falhar, toda a transação falha. Se houver operações em contas fora a conta fonte, elas requererão assinaturas das contas em questão.
>
> #### Lista de assinaturas
> Até 20 assinaturas podem ser anexadas a uma transação. Veja [Multi-sig](./multi-sig.md) para mais informações. Uma transação é considerada inválida se incluir assinaturas que não são necessárias para autorizá-la — assinaturas adicionais não são permitidas.
>
> Assinaturas são necessárias para autorizar operações e autorizar mudanças à conta fonte (tarifa e número sequencial).
>
> #### Memo
> *opcional* O memo contém informações opcionais extra. É responsabilidade do cliente interpretar este valor. Memos podem ser um dos seguintes tipos:
>   - `MEMO_TEXT` : Uma string codificada usando ou ASCII ou UTF-8, de até 28 bytes.
>   - `MEMO_ID` :  Um número inteiro 64 bits unsigned.
>   - `MEMO_HASH` : Um hash de 32 bytes.
>   - `MEMO_RETURN` : Um hash de 32 bytes visado para ser interpretado como o hash da transação que o remetente está reembolsando.
>
> #### Limites de tempo
> *opcional* O timestamp UNIX (em segundos), determinado pelo horário do ledger, de um limite inferior e superior de quando esta transação será válida. Se a transação for submetida cedo ou tarde demais, ela irá falhar em ser incluída no conjunto de transações. `maxTime` igual a `0` significa que este atributo não está ativo.

## Conjuntos de transações

Entre fechamentos dos ledgers, todos os nós na rede coletam transações. Quando for hora de fechar o próximo ledger, os nós coletam essas transações em um conjunto de transações. O protocolo SCP é rodado pela rede para chegar a um consenso sobre que conjunto de transações deve ser aplicado ao último ledger.

## Ciclo de vida

1. **Criação**: O usuário cria uma transação, preenche todos os campos, dá a ela o número sequencial correto, adiciona quaisquer operações quiser, etc. Experimente com o [js-stellar-sdk](https://www.stellar.org/developers/js-stellar-sdk/reference/).

2. **Assinatura**: Após a transação ser preenchida, todas as assinaturas necessárias devem ser coletadas e adicionadas ao envelope da transação. É comum que a única assinatura seja a da conta que realiza a transação, mas arranjos mais complicados podem exigir que sejam colecionadas assinaturas de várias partes. Veja [multi-sig](./multi-sig.md).

3. **Submissão**: Após a assinatura, a transação deverá estar válida e agora pode ser submetida à rede Stellar. Transações são tipicamente submetidas usando [horizon](https://www.stellar.org/developers/horizon/reference/transactions-create.html), mas você pode também submeter a transação diretamente a uma instância do [stellar-core](https://github.com/stellar/stellar-core).

4. **Propagação**: Após o stellar-core receber uma transação, dada a ele por um usuário ou outro stellar-core, ele realiza verificações preliminárias para ver se a transação é válida. Entre outras checagens, ele verifica que a transação esteja formada corretamente e que a conta fonte detém o suficiente para cobrir a tarifa de transação. O stellar-core não verifica coisas que requerem inspecionar o estado do ledger além de olhar para a conta fonte — ex.: que a conta de destino da transação existe, que a conta possui o suficiente deste ativo para vender, que é um caminho válido.
Se as verificações preliminárias passarem, o stellar-core propaga a transação a todos os outros servidores aos quais está conectado. Dessa maneira, uma transação válida é floodada a toda a rede Stellar.

5. **Inclusão em um conjunto de transações**: Quando for hora de fechar o ledger, stellar-core toma todas as transações que escutou desde o último fechamento de ledger e as coleta em um conjunto de transações. Se nesse momento o stellar-core ouvir outras transações, ele as deixa de lado para o próximo fechamento.
O stellar-core nomeia o conjunto de transações que coletou. O SCP resolve as diferenças entre os vários conjuntos de transações propostos e escolhe aquele conjunto que a rede irá aplicar.

6. **Aplicação**: Após o SCP concordar em um conjunto de transações específico, esse conjunto é aplicado ao ledger. Nesse momento, uma tarifa é retirada da conta fonte para cada transação naquele conjunto. São feitas tentativas de efetuar operações na ordem que elas ocorrem na transação. Se qualquer operação falhar, a transação inteira falha, e os efeitos de operações anteriores dessa transação são anulados. Depois que todas as transações do conjunto são aplicadas, um novo ledger é criado e o processo volta para o início.

## Erros Possíveis

Transações podem falhar com um dos erros da tabela abaixo. A referência de erros para operações pode ser vista na [lista de operações](./list-of-operations.md).

|Erro| Código| Descrição|
| --- | --- | --- |
|FAILED| -1| Uma das operações falhou (veja os erros na [lista de operações](./list-of-operations.md)).|
|TOO_EARLY| -2| O `closeTime` do ledger está antes do valor `minTime` da transação.|
|TOO_LATE| -3| O `closeTime` do ledger está depois do valor `maxTime` da transação.|
|MISSING_OPERATION| -4| Nenhuma operação foi especificada.|
|BAD_SEQ| -5| O número sequencial não bate com a conta fonte.|
|BAD_AUTH| -6| Muito poucas assinaturas válidas / rede incorreta.|
|INSUFFICIENT_BALANCE| -7| A tarifa levaria a conta a ter um saldo abaixo da [reserva mínima](./fees.md).|
|NO_ACCOUNT| -8| Conta fonte não encontrada.|
|INSUFFICIENT_FEE| -9| [Tarifa](./fees.md) é muito pequena.|
|BAD_AUTH_EXTRA| -10| Há assinaturas não utilizadas anexas à transação.|
|INTERNAL_ERROR| -11| Ocorreu um erro desconhecido.|
