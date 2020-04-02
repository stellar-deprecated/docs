---
title: Ativos
---

A rede distribuída Stellar pode ser usada para rastrear, manter e transferir qualquer tipo de **ativo**: dólares, euros, bitcoin,
ações, ouro, e outras representações (tokens) de valor. Qualquer ativo na rede pode ser trocado e feito câmbio com qualquer outro.

Além dos lumens (veja abaixo), todos os ativos têm
- **Tipo de ativo**: ex.: USD ou BTC
- **Emissor**: a conta que criou o ativo

## Trustlines
Quando se detém ativos no Stellar, na verdade o que se tem é crédito de algum emissor. O emissor concordou previamente que irá
trocar com você o seu crédito na rede Stellar pelo ativo correspondente – ex.: moedas fiat, metais preciosos – por fora do Stellar.
Digamos que Scott emite laranjas como crédito na rede. Se você possui créditos de laranja, você e Scott têm
um acordo baseado em confiança, ou em uma trustline (linha de confiança): ambos concordam que, ao dar a Scott um crédito de laranja, ele deverá te dar uma laranja.

Ao deter um ativo, você precisa confiar que o emissor irá resgatar seu crédito. Como não se espera que os usuários do Stellar
confiem em qualquer emissor, as contas precisam explicitamente confiar em uma conta emissora antes de poderem deter o crédito daquele emissor.
No exemplo acima, você precisa explicitamente confiar em Scott antes de poder deter créditos de laranja.

Para confiar em uma conta emissora, cria-se uma **trustline.** Trustlines são entradas que permanecem no ledger do Stellar.
Monitoram o limite da confiança da sua conta na conta emissora e o valor do crédito da conta emissora que sua conta possui no momento.

## Lumens (XLM)
**Lumens (XLM)** são a moeda nativa da rede. Um lumen é o único tipo de ativo que pode ser usado na rede
Stellar que não requer um emissor ou trustline.
Qualquer conta pode deter lumens. Pode-se trocar lumens por outros ativos na rede.


## Âncoras: emitir ativos
Qualquer conta pode emitir ativos na rede Stellar. Entidades que emitem ativos são chamadas **âncoras** (anchors). Âncoras podem ser
rodadas por indivíduos, pequenos negócios, comunidades locais, organizações sem fins lucrativos, etc. Qualquer tipo de instituição financeira – um banco, uma empresa de meios de pagamento – pode ser uma âncora.

Cada âncora tem uma **conta emissora** a partir da qual emite o ativo.

