---
title: Stellar Smart Contracts
---

Stellar pode ser usado para construir smart contracts sofisticados. Smart contracts são programas de computador que podem executar automaticamente um acordo baseado em lógica de programação.

O conceito de integrar tecnologia e contratos jurídicos data desde os anos 1950, quando acadêmicos construiram métodos computacionais que poderiam executar regras jurídicas sem envolver processos jurídicos tradicionais. Foram definidos formalmente por Nick Szabo em 1997:

> Smart contracts combinam protocolos com interfaces de usuário para formalizar e proteger relações por meio de redes informáticas. Os objetivos e princípios do design desses sistemas são derivados de princípios jurídicos, teoria econômica e teorias de protocolos confiáveis e seguros.

Nos últimos anos, a tecnologia blockchain tem tornado possível uma nova geração de smart contracts com armazenamento imutável de termos do acordo, autorização criptográfica e transferências de valor integradas.

Para a Rede Stellar, smart contracts se manifestam como Stellar Smart Contracts. Um **Stellar Smart Contract** (SSC) é expresso como composições de transações que são conectadas e executadas usando vários condicionamentos. A seguir estão exemplos de condicionamentos que podem ser considerados e implementados ao criar SSCs:

- *Multisignature* - Que chaves são necessárias para autorizar certa operação? Quais partes devem concordar em dada circunstância para executar os passos?

Multisignature ou multiassinaturas é o conceito de exigir assinaturas de múltiplas partes para assinar transações que originadas de uma conta. Por meio de pesos das assinaturas e limiares, cria-se uma representação de poder nas assinaturas.

- *Batching/Atomicidade* - Que operações devem ocorrer todas ao mesmo tempo ou falhar? O que deve acontecer para forçar isso a falhar ou passar?

Batching é o conceito de incluir múltiplas operações em uma transação. Atomicidade é a garantia que, dada uma série de operações submetidas à rede, se uma operação falhar, todas as operações na transação falham.

- *Sequência* - Em que ordem uma série de transações deverá ser processada? Quais são as limitações e relações de dependência?

O conceito de sequência é representado na Rede Stellar por meio do número sequencial. Utilzando números sequenciais ao manipular transações, pode-se garantir que transações específicas não terão sucesso se uma transação alternativa for submetida.

- *Limites de tempo* - Quando uma transação pode ser processada?

Limites de tempo ou time bounds são restrições ao período de tempo durante o qual uma transação é válida. Usar os limites de tempo permite que períodos de tempo sejam representados em um SSC.

