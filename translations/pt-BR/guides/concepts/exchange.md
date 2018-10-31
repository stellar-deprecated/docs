---
title: Exchange Distribuída
---


Além de suportar a emissão e movimentação de [ativos](./assets.md), a rede Stellar também age como uma **exchange distribuída** descentralizada
de qualquer tipo de ativo que tiver sido adicionado à rede. Seu ledger armazena tanto os saldos mantidos pelas contas dos usuários como ofertas que essas contas fazem para comprar ou vender ativos.

## Ofertas
Contas podem fazer ofertas para comprar ou vender ativos usando a operação [Manage Offer](./list-of-operations.md#manage-offer).
Para fazer uma oferta, a conta deve deter o ativo que quer vender. Similarmente, a conta deve confiar no emissor do ativo que quiser comprar.

Quando uma conta faz uma oferta, a oferta é comparada com o livro de ordens existente para aquele par de ativos. Se a oferta cruzar
outra oferta existente, ela é executada no preço da oferta existente. Digamos que você faça uma oferta para comprar 10 XLM por 2 BTC. Se já existir uma oferta
para vender 10 XLM por 2 BTC, sua oferta irá aceitar a outra – você ficará com 2 BTC a menos, mas 10 XLM a mais.

Se a oferta não cruzar outra oferta já existente, a oferta é salva no livro de ordens até ser aceita por outra oferta,
aceita por um pagamento, cancelada pela conta que criou a oferta, ou invalidada pelo fato de a conta que fez a oferta não mais possuir o ativo que está vendendo.

Ofertas no Stellar se comportam como ordens de limite (limit orders) em mercados tradicionais.

Quanto a ofertas colocadas com o mesmo preço, a oferta mais antiga é realizada antes da mais nova.

## Livro de ordens
Um **livro de ordens** ou orderbook é um registro de ordens pendentes na rede Stellar. Esse registro se coloca entre qualquer par de ativos – neste caso,
digamos que os ativos sejam ovelhas e trigo. O livro de ordens grava toda conta que quer comprar ovelhas por trigo de um lado e toda conta que quer vender ovelhas por trigo no outro lado.

Alguns ativos terão entre eles um livro de ordens muito fino ou mesmo inexistente. Tudo bem: como discutido em mais detalhes abaixo, os caminhos das ordens podem facilitar o câmbio entre dois ativos trocados com pouca frequência.


## Ofertas passivas
**Ofertas passivas**, ou passive offers, permitem que os mercados tenham spread zero. Se quiser oferecer USD da âncora A por por USD da âncora B a um preço 1:1, você pode criar duas ofertas passivas para que as duas ofertas não cruzem uma com a outra.

Uma oferta passiva é uma oferta que não aceita contraofertas de mesmo preço. Ela somente irá aceitar ofertas com preço distinto.
Por exemplo, se a melhor oferta para comprar BTC por XLM tem um preço de 100 XLM/BTC, e você faz uma oferta passiva para vender BTC por 100 XLM/BTC, sua oferta passiva *não* aceita a oferta existente.
Se, em vez disso, você fizer uma oferta passiva para vender BTC a 99 XLM/BTC, ela iria cruzar com a oferta já existente e ser realizada a 100 XLM/BTC.


## Pagamentos entre ativos
Suponha que você detenha ovelhas e quer comprar algo de uma loja que somente aceita trigo. Você pode criar um pagamento no
Stellar que irá automaticamente converter suas ovelhas em trigo. O sistema passa pelo livro de ordens de ovelhas/trigo e converte suas ovelhas na melhor taxa disponível.

Também é possível fazer caminhos mais complicados para a conversão de ativos. Imagine que o livro de ordens de ovelhas/trigo tenha um spread muito alto
ou seja inexistente. Nesse caso, você talvez consiga uma taxa melhor se primeiro trocar suas ovelhas por tijolos e então vender os tijolos por trigo.
Então um caminho possível seria em 2 pulos: ovelhas->tijolos->trigo. Este caminho passaria pelo livro de ordens de ovelhas/tijolos e depois pelo de tijolos/trigo.

Esses caminhos de conversão de ativos podem conter até 6 pulos, mas todo o pagamento é atômico – ele irá ou ter sucesso ou falhar. Quem envia o pagamento nunca irá sobrar com um ativo indesejado nas mãos.

Esse processo de achar o melhor caminho de um pagamento é chamado de **pathfinding**. Pathfinding envolve olhar para os livros de ordens atuais
e encontrar quais séries de conversões daria a melhor taxa. Isso é realizado por fora do stellar-core por ferramentas como o Horizon.


## Moeda de preferência
Já que fazer pagamentos entre ativos é tão simples com Stellar, os usuários podem manter seu dinheiro em qualquer ativo que preferirem, ou em sua **moeda de preferência**, o que cria um sistema aberto muito flexível.

Imagine um mundo em que, sempre que for viajar, nunca precisar fazer câmbio de moedas exceto no momento de compra. Um mundo onde
é possível escolher manter todos seus ativos em, por exemplo, ações do Google, desembolsando pequenas quantias para fazer pagamentos. Os pagamentos entre ativos tornam esse mundo possível.
