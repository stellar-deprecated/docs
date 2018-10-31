---
title: Lista de Operações
---

Para uma descrição sobre como operações funcionam no Stellar, veja [Operações](./operations.md).

Para a especificação do protocolo, veja [stellar-transactions.x](https://github.com/stellar/stellar-core/blob/master/src/xdr/Stellar-transaction.x).

- [Create Account](#create-account)
- [Payment](#payment)
- [Path Payment](#path-payment)
- [Manage Offer](#manage-offer)
- [Create Passive Offer](#create-passive-offer)
- [Set Options](#set-options)
- [Change Trust](#change-trust)
- [Allow Trust](#allow-trust)
- [Account Merge](#account-merge)
- [Inflation](#inflation)
- [Manage Data](#manage-data)
- [Bump Sequence](#bump-sequence)

## Create Account
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.createAccount) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/CreateAccountOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/build#CreateAccountBuilder)

Esta operação cria uma nova conta e coloca fundos correspondentes ao saldo inicial especificado.

Limiar: Médio

Resultado: `CreateAccountResult`

Parâmetros:

| Parâmetros        | Tipo       | Descrição                                                                                |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------ |
| Destination      | account ID | Endereço da conta a ser criada e preenchida com fundos.                                                |
| Starting Balance | integer    | Quantidade de XLM a ser enviada à conta criada. Esses XLM vêm da conta fonte (source).|


Erros possíveis:

| Erro | Código | Descrição |
| ----- | ---- | ------|
|CREATE_ACCOUNT_MALFORMED| -1| A `destination` é inválida.|
|CREATE_ACCOUNT_UNDERFUNDED| -2| A conta fonte que realiza o comando não tem fundos suficientes para dar à `destination` a quantidade `starting balance` de XLM e ainda manter sua reserva mínima de XLM.  |
|CREATE_ACCOUNT_LOW_RESERVE| -3| Essa operação criaria uma conta com menos do que o número mínimo necessário de XLM que uma conta deve deter.|
|CREATE_ACCOUNT_ALREADY_EXIST| -4| A conta `destination` já existe.|



## Payment
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.payment) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/PaymentOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/build#PaymentBuilder)

Envia uma quantidade em um ativo específico à conta de destino.

Limiar: Médio

Resultado: `PaymentResult`

Parâmetros:

|Parâmetros| Tipo| Descrição|
| --- | --- | --- |
|Destination| account ID| Endereço da conta a receber o pagamento.|
|Asset| asset| Ativo a ser enviado à conta de destino.|
|Amount| integer| Quantidade do ativo referido a ser enviada.|

Erros possíveis:

|Erro| Código| Descrição|
| --- | --- | --- |
|PAYMENT_MALFORMED| -1| O input ao pagamento é inválido.|
|PAYMENT_UNDERFUNDED| -2| A conta fonte (remetente) não possui fundos suficientes para enviar esta transação. Note que o remetente tem uma reserva mínima de XLM que deve ser sempre mantida.|
|PAYMENT_SRC_NO_TRUST| -3| A conta fonte não confia no emissor do ativo que está tentando enviar.|
|PAYMENT_SRC_NOT_AUTHORIZED| -4| A conta fonte não está autorizada a enviar este pagamento.|
|PAYMENT_NO_DESTINATION| -5| A conta destinatária não existe.|
|PAYMENT_NO_TRUST| -6| O destinatário não confia no emissor do ativo que está sendo enviado. Para mais informações, veja o [documento sobre ativos](./assets.md).|
|PAYMENT_NOT_AUTHORIZED| -7| A conta de destino não está autorizada pelo emissor do ativo a deter o ativo.|
|PAYMENT_LINE_FULL| -8| A conta destinatária apenas confia no emissor do ativo para certa quantia de crédito. Se esta transação fosse bem-sucedida, o limite confiado ao destinatário seria excedido.|
|PAYMENT_NO_ISSUER| -9| O emissor do ativo não existe.|

## Path Payment
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.pathPayment) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/PathPaymentOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/build#PayWithPath)

Envia uma quantidade de um ativo específico a uma conta de destino por meio de um caminho (path) de ofertas. Isso permite que o ativo enviado (ex.: 450 XLM) seja diferente do ativo recebido (ex.: 6 BTC).

Limiar: Médio

Resultado: `PathPaymentResult`

Parâmetros:

|Parâmetros| Tipo| Descrição|
| --- | --- | --- |
|Send asset| asset| O ativo deduzido da conta remetente.|
|Send max| integer| A quantidade máxima de `send asset` a ser deduzida (excluindo tarifas).|
|Destination| account ID| ID da conta do recipiente.|
|Destination asset| asset| O ativo a ser recebido pela conta de destino.|
|Destination amount| integer| A quantidade de `destination asset` a ser recebida pela conta de destino.|
|Path| list of assets| Os ativos (além de `send asset` e `destination asset`) envolvidos nas ofertas pelas quais o caminho passa. Por exemplo, se o único caminho encontrado de USD a EUR passar por XLM e BTC, o caminho seria USD -> XLM -> BTC -> EUR e o campo `path` conteria XLM e BTC.|

Erros possíveis:

| Erro | Código | Descrição |
| ----- | ---- | ------|
|PATH_PAYMENT_MALFORMED| -1| O input a este path payment é inválido.|
|PATH_PAYMENT_UNDERFUNDED| -2| A conta fonte (remetente) não possui fundos suficientes para enviar esta transação. Note que o remetente tem uma reserva mínima de XLM que deve ser sempre mantida.|
|PATH_PAYMENT_SRC_NO_TRUST| -3| A conta fonte não confia no emissor do ativo que está tentando enviar.|
|PATH_PAYMENT_SRC_NOT_AUTHORIZED| -4| A conta fonte não está autorizada a enviar este pagamento. |
|PATH_PAYMENT_NO_DESTINATION| -5| A conta destinatária não existe. |
|PATH_PAYMENT_NO_TRUST| -6| O destinatário não confia no emissor do ativo que está sendo enviado. Para mais informações, veja o [documento sobre ativos](./assets.md).|
|PATH_PAYMENT_NOT_AUTHORIZED| -7| A conta de destino não está autorizada pelo emissor do ativo a deter o ativo. |
|PATH_PAYMENT_LINE_FULL| -8| A conta destinatária apenas confia no emissor do ativo para certa quantia de crédito. Se esta transação fosse bem-sucedida, o limite confiado ao destinatário seria excedido.|
|PATH_PAYMENT_NO_ISSUER| -9| O emissor de um dos ativos está faltando.|
|PATH_PAYMENT_TOO_FEW_OFFERS| -10| Não há caminho de ofertas que conecte `send asset` e `destination asset`. Stellar apenas considera paths de comprimento 5 ou menos.|
|PATH_PAYMENT_OFFER_CROSS_SELF| -11| O pagamento iria cruzar uma de suas próprias ofertas.|
|PATH_PAYMENT_OVER_SENDMAX| -12| Os caminhos que poderiam enviar o `destination amount` do `destination asset` iriam exceder o `send max`.|

## Manage Offer
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.manageOffer) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/ManageOfferOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/build#ManageOfferBuilder)

Cria, atualiza ou deleta uma oferta.

Se quiser criar uma nova oferta, defina o Offer ID como `0`.

Se quiser atualizar uma oferta já existente, defina o Offer ID como o mesmo da oferta em questão.

Se quiser deletar uma oferta existente, defina o Offer ID como o mesmo da oferta em questão e defina Amount como `0`.

Limiar: Médio

Resultado: `ManageOfferResult`

|Parâmetros| Tipo| Descrição|
| --- | --- | --- |
| Selling| asset| Ativo que o criador da oferta está vendendo. |
| Buying| asset| Ativo que o criador da oferta está comprando. |
| Amount| integer| Ativo de `selling` que está sendo vendido. Defina como `0` se quiser deletar uma oferta existente. |
| Price| {numerador, denominador} |  Preço de 1 unidade de `selling` em termos de `buying`. Por exemplo, se quiser vender 30 XLM e comprar 5 BTC, o preço seria {5,30}.|
| Offer ID| unsigned integer| O ID da oferta. `0` para uma nova oferta. Defina como uma oferta já existente para atualizá-la ou deletá-la. |

Erros possíveis:

| Erro | Código | Descrição |
| ----- | ---- | ------|
|MANAGE_OFFER_MALFORMED| -1| O input está incorreto e resultaria em uma oferta inválida.|
|MANAGE_OFFER_SELL_NO_TRUST| -2| A conta criadora da oferta não possui uma trustline referente ao ativo que está vendendo.|
|MANAGE_OFFER_BUY_NO_TRUST| -3| A conta criadora da oferta não possui uma trustline referente ao ativo que está comprando.|
|MANAGE_OFFER_SELL_NOT_AUTHORIZED| -4| A conta criadora da oferta não está autorizada a vender este ativo.|
|MANAGE_OFFER_BUY_NOT_AUTHORIZED| -5| A conta criadora da oferta não está autorizada a comprar este ativo.|
|MANAGE_OFFER_LINE_FULL| -6| A conta criadora da oferta apenas confia no emissor de `buying` para certa quantia de crédito. Se esta oferta fosse bem-sucedida, a conta iria exceder seu limite de confiança com o emissor.|
|MANAGE_OFFER_UNDERFUNDED| -7| A conta não possui `selling` o suficiente para financiar esta oferta.|
|MANAGE_OFFER_CROSS_SELF| -8| A conta possui uma oferta oposta de igual ou menor preço ativa, e então a conta criadora desta oferta iria imediatamente cruzar a si mesma.|
|MANAGE_OFFER_SELL_NO_ISSUER| -9| O emissor do ativo sendo vendido não existe.|
|MANAGE_OFFER_BUY_NO_ISSUER| -10| O emissor do ativo sendo comprado não existe.|
|MANAGE_OFFER_NOT_FOUND| -11| Uma oferta com o `offerID` definido não foi encontrada.|
|MANAGE_OFFER_LOW_RESERVE| -12| A conta criadora desta oferta não tem XLM suficientes. Para cada oferta criada pela conta, a quantidade mínima de XLM que a conta deve possuir irá aumentar.|

## Create Passive Offer
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.createPassiveOffer) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/CreatePassiveOfferOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/build#ManageOfferBuilder)

Uma passive offer, ou oferta passiva, é uma oferta que não age e toma uma oferta oposta de preço equivalente. Em vez disso, ela apenas toma ofertas
de preço menor. Por exemplo, se uma oferta existe para comprar 5 BTC por 30 XLM, e você fizer uma oferta passiva para comprar 30 XLM por 5 BTC,
sua oferta passiva *não* vai tomar a primeira oferta.

Note que ofertas normais feitas depois da sua oferta passiva podem agir e tomar sua oferta passiva, mesmo que a oferta
normal for do mesmo preço que sua oferta passiva.

Ofertas passivas permitem que formadores de mercado tenham spread igual a zero. Se quiser trocar EUR por USD a preço 1:1 e USD por EUR
também 1:1, você pode criar duas ofertas passivas para que as duas ofertas não ajam imediatamente uma sobre a outra.

Após a oferta passiva ser criada, você pode gerenciá-la como qualquer outra oferta usando a operação [manage offer](#manage-offer).

Limiar: Médio

Resultado: `CreatePassiveOfferResult`

|Parâmetros| Tipo| Descrição|
| --- | --- | --- |
|Selling| asset| O ativo que gostaria de vender. |
|Buying| asset| O ativo que gostaria de comprar.|
|Amount| integer| Quantidade de `selling` sendo vendida.|
|Price| {numerador, denominador}| Preço de 1 unidade de `selling` em termos de `buying`. Por exemplo, se quiser vender 30 XLM e comprar 5 BTC, o preço seria {5,30}. |

Erros possíveis:


| Erro | Código | Descrição |
| ----- | ---- | ------|
|MANAGE_OFFER_MALFORMED| -1| O input está incorreto e resultaria em uma oferta inválida.|
|MANAGE_OFFER_SELL_NO_TRUST| -2| A conta criadora da oferta não possui uma trustline referente ao ativo que está vendendo.|
|MANAGE_OFFER_BUY_NO_TRUST| -3| A conta criadora da oferta não possui uma trustline referente ao ativo que está comprando.|
|MANAGE_OFFER_SELL_NOT_AUTHORIZED| -4| A conta criadora da oferta não está autorizada a vender este ativo.|
|MANAGE_OFFER_BUY_NOT_AUTHORIZED| -5| A conta criadora da oferta não está autorizada a comprar este ativo.|
|MANAGE_OFFER_LINE_FULL| -6| A conta criadora da oferta apenas confia no emissor de `buying` para certa quantia de crédito. Se esta oferta fosse bem-sucedida, a conta iria exceder seu limite de confiança com o emissor.|
|MANAGE_OFFER_UNDERFUNDED| -7| A conta não possui `selling` o suficiente para financiar esta oferta.|
|MANAGE_OFFER_CROSS_SELF| -8| A conta possui uma oferta oposta de igual ou menor preço ativa, e então a conta criadora desta oferta iria imediatamente cruzar a si mesma.|
|MANAGE_OFFER_SELL_NO_ISSUER| -9| O emissor do ativo sendo vendido não existe.|
|MANAGE_OFFER_BUY_NO_ISSUER| -10| O emissor do ativo sendo comprado não existe.|
|MANAGE_OFFER_NOT_FOUND| -11| Uma oferta com o `offerID` definido não foi encontrada.|
|MANAGE_OFFER_LOW_RESERVE| -12| A conta criadora desta oferta não tem XLM suficientes. Para cada oferta criada pela conta, a quantidade mínima de XLM que a conta deve possuir irá aumentar.|


## Set Options
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.setOptions) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/SetOptionsOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/build#SetOptionsBuilder)

Esta operação define as opções de uma conta.

Para mais informações sobre as opções de assinatura, favor consultar o [documento sobre multi-sig](./multi-sig.md).

Ao atualizar signatários ou outros limiares, o limiar desta operação é alto.

Limiar: Médio ou Alto

Resultado: `SetOptionsResult`

Parâmetros:

|Parâmetros| Tipo| Descrição|
| --- | --- | --- |
|inflation Destination| account ID| Conta definida como destinatária da inflação. Saiba mais no [documento sobre inflação](./inflation.md).|
|Clear flags| integer| Indica quais flags limpar. Para detalhes sobre as flags, favor consultar o [documento sobre contas](./accounts.md). A máscara de bits (um integer, ou número inteiro) subtrai das flags existentes na conta. Isso permite setar bits específicos sem conhecimento das flags existentes.|
|Set flags| integer| Indica quais flags setar. Para detalhes sobre as flags, favor consultar o [documento sobre contas](./accounts.md). A máscara de bits (um integer, ou número inteiro) adiciona às flags existentes na conta. Isso permite setar bits específicos sem conhecimento das flags existentes.|
|Master weight| integer| Peso da chave mestra. Esta conta pode também adicionar outras chaves a serem usadas para assinar transações usando `signer` abaixo.|
|Low threshold| integer| Um número no intervalo 0-255 que representa o limiar que esta conta define para todas as operações realizadas que tenham [um limiar baixo](./multi-sig.html).|
|Medium threshold| integer| Um número no intervalo 0-255 que representa o limiar que esta conta define para todas as operações realizadas que tenham [um limiar médio](./multi-sig.html).|
|High threshold| integer| Um número no intervalo 0-255 que representa o limiar que esta conta define para todas as operações realizadas que tenham [um limiar alto](./multi-sig.html).|
|Home domain| string| Defino o home domain de uma conta. Ver [Federation](./federation.md).|
|Signer| {Chave Pública, peso}| Adicionar, atualizar ou remover um signatário de uma conta. O signatário é deletado se o peso é 0.|

Erros possíveis:

| Erro | Código | Descrição |
| ----- | ---- | ------|
|SET_OPTIONS_LOW_RESERVE| -1| A conta que está definindo as opções não possui XLM suficientes. Para cada novo signer adicionado à conta, o valor da reserva mínima de XLM que a conta deve manter aumenta.|
|SET_OPTIONS_TOO_MANY_SIGNERS| -2| 20 é o número máximo de signers que uma conta pode ter, e adicionar outro signer iria exceder este limite.|
|SET_OPTIONS_BAD_FLAGS| -3| As flags sendo definidas e/ou limpadas são inválidas por si mesmas ou em conjunto.|
|SET_OPTIONS_INVALID_INFLATION| -4| A conta de destino definida no campo `inflation` não existe.|
|SET_OPTIONS_CANT_CHANGE| -5| Esta conta não pode mais mudar a opção que está tentando mudar.|
|SET_OPTIONS_UNKNOWN_FLAG| -6| A conta está tentando definir uma flag que é desconhecida.|
|SET_OPTIONS_THRESHOLD_OUT_OF_RANGE| -7| O valor de um peso de chave ou limiar é inválido.|
|SET_OPTIONS_BAD_SIGNER| -8| Qualquer signer a ser adicionado à conta não pode ser a chave mestra.|
|SET_OPTIONS_INVALID_HOME_DOMAIN| -9| O home domain está malformado.|

## Change Trust
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.changeTrust) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/ChangeTrustOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/build#ChangeTrustBuilder)

Cria, atualiza ou deleta uma trustline. Para saber mais sobre trustlines, favor consultar o [documento sobre ativos](./assets.md).

Limiar: Médio

Resultado: `ChangeTrustResult`

|Parâmetros| Tipo| Descrição|
| --- | --- | --- |
|Line| asset| O ativo da trustline. Por exemplo, se um usuário estender uma trustline de até 200 USD a uma âncora (anchor), a `line` é USD:anchor.|
|Limit| integer| O limite da trustline. No exemplo anterior, o `limit` seria igual a 200.|

Erros possíveis:

| Erro | Código | Descrição |
| ----- | ---- | ------|
|CHANGE_TRUST_MALFORMED| -1| O input a esta operação é inválido.|
|CHANGE_TRUST_NO_ISSUER| -2| O emissor do ativo não pode ser encontrado. |
|CHANGE_TRUST_INVALID_LIMIT| -3| Esta operação iria reduzir o `limit` desta trustline para um valor mais baixo do que a conta atualmente detém do ativo.|
|CHANGE_TRUST_LOW_RESERVE| -4| A conta não possui lumens suficientes. Para cada nova trustline adicionada pela conta, a reserva mínima de XLM que ela deve manter aumenta.|



## Allow Trust
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.allowTrust) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/AllowTrustOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/build#AllowTrustBuilder)

Atualiza a flag `authorized` de uma trustline existente. Esta operação somente pode ser chamada pelo emissor do [ativo](./assets.md) de uma trustline.

O emissor pode apenas limpar a flag `authorized` se tiver a flag `AUTH_REVOCABLE_FLAG` definida.
Senão, o emissor pode somente setar a flag `authorized`.

Limiar: Baixo

Resultado: `AllowTrustResult`

|Parâmetros| Tipo| Descrição|
| --- | --- | --- |
|Trustor| account ID| A conta do recipiente da trustline.|
|Type| asset | O ativo da trustline que a conta fonte está autorizando. Por exemplo, se uma âncora quiser permitir que outra conta detenha seu crédito em USD, o `type` é USD:anchor.|
|Authorize| boolean| Flag que indica se a trustline é autorizada ou não.|

Erros possíveis:

| Erro | Código | Descrição |
| ----- | ---- | ------|
|ALLOW_TRUST_MALFORMED| -1| O ativo especificado em `type` é inválido.|
|ALLOW_TRUST_NO_TRUST_LINE| -2| O `trustor` não tem uma trustline com o emissor que está realizando esta operação.|
|ALLOW_TRUST_TRUST_NOT_REQUIRED| -3| A conta fonte (emissor que está realizando esta operação) não requer confiança. Em outras palavras, ela não tem a flag `AUTH_REQUIRED_FLAG` definida.|
|ALLOW_TRUST_CANT_REVOKE| -4| A conta fonte está tentando revogar a trustline do `trustor`, mas não pode fazê-lo.|

## Account Merge
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.accountMerge) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/AccountMergeOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/build#AccountMergeBuilder)

Transfere o saldo nativo (a quantidade de XLM detida pela conta) para outra conta e remove a conta fonte do ledger.

Limiar: Alto

Resultado: `AccountMergeResult`

|Parâmetros| Tipo| Descrição|
| --- | --- | --- |
|Destination| account ID| A conta que recebe o saldo em XLM restante da conta fonte.|

Erros possíveis:

| Erro | Código | Descrição |
| ----- | ---- | ------|
|ACCOUNT_MERGE_MALFORMED| -1| A operação está malformada porque a conta fonte não pode ser fundida (merged) consigo mesma. A `destination` deve ser uma conta distinta.|
|ACCOUNT_MERGE_NO_ACCOUNT| -2| A conta `destination` não existe.|
|ACCOUNT_MERGE_IMMUTABLE_SET| -3| A conta fonte possui a flag `AUTH_IMMUTABLE` definida.|
|ACCOUNT_MERGE_HAS_SUB_ENTRIES | -4| A conta fonte tem trustlines/ofertas.|
|ACCOUNT_MERGE_SEQNUM_TOO_FAR | -5| O número sequencial da conta fonte é muito alto.  Deve ser menor que `(ledgerSeq << 32) = (ledgerSeq * 0x100000000)`. *(versão 10 e posteriores do protocolo)*|

## Inflation
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.inflation) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/InflationOperation.html) | [Go](https://godoc.org/github.com/stellar/go/build#InflationBuilder)

Esta operação roda a inflação.

Limiar: Baixo

Resultado: `InflationResult`

Erros possíveis:

| Erro | Código | Descrição |
| ----- | ---- | ------|
|INFLATION_NOT_TIME| -1| A inflação roda apenas uma vez por semana. Esta falha significa que ainda não é hora de uma nova rodada de inflação.|


## Manage Data
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.manageData) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/ManageDataOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/build#ManageDataBuilder)

Permite setar, modificar ou deletar uma Data Entry (par name/value) que é anexada a uma conta específica. Uma conta pode ter uma quantidade arbitrária de DataEntries anexadas a si. Cada DataEntry aumenta o saldo mínimo que a conta deve manter.

DataEntries podem ser usadas para coisas específicas a aplicativos. Elas não são usadas pelo protocolo Stellar básico.

Limiar: Médio

Resultado: `ManageDataResult`

|Parâmetros| Tipo| Descrição|
| --- | --- | --- |
|Name| string | String de até 64 bytes. Se isso for um novo Name, será adicionado à conta o par name/value dado. Se este Name já estiver presente, o value associado será modificado.  |
|Value| binary data | (opcional) Se não estiver presente, o Name existente será deletado. Se presente, então este valor será setado na DataEntry. De até 64 bytes.  |

Erros possíveis:

| Erro | Código | Descrição |
| ----- | ---- | ------|
|MANAGE_DATA_NOT_SUPPORTED_YET| -1| A rede ainda não adotou esta mudança do protocolo. Esta falha significa que a rede ainda não dá suporte a este recurso.|
|MANAGE_DATA_NAME_NOT_FOUND| -2| Tentar remover uma Data Entry que não existe. Isso acontece quando o Name está setado (e o Value não) mas a conta não tem uma DataEntry com esse Name.|
|MANAGE_DATA_LOW_RESERVE| -3| Não há lumens suficientes na conta pra criar uma nova Data Entry. Cada Data Entry adicional aumenta o saldo mínimo da conta.|
|MANAGE_DATA_INVALID_NAME| -4| Name não é uma string válida.|

## Bump Sequence
[JavaScript](http://stellar.github.io/js-stellar-sdk/Operation.html#.bumpSequence) | [Java](http://stellar.github.io/java-stellar-sdk/org/stellar/sdk/BumpSequenceOperation.Builder.html) | [Go](https://godoc.org/github.com/stellar/go/build#BumpSequenceBuilder)

*Apenas disponível na versão 10 ou posterior do protocolo*

Bump sequence permite "empurrar" (bump) para frente o número sequencial da conta fonte da operação, permitindo invalidar quaisquer transações que tenham um número sequencial menor.

Se o número sequencial `bumpTo` especificado for maior do que o número sequencial da conta fonte,
o número sequencial da conta é atualizado com aquele valor. Caso contrário, não é modificado.

Limiar: Baixo

Resultado: `BumpSequenceResult`

|Parâmetros| Tipo| Descrição|
| --- | --- | --- |
|bumpTo| SequenceNumber| Valor desejado para o número sequencial da conta fonte da operação.|

Erros possíveis:

| Erro | Código | Descrição |
| ----- | ---- | ------|
|BUMP_SEQUENCE_BAD_SEQ| -1| O número sequencial `bumpTo` especificado não é um número sequencial válido. Ele deve estar entre 0 e `INT64_MAX` (9223372036854775807 or 0x7fffffffffffffff).|
