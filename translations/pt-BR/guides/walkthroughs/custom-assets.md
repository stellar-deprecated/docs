---
title: Ativos Personalizados
---

Para distribuir um token ou ativo personalizado na Rede Stellar, serão usadas três contas únicas. A primeira é a conta fonte. A conta fonte ou source account é a conta da entidade que quer criar um novo token. A segunda é a conta emissora. A conta emissora ou issuing account é criada pela conta fonte como um mecanismo para criar novos tokens. A terceira conta é a conta distribuidora, ou distribution account. O propósito da conta distribuidora é agir como o mecanismo que distribui tokens ao público.

A maior parte da documentação Stellar é centrada em instituições financeiras agindo como âncoras. Uma âncora ou anchor é uma entidade que age como uma ponte entre moedas existentes e a Rede Stellar, e envolve configurar sistemas como um servidor compliance e um servidor bridge. Não é necessário se tornar uma âncora para criar tokens e ativos personalizados na Rede Stellar.

A seguir está um passo a passo das transações necessárias para criar um token personalizado. As transações podem ser traduzidas em requests de API ou podem ser executadas usando o [Laboratório Stellar](https://www.stellar.org/laboratory/).


## Passos

#### Transação 1: Criar a conta emissora
**Conta**: conta fonte  
**Operações**:
- [Create Account](../concepts/list-of-operations.md#create-account): criar a conta emissora no sistema
	 - saldo inicial: [saldo mínimo](../concepts/fees.md#saldo-mínimo-da-conta) + [tarifa de transação](../concepts/fees.md#tarifa-de-transação)

**Signatários**: conta fonte

#### Transação 2: Criar a conta distribuidora
**Conta**: conta fonte  
**Operações**:
- [Create Account](../concepts/list-of-operations.md#create-account): criar a conta distribuidora no sistema
	 - saldo inicial: [saldo mínimo](../concepts/fees.md#saldo-mínimo-da-conta) incluindo trustlines  

**Signatários**: conta fonte


A Transação 1 e a Transação 2 são submetidas à rede pelo criador do token. Isso cria as contas emissora e distribuidora e dá à entidade fonte o acesso às chaves pública e privada de cada conta. A conta emissora é financiada com o saldo mínimo e nenhuma entrada. Ela receberá dinheiro adicional para cobrir a tarifa que incorre ao transferir ativos no fim de um acordo escrow, e para cobrir a tarifa envolvida ao transferir os ativos à conta distribuidora. A conta distribuidora deve receber fundos iguais ao saldo mínimo mais uma entrada, já que ela terá de criar uma trustline (uma entrada) no futuro. Os saldos iniciais são os mínimos necessários para tornar as contas válidas na Rede Stellar; a quantidade real usada para criar as duas contas pode ser de qualquer valor, contanto que seja maior do que o mínimo. A conta distribuidora pode começar apenas com o saldo mínimo sem entradas, mas a próxima transação irá criar uma trustline para a conta, aumentando assim o valor de seu saldo mínimo.


#### Transação 3: Criar Confiança
**Conta**: conta distribuidora  
**Operações**:
- [Change Trust](../concepts/list-of-operations.md#change-trust): criar uma trustline com a conta emissora
	 - asset: formato do código do ativo
	 	- code: código do ativo
	 	- issuer account: conta emissora
	 - trust limit: máximo de tokens  

**Signatários**: conta distribuidora


A Transação 3 é submetida à rede pelo criador do token. Ela cria uma trustline entre a conta emissora e a conta distribuidora. Atualmente existem dois formatos de códigos de ativo suportados para tokens: Alfanumérico com máximo de 4 caracteres (Alphanumeric 4) e Alfanumérico com máximo de 12 caracteres (Alphanumeric 12). O conjunto de caracteres alfanuméricos é quaisquer caracteres do conjunto [a-z][A-Z][0-9]. Neste passo, você está introduzindo o seu token/ativo na rede Stellar, mas não está criando nenhum para compra e venda. O parâmetro trust limit limita o número de tokens que a conta distribuidora será capaz de deter de uma só vez. Recomenda-se ora deixar esse número maior que o número total de tokens que se espera estarem disponíveis na rede, ora definí-lo como o valor máximo possível (um total de max int64 stroops) que uma conta pode deter.


#### Transação 4: Criação do Ativo
**Conta**: conta emissora  
**Operações**:
- [Payment](../concepts/list-of-operations.md#payment): dar os tokens à conta distribuidora
	 - destination: conta distribuidora
	 - asset: formato do código do ativo
	 	- code: código do ativo
	 	- issuer account: conta emissora
	 - trust limit: tokens a serem criados

**Signatários**: conta emissora

A Transação 4 é criada e submetida à rede pela conta emissora. Nesta transação, são pagos os tokens à conta distribuidora, criando-os na rede. O número total de tokens pagos à conta distribuidora é o número total de tokens criados.

#### Transação 5: Criação do Ativo
**Conta**: conta emissora  
**Operações**:
- [Set Option - Home Domain](../concepts/list-of-operations.md#set-options): definir o home domain do stellar.toml
	 - home domain: endereço do domínio

**Signatários**: conta emissora


A Transação 5 é criada e submetida à rede. O endereço do domínio deve ser o domínio onde está hospedado o seu arquivo stellar.toml (que contém metadados relacionados ao seu token).

Neste passo, um stellar.toml deve ser criado e hospedado em um domínio de sua escolha. O arquivo stellar.toml deve conter metadados relevantes ao token sendo criado. Manter um arquivo stellar.toml é importante, porque ele dá transparência ao ativo e seu uso.
Uma declaração stellar.toml padrão de um ativo deve conter os dados a seguir para cada ativo emitido (todos os valores entre chaves são variáveis, e devem ser preenchidos):
```
[[CURRENCIES]]
code="{código do ativo}"
issuer="{chave pública da conta emissora}"
display_decimals={número inteiro}
```

O campo display_decimals representa o máximo de casas decimais que devem ser exibidos a clientes (wallets, exchanges, etc) em sua interface de usuário.

Outros campos que podem ser incluídos no arquivo stellar.toml são:
```
name="{nome}"
desc="{descrição do ativo}"
conditions="{condições para uso e distribuição do ativo}"
image="{url de uma imagem associada ao ativo}"
```


#### (OPCIONAL) Transação A: Limitar a Quantidade de Tokens
**Conta**: conta emissora  
**Operações**:
- [Set Options - Thresholds & Weights](../concepts/list-of-operations.md#set-options): remover todos os pesos e limiares
	 - master weight: 0
	 - low threshold: 0
	 - medium threshold: 0
	 - high threshold: 0

**Signatários**: conta emissora


A Transação A é criada e submetida à rede pela conta emissora. Definindo todos os pesos e limiares como zero, isso cria uma situação equivalente a jogar fora as chaves. Todas as chaves, incluindo a chave mestra da conta, se tornarão inválidas. Trancar uma conta desta maneira evita que qualquer outra transação seja criada por esta conta, o que significa que não poderão ser criados mais tokens. A [forma XDR](https://www.stellar.org/developers/horizon/reference/xdr.html) desta transação pode ser publicada após o envio para servir como prova de que a conta foi trancada.



***AVISO: APÓS REALZER ESTE PASSO, NÃO SERÁ MAIS POSSÍVEL CRIAR NOVAS OPERAÇÕES OU SUBMETER NOVAS TRANSAÇÕES COM A CONTA EMISSORA. ESTE PASSO É DEFINITIVO.***


#### Transação 6: Distribuição do Token
**Conta**: conta distribuidora  
**Operações**:
- [Manage Offer - Sell](../concepts/list-of-operations.md#manage-offer): criar uma oferta para vender os tokens criados
	- selling: formato do código do ativo criado
		- code: código do ativo
		- issuer account: conta emissora
	- buying: formato do código do ativo
		- code: código do ativo
		- issuer account: conta emissora
	- amount: quantidade a ser vendida
	- price: preço da venda em lumens
	- offer id: 0  

**Signer**: conta distribuidora

A Transação 6 é criada e submetida à rede pela conta distribuidora. Neste passo, o ativo criado está sendo vendido em troca de outro ativo. Esse ativo pode ser outro ativo criado, uma moeda fiat, uma criptomoeda, ou lumens. Se o offer id estiver definido como zero, uma nova oferta está sendo criada. O amount é o preço de 1 unidade do ativo a ser vendido (selling) em termos do ativo que está sendo comprado (buying).

Submetendo a Transação 6, o token criado será listado na exchange descentralizada da Rede Stellar. Para ser listado em clientes exchange como Stellar Term e Stellar Port, favor consultar em seus sites as instruções para listagem. Incentivamos listar o ativo em exchanges para aumentar a visibilidade.



## Exemplos Adicionais:
Exemplos de algumas das transações e mais sobre emissão de ativos pode ser visto [aqui](../issuing-assets.md). Além disso, [este artigo](../concepts/assets.md#âncoras-emitir-ativos) dá uma explicação mais aprofundada sobre termos importantes relacionados à criação de ativos. Um guia preliminar que dá uma explicação didática sobre criação de tokens usando o Laboratório Stellar está disponível [aqui](https://www.stellar.org/blog/tokens-on-stellar/).

## Recursos:
- [Tornar-se uma âncora](../anchor/) - Stellar<span>.org
- [Cálculo do Saldo Mínimo da Conta](../concepts/fees.md#saldo-mínimo-da-conta) - Stellar<span>.org
- [Conceito: stellar.toml](../concepts/stellar-toml.md) - Stellar<span>.org
- [Conceito: Trustlines](../concepts/assets.md#trustlines) - Stellar<span>.org
