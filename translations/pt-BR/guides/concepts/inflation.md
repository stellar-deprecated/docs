---
title: Inflação
---

A rede distribuída Stellar tem um mecanismo de **inflação** embutido, fixo e nominal. Novos lumens são adicionados à rede a uma frequência de 1% a cada ano. Toda semana, o protocolo distribui esses lumens a qualquer conta que receba mais de .05% dos "votos" de outras contas na rede.

## Como funciona a votação da inflação
Usando a operação [set options](./list-of-operations.md#set-options) toda conta seleciona outra conta como seu **destino de inflação** ou inflation destination, que é a conta nomeada a receber novas moedas. O destino de inflação irá persistir até ser alterada com outra operação set options.

Os votos recebem um peso relativo ao número de lumens mantidos pela conta que vota. Por exemplo, se a conta A tem 120 lumens e escolhe B como seu destino de inflação, a rede conta 120 votos para B.

A distribuição de novos lumens está limitada a uma vez por semana. A inflação é rodada em resposta a uma operação [inflation](./list-of-operations.md#inflation) que qualquer um pode submeter à rede. Esta operação irá falhar se o número sequencial da inflação não for `1` mais o último número sequencial. Também irá falhar se (número sequencial * 1 semana) de tempo não houver passado desde a data de início da rede.

A cada vez que se roda inflação, os lumens usados para pagar [tarifas de transação](./fees.md#tarifa-de-transação) desde a última votação também são incluídos no total de lumens distribuídos.

Quando se roda inflação, os nós operam o seguinte algoritmo:

 1. Calcular o `inflation pool` como (o número de lumens existentes)*(taxa de inflação semanal) +  fee pool.
 2. Calcular o `MIN_VOTE` como (o número de lumens existentes)*.0005. Isso é igual a .05% dos lumens existentes, a quantidade mínima de votos necessários para pegar qualquer parte da inflation pool.
 2. Contar os votos para cada conta baseado no **destino de inflação** definido para cada conta.
 3. Determinar quais contas excederam o `MIN_VOTE`. Essas contas são as vencedoras.
 4. As vencedoras ganham, cada uma, sua parte proporcional da inflation pool. Por exemplo, se um vencedor ganha 2% dos votos, ele irá receber 2% da inflation pool.
 5. Retornar quaisquer lumens não alocados à fee pool.
