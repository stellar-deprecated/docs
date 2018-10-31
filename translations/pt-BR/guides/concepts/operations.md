---
title: Operações
---

[Transações](./transactions.md) são compostas de uma [lista de operações](./list-of-operations.md). Cada
operação (operation) é um comando individual que altera (mutate) o ledger.

Aqui estão os tipos possíves de operações:
- [Create Account](./list-of-operations.md#create-account)
- [Payment](./list-of-operations.md#payment)
- [Path Payment](./list-of-operations.md#path-payment)
- [Manage Offer](./list-of-operations.md#manage-offer)
- [Create Passive Offer](./list-of-operations.md#create-passive-offer)
- [Set Options](./list-of-operations.md#set-options)
- [Change Trust](./list-of-operations.md#change-trust)
- [Allow Trust](./list-of-operations.md#allow-trust)
- [Account Merge](./list-of-operations.md#account-merge)
- [Inflation](./list-of-operations.md#inflation)
- [Manage Data](./list-of-operations.md#manage-data)
- [Bump Sequence](./list-of-operations.md#bump-sequence)

Operações são executadas em nome da conta fonte especificada na
transação, a não ser que haja algo definido na operação que ignore isso.

## Thresholds

Cada operação pertence a uma categoria de threshold (limiar) específica: low, medium ou high (baixa, média ou alta).
Thresholds definem o nível de privilégio que uma operação precisa para obter sucesso.

* Low Security (baixa segurança):
  * AllowTrustTx
    * Usado para permitir que outros signatários (signers) autorizem pessoas a deter crédito desta conta mas não emitir crédito.
  * BumpSequence
* Medium Security (segurança média):
  * Todo o resto
* High Security (alta segurança):
  * AccountMerge
    * Fundir uma conta com outra.
  * SetOptions para Signer e threshold
    * Usado para alterar o Set de signers e os thresholds.


## Validade de uma operação

Há dois lugares no [ciclo de vida de uma transação](./transactions.md#ciclo-de-vida) onde operações podem falhar. O primeiro é quando uma transação é submetida à rede. O nó para onde a transação é enviada verifica a validade da operação: no **validity check** (verificação de validade), o nó realiza algumas verificações superficiais para conferir que a transação está formada adequadamente antes de incluí-la em seu set de transações e enviá-la ao resto da rede.

A verificação de validade somente olha para o estado da conta fonte, assegurando que:

1) A transação saindo tem assinaturas suficientes para a conta fonte da operação atingir o threshold daquela operação.
2) Sejam aprovadas as verificações de validade específicas a operações. Essas verificações são aquelas que permaneceriam verdadeiras independentemente do estado do ledger — por exemplo, os parâmetros estão dentro dos limites esperados? Verificações que dependem do estado do ledger não acontecem até o momento da aplicação — por exemplo, uma operação de envio não irá verificar se há saldo suficiente para enviar até o momento da aplicação.

Depois de uma transação passar essa primeira validação, ela é propagada à rede e incluída em um set de transações em algum momento. Fazendo parte de um set de transações, a transação é aplicada ao ledger. Nesse momento uma tarifa é retirada da conta fonte independentemente de sucesso/falha. Depois, a transação é processada: número sequencial e assinaturas são verificados antes da tentativa de efetuar as operações na ordem que elas ocorrem na transação. Se alguma operação falhar, toda a transação falha e os efeitos das operações anteriores são anulados.


## Resultado

Para cada operação há um tipo de resultado correspondente. Em caso de sucesso, esse resultado permite aos usuários coletar informações sobre os efeitos da operação. Em caso de falha, o resultado permite aos usuários aprender mais sobre o erro.

O Stellar Core enfileira os resultados na tabela txhistory para outros componentes derivarem dados deles. Essa tabela txhistory é usada pelo módulo history (histórico) no Stellar Core para subir esse histórico para um armazenamento de longo prazo. Também pode ser usada por processos externos como o Horizon para coletar o histórico da rede que precisarem.

## Transações envolvendo múltiplas contas

Tipicamente, transações apenas envolvem operações em uma conta individual. Por exemplo, se a conta A quiser enviar lumens à conta B, apenas a conta A precisa autorizar a transação.

Porém, é possível compor uma transação que inclui operações em múltiplas contas. Neste caso, para autorizar as operações, o envelope da transação deve incluir assinaturas de todas as contas em questão. Por exemplo, você pode fazer uma transação em que ambas as contas A e B enviam para a conta C. Esta transação precisaria da autorização de tanto a conta A como B antes de ser submetida à rede.


## Exemplos
### 1. Câmbio sem terceiros

  Anush quer enviar a Bridget alguns XLM (Operação 1) em troca de BTC (Operação 2).

  Uma transação é construída:
  * source = `Anush_account`
  * Operação 1
    * source = _null_
    * Payment send XLM --> `Bridget_account`
  * Operação 2
    * source = _`Bridget_account`
    * Payment send BTC --> `Anush_account`

   Assinaturas requeridas:
  * Operação 1: requer assinaturas da `Anush_account` (a operação herda
    a conta source da transação) para atingir o limiar médio
  * Operação 2: requer assinaturas da `Bridget_account` para atingir o limiar médio
  * A transação requer assinaturas da `Anush_account` para atingir o limiar baixo, já que a `Anush_account` é a
    fonte (source) de toda a transação.

Portanto, se ambas a `Anush_account` e `Bridget_account` assinarem a transação, ela será validada.
Outras maneiras mais complexas de submeter esta transação são possíveis, mas assinar com essas duas contas é suficiente.

### 2. Workers

  Uma âncora quer dividir o processamento de sua conta online ("base") entre máquinas. Assim, cada máquina irá submeter transações de sua conta local e acompanhar seu próprio número sequencial. Para mais sobre números sequenciais das transações, por favor consulte [o documento sobre transações](./transactions.md).

   * Cada máquina ganha um par de chaves associadas a si. Digamos que haja apenas 3 máquinas: Machine_1, Machine_2, and Machine_3. (Na prática, podem haver tantas máquinas quanto a âncora quiser.)
   * Todas as três máquinas são adicionadas como Signers (signatárias) à conta base da âncora, "baseAccount", com
    um peso que as dá direitos medianos. Essas máquinas (workers) podem então assinar em nome da conta base. (Para mais sobre assinaturas, favor consultar a [documentação sobre multi-sig](multi-sig.md).)
   * Quando uma máquina (digamos, a Machine_2) quer submeter uma transação à rede, ela constrói a transação:
      * source=_chave pública da Machine_2_
      * sequence number=_número sequencial da conta da Machine_2_
      * Operação
        * source=_baseAccount_
        * Payment send um ativo --> conta de destino
      * assinar com a chave privada da Machine_2.

  A vantagem desse esquema é que cada máquina pode incrementar seu número sequencial e submeter uma transação sem invalidar nenhuma transação enviada pelas outras máquinas. Lembre-se, como explicado no [documento sobre transações](transactions.md), que todas as transações de uma conta fonte têm seu número sequencial específico. Usando workers, cada um com uma conta, permite à âncora submeter o maior número possível de transações sem colisões de números sequenciais.

### 3. Transações de vida longa

Transações que requerem assinaturas de várias partes, como a transação de câmbio entre Anush e Bridget do exemplo #1, podem levar um tempo arbitrariamente longo. Como todas as transações são construídas com números sequenciais específicos, ficar esperando pelas assinaturas podem bloquear a conta de Anush. Para evitar essa situação, pode ser usado um esquema parecido com o exemplo #2.

  Anush criaria uma conta temporária `Anush_temp`, dar fundos em XLM a `Anush_temp`, e adicionar a chave pública de `Anush_account` como signer de `Anush_temp` com um peso suficiente para pelo menos atingir o limiar baixo.

  Então, constrói-se uma transação:
  * source=_Anush_temp_
  * sequence number=_num seq Anush_temp_
  * Operação 1
    * source=_Anush_account_
    * Payment send XLM -> Bridget_account
  * Operação 2
    * source=_Bridget_account_
    * Payment send BTC -> Anush_account

  A transação teria que ser assinada por ambas Anush_account e Bridget_account, mas o número
  sequencial consumido será da conta Anush_temp.

  Se `Anush_account` quiser recuperar o saldo em XLM de `Anush_temp`, uma operação adicional "Operação 3" pode ser incluída na transação. Se quiser fazer isso, `Anush_temp` deve adicionar `Anush_account` como um signer com um peso que passe do limiar alto:
  * Operação 3
    * source=_null_
    * Account Merge -> "Anush_account"
