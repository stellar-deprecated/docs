---
title: Tarifas
---

A rede Stellar requer pequenas [tarifas por transação](#tarifa-de-transação) e [saldos mínimos nas contas](#saldo-mínimo-da-conta) para prevenir que pessoas sobrecarreguem a rede e para ajudar com priorização.

Há dois valores especiais usados para calcular tarifas:

1. A **base fee** (tarifa base), atualmente de 100 stroops, é usada nas tarifas de transação.
2. A **base reserve** (reserva base), atualmente de 0.5 XLM, é usada nos saldos mínimos das contas.


## Tarifa de transação

A tarifa por uma transação é o número de operações contidas pela transação, multiplicado pela **base fee**, que é de **100 stroops** (0.00001 XLM).

```math-formula
([# de operações] * [base fee])
```

Por exemplo, uma transação que permite a confiança na trustline de uma conta *(operação 1)* e envia um pagamento para aquela conta *(operação 2)* teria uma tarifa de $$2 * [base fee] = 200 stroops$$.

Stellar subtrai toda a tarifa da [conta fonte](./transactions.md#conta-fonte) da transação, independente de que contas estão envolvidas em cada operação ou quem assinou a transação.


### Limites de Transação

Cada nó do Stellar costuma limitar o número de transações que irá propor à rede quando um ledger fechar. Se transações demais forem submetidas, os nós propõem as transações com as maiores tarifas para o conjunto de transações do ledger. Transações que não forem incluídas são retidas para um ledger futuro, quando menos transações estiverem na espera.

Veja [o ciclo de vida das transações](./transactions.md#ciclo-de-vida) para mais informações.

## Pool de Tarifas

O pool de tarifas é o total de lumens coletado das [tarifas de transação](./fees.md#tarifa-de-transação).

O Stellar não retém esses lumens. Eles são distribuídos no processo semanal de [votação de inflação](./inflation.md).

Se depois da votação houver lumens não alocados, esses lumens voltam à pool de tarifas para serem distribuídos na próxima rodada.

## Saldo Mínimo da Conta

Todas as contas no Stellar devem manter um saldo mínimo de lumens. Qualquer transação que reduza o saldo de uma conta a menos do que o mínimo será rejeitada com um erro `INSUFFICIENT_BALANCE`.

O saldo mínimo é calculado usando a **base reserve,** que é de **0.5 XLM**:

```math-formula
(2 + [# de entradas]) * [base reserve]
```

O saldo mínimo de uma conta básica é de $$2 * [base reserve]$$. Cada entrada adicional tem um custo igual à base reserve. Entradas incluem:

- Trustlines
- Ofertas
- Signers
- Entradas de dados

Por exemplo, uma conta com 1 trustline e 2 offers teria um saldo mínimo de $$(2 + 3) * [base reserve] = 2.5 XLM$$.


## Mudanças nas Tarifas

A **base reserve** e a **base fee** podem mudar, mas não devem fazê-lo mais do que uma vez a cada vários anos. Na maior parte das vezes, pode-se pensar delas como valores fixos. Quando forem alteradas, a mudança ocorre pelo mesmo processo de consenso de qualquer transação. Para detalhes, veja [versionamento](https://www.stellar.org/developers/guides/concepts/versioning.html).

Você pode consultar as tarifas atuais [olhando os detalhes do último ledger](../../horizon/reference/endpoints/ledgers-single.md).