Esta visão geral apresenta dois padrões de design comuns que podem ser usados para criar SSCs na Rede Stellar. As transações podem ser traduzidas em API requests ou podem ser executadas usando o [Laboratório Stellar](https://www.stellar.org/laboratory/).


## Conta Escrow Multisignature para Duas Partes com Bloqueio Temporal e Recuperação
### Exemplo de Caso de Uso
Ben Bitdiddle vende 50 tokens CODE para Alyssa P. Hacker, com a condição de que Alyssa não poderá revender os tokens até ter se passado um ano. Ben não confia completamente em Alyssa, então Ben sugere que ele detenha os tokens para Alyssa durante o ano.

Alyssa protesta. Como ela irá saber se o Ben ainda terá os tokens depois de um ano? Como ela pode confiar que ele irá realmente entregá-los?

Além disso, às vezes Alyssa é meio esquecida. Existe a possibilidade de que ela não irá lembrar de resgatar seus tokens depois de decorrido um ano. Ben gostaria de embutir um mecanismo de recuperação para, caso Alyssa não resgate seus tokens, eles podem ser recuperados. Assim, os tokens não serão perdidos para sempre.

### Implementação
Um acordo escrow é criado entre duas entidades: a origem – a entidade que financia o acordo, e o alvo – a entidade que recebe os fundos no final do contrato.

Três contas são necessárias para executar um contrato escrow entre duas partes: uma conta fonte, uma conta de destino e uma conta escrow. A conta fonte é a conta da origem que está iniciando e fundando o acordo escrow. A conta de destino é a conta do alvo que por fim irá ganhar controle dos fundos. A conta escrow é criada pela origem e detém os fundos durante o período de travamento.

Dois períodos de tempo devem ser estabelecidos e acordados para este acordo escrow: um período de trancamento, durante o qual nenhuma parte pode manipular (transferir, utilizar) os ativos, e um período de recuperação, depois do qual a origem consegue recuperar os fundos da conta escrow.

Cinco transações são usadas para criar um contrato escrow, explicadas abaixo em ordem de criação. As variáveis a seguir serão usadas na explicação:
-  **N**, **M** – número sequencial da conta escrow e da conta fonte, respectivamente; N+1 representa próximo número sequencial da transação, e de assim em diante
- **T** – o período de trancamento
- **D** – a data a partir da qual começar o período de trancamento
- **R** – o período de recuperação

Para o padrão de design descrito abaio, o ativo sendo trocado é o ativo nativo. A ordem de envio das transações à rede Stellar é diferente da ordem de criação. A imagem a seguir mostra a ordem de envio, no que diz respeito ao tempo:

![Diagram Transaction Submission Order for Escrow Agreements](assets/ssc-escrow.png)

#### Transação 1: Criar uma Conta Escrow
**Conta**: conta fonte  
**Número Sequencial**: M  
**Operações**:
- [Create Account](../concepts/list-of-operations.md#create-account): criar conta escrow no sistema
	 - saldo inicial: [saldo mínimo](../concepts/fees.md#saldo-mínimo-da-conta) + [tarifa de transação](../concepts/fees.md#tarifa-de-transação)

**Signatários**: source account

A Transação 1 é submetida à rede pela origem por meio da conta fonte. Cria-se a conta escrow, financiada com a reserva mínima atual, e dá-se à origem acesso às chaves pública e privada da conta escrow. A conta escrow é financiada com o saldo mínimo, sendo assim uma conta válida na rede. Ela recebe dinheiro adicional para custear a tarifa que incorre ao transferir os ativos no fim do acordo escrow. Ao criar novas contas, recomenda-se financiar a conta com um saldo maior que o saldo inicial calculado.


#### Transação 2: Habilitar Multi-sig
**Conta**: conta escrow   
**Número Sequencial**: N  
**Operações**:
- [Set Option - Signer](../concepts/list-of-operations.md#set-options): Adicionar a conta de destino como um signatário com peso em transações para a conta escrow
	 - weight: 1
- [Set Option - Thresholds & Weights](../concepts/list-of-operations.md#set-options): definir o peso da chave mestra e alterar os limiares para exigirem todas as assinaturas (2 de 2 signers)
	 - master weight: 1
	 - low threshold: 2
	 - medium threshold: 2
	 - high threshold: 2

**Signatários**: conta escrow

A Transação 2 é criada e submetida à rede. É feita pela origem usando a conta escrow, já que a origin tem controle sobre a conta escrow nesse momento. A primeira operação adiciona à conta escrow a conta de destino como um segundo signatário com um peso igual a 1.

Por padrão, as limiares são desiguais. A segunda operação define o peso da chave mestra como igual a 1, nivelando seu peso com o peso da conta de destino. Na mesma operação, os limiares são definidos como iguais a 2. Isso faz que qualquer tipo de transação que origine da conta escrow exija que todas as assinaturas tenham um peso total de 2. Nesse momento, o peso de assinar com tanto a conta escrow e a conta de destino são somados, resultando em um total igual a 2. Isso garante que, desse ponto em diante, ambas a conta escrow e a conta de destino (a origem e o alvo) precisem assinar todas as transações referentes à conta escrow. Isso dá controle parcial da conta escrow ao alvo.

#### Transação 3: Destravar  
**Conta**: conta escrow  
**Número Sequencial**: N+1  
**Operações**:
- [Set Option - Thresholds & Weights](../concepts/list-of-operations.md#set-options): definir peso da chave mestra e alterar limiares para exigirem apenas 1 assinatura
	 - master weight: 0
	 - low threshold: 1
	 - medium threshold: 1
	 - high threshold: 1

**Limites de Tempo**:
- tempo mínimo: data do destravamento
- tempo máximo: 0  

**Signatário Imediato**: conta escrow  
**Signatário Eventual**: conta de destino


#### Transação 4: Recuperação
**Conta**: conta escrow  
**Número Sequencial**: N+1  
**Operações**:
- [Set Option - Signer](../concepts/list-of-operations.md#set-options): remover a conta de destino como signatário
	 - weight: 0  
 - [Set Option - Thresholds & Weights](../concepts/list-of-operations.md#set-options): definir o peso da chave mestra e alterar limiares para exigirem apenas 1 assinatura
	 - low threshold: 1
	 - medium threshold: 1
	 - high threshold: 1  

**Limites de Tempo**:
- tempo mínimo: data da recuperação
- tempo máximo: 0

**Signatário Imediato**: conta escrow  
**Signatário Eventual**: conta de destino  

A Transação 3 e a Transação 4 são criadas e assinadas pela conta escrow pela origem. A origem então dá as transações 3 e 4, em [forma XDR](https://www.stellar.org/developers/horizon/reference/xdr.html), ao alvo para que ele assine usando a conta de destino. O alvo então as publica para a origem [verificá-las](https://www.stellar.org/laboratory/#xdr-viewer?type=TransactionEnvelope&network=test) e salvá-las em um lugar seguro. Uma vez assinadas por ambas as partes, essas transações não podem ser modificadas. Tanto a origem como o alvo devem reter uma cópia dessas transações assinadas em sua forma XDR, e as transações podem ser armazenadas em um lugar publicamente acessível sem receio de alterações maliciosas.

A Transação 3 e a Transação 4 são criadas e assinadas antes da conta escrow ser financiada, e possuem o mesmo número de transação. Isso é feito para garantir que ambas as partes estejam de acordo. Se as circunstâncias mudarem antes antes de uma dessas duas transações forem submetidas, ambos a origem e o alvo devem autorizar transações utilizando a conta escrow. Isso é representado pela exigência por assinaturas de tanto a conta de destino como a conta escrow.

A Transação 3 remove a conta escrow como um signatário para transações geradas a partir de si mesma. Esta transação transfere o controle total da conta escrow ao alvo. Depois do fim do período de trancamento, a única conta que é necessária para assinar transações a partir da conta escrow é a conta de destino. A data de destravamento (D+T) é a primeira data em que a transação de destravamento pode ser submetida. Se a Transação 3 for submetida antes dessa data, a transação não será válida. O tempo máximo é definido como igual a 0, para denotar que a transação não possui uma data de expiração.

A Transação 4 existe para a recuperação da conta, caso o alvo não submeta a transação de destravamento. Ela remove a conta de destino como signatário, e reestabelece os pesos para apenas exigir sua própria assinatura. Isso retorna o controle total da conta escrow à origem. A Transação 4 pode apenas ser submetida após a data de recuperação (D+T+R), e não possui data de expiração.

A Transação 3 pode ser submetida a qualquer momento durante o período de recuperação (R). Se o alvo não submeter a Transação 3 para permitir acesso aos fundos na conta escrow, a origem pode submeter a Transação 4 após a data de recuperação. A origem pode retomar os ativos trancados caso deseje, já que a Transação 4 faz que o alvo não seja mais necessário para assinar transações da conta escrow. Após a data de recuperação, ambas Transações 3 e 4 são válidas e possíveis de serem enviadas à rede, mas apenas uma transação será aceita pela rede. Isso é garantido pelo recurso de que ambas as transações têm o mesmo número sequencial.

Para resumir: se a Transação 3 não for submetida pelo alvo, a Transação 4 será submetida pela origem depois do período de recuperação.

#### Transação 5: Financiamento  
**Conta**: conta fonte  
**Número Sequencial**: M+1  
**Operações**:
- [Payment](../concepts/list-of-operations.md#payment): Pagar à conta escrow a quantidade adequada de ativos  

**Signer**: conta fonte

A Transação 5 é a transação que deposita a quantidade adequada de ativos na conta escrow a partir da conta fonte. Deve ser submetida após a Transação 3 e a Transação 4 forem assinadas pela conta de destino e publicadas de volta à conta fonte.

## Crowdfunding Conjunto
### Exemplo de Caso de Uso
Alyssa P. Hacker precisa juntar dinheiro para pagar por um serviço de uma empresa, Tutoriais de Código para Cães, mas ela quer captar os fundos do público por meio de crowdfunding. Se pessoas suficientes doarem, ela conseguirá pagar o serviço diretamente à empresa. Caso contrário, ela terá um mecanismo para retornar as doações. Para garantir sua confiabilidade aos doadores, ela decide perguntar a Ben Bitdiddle se ele estaria disposto a ajudá-la a arranjar pessoas que gostariam de participar do crowdfunding. Ele também irá dar sua palavra a seus amigos de que Alyssa é confiável, como maneira de convencê-los a doar para o projeto.

### Implementação de Padrão
No exemplo mais simples, um smart contract para crowdfunding requer pelo menos três partes: duas das quais (daqui em diante chamadas de parte A e parte B) concordam em patrocinar o crowdfunding, e uma terceira para a qual os fundos finais serão entregues (chamada de alvo). Um token deve ser criado como o mecanismo para executar o crowdfunding. O token de participação utilizado, assim como uma conta de armazenamento, devem ser criados por uma ou mais partes. Uma conta de armazenamento emite tokens de participação cujo preço pode ser igual a qualquer valor por token. A conta de armazenamento coleta os fundos e, após o fim do período de crowdfunding, irá retornar os fundos aos contribuidores caso a meta não seja atingida.

Cinco transações são usadas para criar um contrato de crowdfunding. As seguintes variáveis são usadas para explicar a formulação do contrato:
- **N**, **M** - número sequencial da conta da parte A e a conta de armazenamento, respectivamente; N+1 representa o próximo número sequencial da transação, e de assim em diante
- **V** - valor total que a campanha de crowdfunding quer levantar
- **X** - valor pelo qual os tokens serão vendidos

Há quatro contas usadas para criar um esquema básico de crowdfunding. A primeira é a conta de armazenamento, que é a conta encarregada de coletar e interagir com os doadores. Ela requer a assinatura de ambas partes A e B para realizar qualquer transação. A segunda é a conta objetivo, possuída pelo alvo, que receberá os fundos levantados caso o objetivo do crowdfunding seja atingido com sucesso. As duas contas restantes são posse da parte A e da parte B respectivamente, que estão organizando o crowdfunding.

As transações que criam este padrão de design podem ser criadas e submetidas por qualquer parte que patrocinar a campanha. As transações são apresentadas em ordem de criação. A ordem do envio à Rede Stellar é condicional, e depende do sucesso da campanha de crowdfunding.

![Diagram Transaction Submission Order for Crowdfunding Campaigns](assets/ssc-crowdfunding.png)


#### Transação 1: Criar a Conta de Armazenamento
**Conta**: parte A  
**Número Sequencial**: M  
**Operações**:
- [Create Account](../concepts/list-of-operations.md#create-account): criar a conta de armazenamento no sistema
	- [starting balance](../concepts/fees.md#saldo-mínimo-da-conta): saldo mínimo

**Signatários**: parte A

#### Transação 2: Adicionar signatários
**Conta**: conta de armazenamento  
**Número Sequencial**: N  
**Operações**:
 - [Set Option - Signer](../concepts/list-of-operations.md#set-options): Adicionar a parte A como um signatário com peso em transações para a conta escrow
	- weight: 1
 - [Set Option - Signer](../concepts/list-of-operations.md#set-options): Adicionar a parte B como um signatário com peso em transações para a conta escrow
	- weight: 1
 - [Set Option - Thresholds & Weights](../concepts/list-of-operations.md#set-options): remover chave mestra e alterar limiares para exigirem todas as outras assinaturas (2 de 2 signatários)
	- master weight: 0
	- low threshold: 2
	- medium threshold: 2
	- high threshold: 2

**Signatários**: conta de armazenamento


As Transações 1 and 2 são criadas e submetidas por uma das duas partes que patrocinam a campanha de crowdfunding. A Transação 1 cria a conta de armazenamento. A conta de armazenamento é financiada com um saldo inicial para torná-la válida na rede. Ao criar novas contas, recomenda-se financiá-las com um saldo maior do que o saldo inicial calculado. A Transação 2 remove a conta de armazenamento como signatário de suas próprias transações, e adiciona a parte A e a parte B como signatários. Desse ponto em diante, todas as partes envolvidas devem acordar e assinar todas as transações provenientes da conta de armazenamento. Este mecanismo de confiança existe para proteger doadores contra uma das partes tomar ações maliciosas.

Depois da Transação 2, a conta de armazenamento deve ser financiada com os tokens a serem usados para a campanha de crowdfunding, assim como lumens suficientes para cobrir as tarifas de transações de todas as transações a seguir.

#### Transação 3: Começar o Crowdfunding
**Conta**: conta de armazenamento  
**Número Sequencial**: N+1  
**Operações**:
- [Manage Offer - Sell](../concepts/list-of-operations.md#manage-offer): vender tokens de participação a um preço de X por token

**Signer**: conta da parte A, conta da parte B

A Transação 3 é criada e submetida à rede para começar a campanha de crowdfunding. Ela cria uma oferta na rede que vende os tokens de participação a um preço de X por token. Dado que uma quantidade limitada de tokens é criada para a campanha, o preço dos tokens deve ser tal que um total de V possa ser levantado por meio das vendas.

#### Transação 4: Sucesso do Crowdfunding  
**Conta**: conta de armazenamento  
**Número Sequencial**: N+2    
**Operações**:
- [Payment](../concepts/list-of-operations.md#payment): enviar V da conta de armazenamento à conta objetivo


**Time Bounds**:
- tempo mínimo: fim do período de crowdfunding
- tempo máximo: 0

**Signatários**: conta da parte A, conta da parte B

#### Transação 5: Falha do Crowdfunding
**Conta**: conta de armazenamento    
**Número Sequencial**: N+3      
**Operações**:
- [Manage Offer - Cancel](../concepts/list-of-operations.md#manage-offer): cancelar oferta preexistente de venda de tokens
 - [Manage Offer - Buy](../concepts/list-of-operations.md#manage-offer): conta de armazenamento compra tokens de participação a um preço de X por token

**Time Bounds**:
- tempo mínimo: fim do período de crowdfunding
- tempo máximo: 0

**Signatários**: conta da parte A, conta da parte B  

A Transação 4 e a Transação 5 são transações pré-assinadas e não submetidas que são publicadas. Ambas as transações têm um tempo mínimo igual ao fim do período de crowdfunding que previne que sejam submetidas antes do tempo acordado pelas partes patrocinadoras. Elas podem ser submetidas por qualquer pessoa no fim do crowdfunding. A Transação 4 transfere a quantia levantada à conta objetivo. A Transação 5 impede a venda de todos os tokens restantes cancelando a oferta e permitindo aos doadores criarem ofertas para vender tokens de volta à conta de armazenamento.

A segurança é providenciada por meio de números sequenciais. Como mencionado, o número sequencial da Transação 4 é *N+2* e o número sequencial da Transação 5 é *N+3*. Estes números sequenciais requerem que ambas a Transação 4 e a Transação 5 sejam submetidas à rede na ordem adequada.

O crowdfunding falha quando não foram levantados fundos suficientes até a data esperada. Isso equivale a não vender todos os tokens de participação. A Transação 4 é submetida à rede, mas irá falhar. A conta de armazenamento terá lumens suficientes para pagar a tarifa de transação, então a transação será considerada em consenso e um número sequencial será consumido. Ocorrerá um erro, no entanto, porque não haverá fundos suficientes na conta para cobrir a quantia especificada no pagamento. A Transação 5 é então submetida à rede, permitindo que contribuidores vendam de volta seus tokens. Além disso, a Transação 5 cancela a habilidade da conta de armazenamento de vender tokens de participação, interrompendo o status do evento de crowdfunding.

O crowdfunding obtém sucesso se V foi levantado até a data esperada. Levantar fundos suficientes equivale a todos os tokens de participação da conta de armazenamento terem sido comprados. A Transação 4 é submetida à rede e terá sucesso porque há fundos suficientes presentes na conta para concretizar a operação de pagamento, assim como cobrir a taxa de transação. A Transação 5 será então submetida à rede, mas irá falhar. A conta de armazenamento terá lumens suficientes para pagar a tarifa de transação, então a transação será considerada em consenso e um número sequencial será consumido. A transaction obterá sucesso, mas como a conta de armazenamento não terá fundos para comprar de volta os tokens, os participantes não poderão tentar recuperar seus fundos.

#### Bonus: Contribuidores de Crowdfunding
Os passos a seguir são realizados para se tornar um contribuidor do crowdfunding:
1. [Criar uma trustline](../concepts/list-of-operations.md#change-trust) com a conta de armazenamento para tokens de participação
	- A trustline cria confiança entre o contribuidor e a conta de armazenamento, tornando válidas as transações que envolverem tokens de participação
2. [Criar uma oferta](../concepts/list-of-operations.md#manage-offer) para comprar tokens de participação
	- A conta do contribuidor receberá tokens de participação e a conta de armazenamento receberá o valor
3. Se o crowdfunding:
	- tiver sucesso - não fazer nada
	- falhar - criar uma oferta para vender tokens de participação, permitindo que o contribuidor recupere o valor investido

## Boas Práticas para SSC
Quando se trata do design de um smart contract, as partes devem se reunir e combinar claramente o propósito do contrato, a cooperação entre as partes, e os resultados desejados. Neste combinado, deve-se acordar sobre condições claras e suas consequências. Após estabelecer as condições e suas consequências, o contrato pode então ser traduzido em uma série de operações e transações. Lembramos que smart contracts são criados usando código. Código de programação pode conter bugs ou pode não se comportar como planejado. Certifique-se de analisar e concordar com todos os edge cases possíveis quando formular as condições e consequências do smart contract.

## Recursos

- [Jurimetrics - The Next Steps Forward](http://heinonline.org/HOL/LandingPage?handle=hein.journals/mnlr33&div=28&id=&page) - Lee Loevinger
- [Formalizing and Securing Relationships on Public Networks](http://firstmonday.org/article/view/548/469) - Nick Szabo
- [Smart Contracts: 12 Use Cases for Business and Beyond](https://bloq.com/assets/smart-contracts-white-paper.pdf) - Chamber of Digital Commerce
- [Conceito: Transações](https://www.stellar.org/developers/guides/concepts/transactions.html) - Stellar<span>.org
- [Conceito: Multisignature](https://www.stellar.org/developers/guides/concepts/multi-sig.html) - Stellar<span>.org
- [Conceito: Time Bounds](https://www.stellar.org/developers/guides/concepts/transactions.html#time-bounds) - Stellar<span>.org
- [Conceito: Trustlines](https://www.stellar.org/developers/guides/concepts/assets.html#trustlines) - Stellar<span>.org
