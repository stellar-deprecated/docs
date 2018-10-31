---
title: Multisignature
---

## Assinaturas de transações
Stellar usa **assinaturas** (signatures) como autorização. Transações sempre precisam de autorização de pelo menos uma chave pública para
serem consideradas válidas. Geralmente, transações somente precisam de autorização da chave pública da conta fonte.

Assinaturas de transações são criadas assinando criptograficamente o conteúdo da transação com uma chave secreta.
O Stellar atualmente usa o esquema de assinatura ed25519, mas também há um mecanismo para adicionar mais tipos de esquemas com chaves públicas/privadas.
Considera-se que uma transação com uma assinatura anexa tenha autorização daquela chave pública.

Em dois casos, uma transação pode precisar de mais de uma assinatura. Se a transação tiver operações que afetam mais de uma conta,
será necessária a autorização de todas as contas em questão. Uma transação também precisará de assinaturas adicionais se
a conta associada com a transação tiver mais de uma chave pública. Para ver exemplos, veja o [guia de operações](./operations.md#exemplos).

## Thresholds
[Operações](./operations.md) caem em uma das seguintes categorias de thresholds (limiares): low, medium ou high (baixo, médio, ou alto).
Cada nível de limiar pode ser definido por um número na faixa 0-255. Esse limiar é o peso da assinatura necessário para autorizar uma operação naquele nível.

Digamos que Diyang defina o limiar médio de uma de suas contas para 4. Se aquela conta submeter uma transação que inclua uma operação payment (segurança média), o limiar da transação é 4 – os pesos das assinaturas devem ser maior ou igual a 4 para rodar. Se a chave mestra de Diyang – a chave correspondente à chave pública que identifica a conta que Diyang possui – tiver um peso menor que 4, ela não pode autorizar a transação sem outros signatários.

Após o limiar da assinatura ser cumprido, se houver assinaturas restantes, então a transação é considerada como tendo assinaturas em excesso, o que resulta em uma transação falha, mesmo que essas assinaturas sejam válidas, o que quer dizer: para uma transação assinada com N assinaturas, se o limiar é alcançado usando K assinaturas, a assinatura irá falhar se N > K.

Cada conta pode definir seus próprios valores para limiares. Por padrão, todos os níveis dos limiares são definidos como 0, e a chave mestra tem seu peso definido como 1. A operação [Set Options](./list-of-operations.md#set-options) permite mudar o peso da chave mestra e adicionar outras chaves signatárias com diferentes pesos.

Baixa Segurança:
  * [Processar uma transação](./transactions.md)
    * Cobrar uma tarifa ou atualizar o número sequencial para a conta fonte
  * Operação [Allow Trust](./list-of-operations.md#allow-trust)
    * Usada para permitir que pessoas detenham crédito desta conta sem expor a chave que permite enviar pagamentos desta conta.
  * [Bump Sequence](./list-of-operations.md#bump-sequence)
    * Modifica diretamente o número sequencial da conta

Segurança Média:
 * Todas as [outras operações](./list-of-operations.md)

Alta Segurança:
  * [Set Options](./list-of-operations.md#set-options) para mudar os signatários ou os limiares
    * Permite criar um conjunto de signatários que dão ou revogam acesso à conta
  * [Account Merge](./list-of-operations.md#account-merge) para fundir contas

Para a maioria dos casos, é recomendado definir os limiares tal que `low <= medium <= high`.

## Chaves adicionais
Contas são identificadas por uma chave pública. A chave privada que corresponde a esta chave pública é chamada de **chave mestra**, ou master key. Chaves adicionais podem ser adicionadas à conta usando a operação [Set Options](./list-of-operations.md#set-options).

Se o peso da chave mestra for atualizado para 0, a chave mestra é considerada uma chave inválida e é impossível assinar transações com ela (mesmo para operações com valor do limiar igual a 0). Se houver outros signatários listados na conta, eles podem continuar a assinar transações.

"Signatários", ou "signers", refere-se à chave mestre ou quaisquer chaves adicionadas posteriormente. Define-se um signatário como o par: chave pública, peso.

Cada signatário adicional além da chave mestra aumenta o [saldo mínimo](./fees.md#saldo-mínimo-da-conta) da conta.

## Tipos Alternativos de Assinaturas
Para habilitar alguns recursos avançados de smart contracts, há alguns tipos adicionais de assinatura. Tais tipos também têm pesos e podem ser adicionados e removidos de forma semelhante aos tipos normais de assinatura. Mas em vez de verificar a autorização por meio de uma assinatura criptográfica, eles têm métodos diferentes de provar validade à rede.

### Transação Pré-autorizada
É possível uma conta pré-autorizar uma transação específica adicionando o hash da transação futura como um "signatário" da conta. Para fazer isso, é preciso preparar a transação de antemão com o número sequencial adequado. Então, pode-se obter o hash desta transação e adicioná-lo como um signatário à conta.

Signatários deste tipo são automaticamente removidos da conta quando uma transação compatível for aplicamente adequadamente. Em caso de erro, ou quando uma transação compatível nunca for submetida, o signatário permanece e deve ser removido manualmente usando a operação [Set Options](./list-of-operations.md#set-options).

Este tipo de signatário é especialmente útil em contas escrow. Pode-se pré-autorizar duas transações diferentes. Ambas poderiam ter o mesmo número sequencial mas diferentes destinos. Isso quer dizer que apenas uma delas pode ser executada.

### Hash(x)
Adicionar uma assinatura do tipo hash(x) permite que qualquer um que conheça `x` assinar a transação. Este tipo de signatário é especialmente útil em [atomic cross-chain swaps](https://en.bitcoin.it/wiki/Atomic_cross-chain_trading), que são necessários para protocolos inter-blockchains como [lightning networks](https://lightning.network).

Primeiro, crie um valor aleatório 256 bits, que chamamos de `x`. O hash SHA256 daquele valor pode ser adicionado como um signatário do tipo hash(x). Então, para autorizar uma transação, `x` é adicionado como uma das assinaturas da transação.
Atente-se que `x` será conhecido pelo mundo assim que uma transação for submetida à rede com `x` como uma assinatura. Isso significa que qualquer um passará a poder assinar por aquela conta com o signatário hash(x). Comumente, é preferível que haja signatários adicionais de modo que alguém deve ter uma chave secreta específica e conhecer `x` para atingir o limiar de peso necessário para autorizar transações na conta.



## Envelopes
Um **envelope** de uma transação embrulha a transação com um conjunto de assinaturas. O objeto transação (transaction) é o que os signatários estão de fato assinando. Tecnicamente, um envelope de transação é a coisa que é passada adiante na rede e incluída em conjuntos de transações.

## Authorização
Para determinar se uma transação tem a autorização necessária para rodar, os pesos de todas as assinaturas no envelope da transação são somados. Se esta soma for igual ou maior que o limiar (veja abaixo) definido para aquele tipo de operação, a operação é autorizada.

Este esquema é bem flexível. Pode-se requerer que muitos signatários autorizem pagamentos de uma conta individual. É possível ter uma conta em nome da qual qualquer número de pessoas possa autorizar. Pode-se ter uma chave mestra que concede acesso ou revoga o acesso de outros. Isso suporta qualquer esquema m de n.


## Operações
### Exemplo 1: Âncoras
> Você opera uma âncora que gostaria de manter sua chave emissora offline. Assim, é menos provável que um mau agente possa se apossar da chave da âncora e começar a emitir crédito de maneira imprópria. Porém, sua âncora precisa autorizar pessoas que detêm crédito por meio da operação `Allow Trust`. Antes de emitir crédito a uma conta, você precisa verificar que aquela conta está OK.

Multisig permite que você faça tudo isso sem expor a chave mestra de sua âncora. Você pode adicionar outra chave signatária
para sua conta com a operação `Set Options`. Esta chave adicional deve ter um peso menor que o limiar médio da sua conta âncora.
Como `Allow Trust` é uma operação de limiar baixo, esta chave extra autoriza usuários a deter o crédito de sua âncora.
No entanto, como `Payment` é uma operação de limiar médio,  esta chave não permite que ninguém sabote sua âncora para emitir crédito.

Configuração da sua conta:
```
  master weight: 2
  peso da chave signatária adicional: 1
  low threshold: 0
  medium threshold: 2
  high threshold: 2
```

### Exemplo 2: Contas Conjuntas
> Você quer montar uma conta conjunta com Kalil e Bruna, em que qualquer um de vocês possa autorizar um pagamento. Você quer também montar uma conta tal que, se você decidir alterar signatários (ex.: remover ou adicionar alguém), uma operação de limiar alto, todos os 3 devem concordar. Você adiciona Kalil e Bruna como signatários à conta conjunta. Você também confirma que seja necessário os pesos de todas as suas chaves para alcançar o limiar alto, mas apenas o peso de uma para cruzar o limiar médio.

Configuração de uma conta conjunta:
```
  master weight: 1
  low threshold: 0
  medium threshold: 0
  high threshold: 3
  peso da chave de Kalil: 1
  peso da chave de Bruna: 1
```

### Exemplo 3: Contas Corporativas
> Sua empresa quer montar uma conta que precise que 3 de 6 funcionários concordem com *qualquer* transação que saia dessa conta.

Configuração de uma conta corporativa:
```
  master weight: 0 (Desligada para esta conta não poder fazer nada sem um funcionário)
  low threshold: 3
  medium threshold: 3
  high threshold: 3
  peso da chave do Funcionário 1: 1
  peso da chave do Funcionário 2: 1
  peso da chave do Funcionário 3: 1
  peso da chave do Funcionário 4: 1
  peso da chave do Funcionário 5: 1
  peso da chave do Funcionário 6: 1
```

### Exemplo 4: Contas para Despesas
> Você controla por completo uma conta para despesas, mas você quer que seus dois colaboradores Diyuan e Emil sejam capazes de autorizar transações
dessa conta. Você adiciona as chaves de Diyuan e Emil à conta. Se tanto Diyuan como Emil deixarem a empresa,
você pode remover suas chaves, uma operação de limiar alto.

Configuração de uma conta para despesas:
```
  master weight: 3
  low threshold: 0
  medium threshold: 0
  high threshold: 3
  peso da chave de Diyuan: 1
  peso da chave de Emil: 1
```

### Exemplo 5: Moedas Personalizadas
> Você quer emitir uma moeda personalizada e garantir que nunca será criado mais dessa moeda. Você faz uma conta fonte e emite
a quantidade máxima da moeda a uma conta detentora. Então, você define o peso da chave mestra da conta fonte para abaixo do limiar médio
– a conta fonte não pode mais emitir moeda.

Configuração da conta fonte:
```
  master weight: 0
  low threshold: 0
  medium threshold: 0
  high threshold: 0
```
Note que, embora os limiares sejam 0 aqui, chave mestra não pode assinar uma transação com sucesso porque seu próprio peso é 0, o que a torna uma chave inválida.
