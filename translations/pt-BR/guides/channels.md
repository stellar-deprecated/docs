---
title: Canais
---
*Método para submeter transações à rede em uma frequência elevada*

Caso esteja submetendo [transações](./concepts/transactions.md) à rede em uma frequência elevada ou a partir de diferentes processos, é necessário ter cuidado para submeter as transações na ordem correta de seus números sequenciais. Isso pode ser problemático, já que tipicamente o envio é feito por meio do Horizon e não há nenhuma garantia de que uma transação tenha sido recebida pelo [stellar-core](https://github.com/stellar/stellar-core) antes do fechamento do ledger. Isso quer dizer que as transações podem chegar ao stellar-core fora de ordem e irão voltar com um erro de sequência incorreta (bad sequence). Caso escolha esperar o fechamento do ledger para evitar este problema, isso irá reduzir consideravelmente sua frequência de envio de transações à rede.

A maneira de evitar isso é com o conceito de **channels**, ou canais.

Um canal é simplesmente outra conta Stellar que é usada não para enviar fundos, mas como a conta "fonte" da transação. Lembre-se que cada transação no Stellar tem uma conta fonte que pode ser distinta das contas que são afetadas pelas operações na transação. A conta fonte da transação paga a tarifa e consome um número sequencial. Daí é possível usar uma conta comum (a sua conta base) para fazer a [operação](./concepts/operations.md) Payment dentro de cada transação. As várias contas canal irão consumir seus números sequenciais, apesar de os fundos terem sido enviados por sua conta base.

Canais aproveitam o fato de que a conta "fonte" de uma transação pode ser diferente da conta fonte das operações dentro da transação. Com essa configuração, é possível fazer tantos canais quanto for preciso para manter sua frequência de transação desejada.

É claro, você terá de assinar a transação, tanto com a chave da conta base como com a chave da conta canal.

Por exemplo:
```
StellarSdk.Network.useTestNetwork();
// channelAccounts[] é um array de accountIDs, um para cada canal
// channelKeys[] é um array de chaves secretas, um para cada canal
// channelIndex é o canal pelo qual você quer enviar esta transação

// criar payment da baseAccount (conta base) para customerAddress
var transaction =
  new StellarSdk.TransactionBuilder(channelAccounts[channelIndex])
    .addOperation(StellarSdk.Operation.payment({
      source: baseAccount.address(),
      destination: customerAddress,
      asset: StellarSdk.Asset.native(),
      amount: amountToSend
    }))
    .build();

  transaction.sign(baseAccountKey);   // conta base deve assinar para aprovar o pagamento
  transaction.sign(channelKeys[channelIndex]);  // canal deve assinar para aprovar que ele seja a fonte da transação
```