Sendo uma âncora, ao emitir um ativo, dá-se um **código de ativo**. Ativos são identificados de maneira única pelo código do ativo e o emissor.
Em última instância, é uma decisão do emissor definir o código do ativo. Porém, por convenção, moedas devem ser representadas pelo
[código ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) apropriado. Para ações financeiras e títulos, use o [número ISIN](https://en.wikipedia.org/wiki/International_Securities_Identification_Number) apropriado.
Para as suas âncoras que emitem laranjas, bodes, favores ou cerveja, você está por conta própria – invente um código adequado!

Atualmente existem dois formatos suportados de códigos de ativo.

#### Alfanumérico, máximo de 4 caracteres
Qualquer caractere do conjunto [a-z][A-Z][0-9] é permitido. O código pode ser menor do que 4 caracteres, mas não devem haver caracteres desnecessários (como espaços ou vírgulas) antes ou depois do código.

#### Alfanumérico, máximo de 12 caracteres
Qualquer caractere do conjunto [a-z][A-Z][0-9] é permitido. O código pode ser qualquer número de caracteres de 5 a 12, mas não devem haver caracteres desnecessários (como espaços ou vírgulas) antes ou depois do código.


### Controlar detentores de um ativo
Por padrão, qualquer um pode criar uma trustline com um emissor de um ativo para aceitar um ativo. No entanto, sendo uma âncora, é possível **autorizar explicitamente** e **revogar** o acesso de usuários a seu ativo, habilitando as seguintes flags na sua conta emissora (leia mais [aqui](https://www.stellar.org/developers/guides/concepts/accounts.html#flags)).

* `AUTHORIZATION REQUIRED`: com esta opção, a âncora deve aprovar todos os usuários que quiserem deter seu ativo, permitindo-a controlar quem são seus clientes. A aprovação é feita pela âncora definindo a flag `Authorize` de uma trustline preexistente como **true** com a operação [Allow Trust](./list-of-operations.md#allow-trust).
* `AUTHORIZATION REVOCABLE`: com esta opção, a âncora pode definir a flag `Authorize` de uma trustline preexistente como `false` com a operação [Allow Trust](./list-of-operations.md#allow-trust), assim congelando o ativo detido por outra conta. Quando um ativo é congelado, a conta detentora não pode transferí-lo para outras contas, nem mesmo de volta à âncora. Esta opção permite que a conta emissora revogue ativos emitidos por acidente ou que foram obtidos de maneira imprópria. Para usar esta opção, `AUTHORIZATION REQUIRED` deve também estar habilitado.

**Fluxo de exemplo para uma conta que tenha `AUTHORIZATION REQUIRED` e `AUTHORIZATION REVOCABLE` habilitados:**
1. Usuário decide que quer aceitar um ativo
2. Usuário abre uma trustline com a conta emissora deste ativo
3. Emissor autoriza a trustline do usuário
4. Usuário pode aceitar e enviar o ativo a quem mais quiser e que tenha uma trustline aberta com o emissor
5. Emissor quer congelar o acesso do usuário ao ativo
6. Emissor desautoriza a trustline do usuário
7. Usuário não pode enviar ou aceitar este ativo

**Um fluxo alternativo:** note que é possível definir essas flags posteriormente. Pode ser que no início você tenha decidido permitir que qualquer um abrisse uma trustline, mas depois percebeu que não era uma boa ideia. Depois de emitir este ativo, você pode então habilitar **ambas** as flags acima. Nesse momento, todos que tenham uma trustline aberta retêm seu status de autorizado, mas agora você pode revogar a confiança (supondo que você não ajustou o peso de sua chave mestre e/ou [limiares da conta](./multi-sig.md#thresholds)).

**Note:** quando âncoras emitem ativos, frequentemente desejam limitar a quantidade de tokens em circulação. É possível criar esta quantidade limitada e ainda manter a habilidade de autorizar e revogar, pois a operação [Allow Trust](./list-of-operations.md#allow-trust) é de *limiar baixo* enquanto que as operações [Set Options](./list-of-operations.md#set-options) e [Payment](./list-of-operations.md#payment) são de *limiar alto/médio*. Para aprender mais sobre criar ativos e limitar a oferta de tokens, [leia aqui](../walkthroughs/custom-assets.md#opcional-transação-a-limitar-a-quantidade-de-tokens).

**Garantir aos detentores do ativo que eles não serão revogados**: as funcionalidades acima são ótimas para emissores de ativos que desejam controlar quem pode e quem não pode deter e transacionar seu ativo. Porém, e se eu for um detentor de um ativo e estiver preocupado que um emissor congele os ativos que eu possuo? Para dar confiança aos potenciais detentores, a conta emissora pode habilitar a seguinte flag:

* `AUTHORIZATION IMMUTABLE`: com esta opção, nenhuma das flags de autorização podem ser habilitadas e a conta nunca pode ser deletada.

## Precisão e representação de quantidades
Toda quantia de um ativo é codificada nas [estruturas XDR](https://www.stellar.org/developers/horizon/reference/xdr.html) como um número inteiro 64-bits signed. A unidade da quantidade de um ativo (aquela que é vista pelos usuários finais) é reduzida em um fator de dez milhões (10,000,000) para chegar à representação nativa como números inteiros 64-bits. Por exemplo, o valor de número inteiro `25,123,456` equivale a `2.5123456` unidades do ativo. Esse escalamento permite que haja **sete casas decimais** de precisão em unidades mais amigáveis aos usuários.

A menor unidade diferente de zero é `0.0000001` (um decimilionésimo), representada pelo valor `1` em números inteiros. A maior unidade possível é `((2^63)-1)/(10^7)` (derivada da int64 máxima), que é igual a `922,337,203,685.4775807`.

Os números são representados como `int64`s. Esses valores são gravados como apenas números inteiros signed, para evitar bugs provenientes de se misturar números inteiros signed e unsigned.

### Relevância para bibliotecas cliente do Horizon e Stellar
No Horizon e em bibliotecas do lado cliente como `js-stellar-sdk`, o valor codificado em números inteiros é abstraído. Várias APIs esperam o próprio valor da unidade (o valor mostrado aos usuários finais.)

### Manter precisão com bibliotecas "big number"
Algumas linguagens de programação (como JavaScript) têm problemas para manter precisão com alguns números. Recomenda-se usar bibliotecas "big number" que podem gravar números decimais de precisão arbitrária sem perda de precisão.

### Um stroop, múltiplos stroops
Um "stroop" é a menor unidade. É igual a um decimilionésimo: `1/10000000` ou `0.0000001`. O termo stroop é usado como uma forma conveniente de se referir a essas pequenas medidas de quantidade. A forma plural é "stroops" (ex.: "100 stroops"). Curiosidade: este termo é derivado do Stroopy, o nome do mascote do Stellar cujo nome é derivado de [stroopwafels](https://pt.wikipedia.org/wiki/Stroopwafel).
