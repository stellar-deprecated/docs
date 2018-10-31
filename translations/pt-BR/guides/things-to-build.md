---
title: Construir Aplicações com Stellar
---

Construa coisas bacanas no Stellar! Esta lista esboça algumas ideias para aplicações. Sinta-se à vontade para adicionar a suas próprias ideias ou pegar uma daqui e mandar ver.
Como sempre, se precisar de ajuda para construir algo com Stellar, é só perguntar no [chat do Slack](http://slack.stellar.org/), [IRC](https://kiwiirc.com/client/irc.freenode.net/#stellar-dev), ou no e-mail developers@stellar.org.

Se você não está buscando um projeto mais completo mas ainda quer dar uma ajuda, procure por issues com o rótulo `help wanted` em qualquer um de nossos [repositórios](https://github.com/stellar).

# Slack Bot
- Reportar um stream de todas as transações Stellar em um canal.
- *Avançado*: Permitir que pessoas enviem dinheiro/ponto/"+1"s a outro membros da equipe no Slack, ao estilo de `/send @zezinho $5`.

# API Mashups
- Twilio com Stellar: alertas SMS para transações (veja um exemplo [aqui](https://github.com/stellar/stellar-sms-client))
- Twitter com Stellar: envie dinheiro com tweets ou alertas do Twitter
- Reddit com Stellar: Tipbot! (um bot que dá gorjetas por upvotes)
- Muitas outras possibilidades

# Gráfico de dados do Horizon
Um projeto relativamente simples que exibe graficamente informações retiradas do Horizon e que poderia consultar contas e transações. Seria também legal ver:
 - Árvore de criação de contas. Todas as contas são criadas por outras contas, então seria possível mostrar essa árvore genealógica.
 - Gráfico das informações do ledger header ao longo do tempo:
   - Número de transações
   - Número de operações
   - Horas de fechamento do ledger
   - Pool de tarifas

# Serviço Federation
Implementar um [servidor Federation ](https://www.stellar.org/developers/guides/concepts/federation.html) simples e configurar uma página web onde qualquer pessoa possa pegar um endereço Stellar do tipo nome*seudomínio.com e associar o ID de sua conta Stellar a esse endereço. O truque é que esse serviço apenas irá federar para contas que definirem seu [destino de inflação](https://www.stellar.org/developers/guides/concepts/inflation.html) como uma conta fornecida pelo seu domínio.

Você também pode contribuir ao [servidor federation ](https://github.com/stellar/go/tree/master/services/federation) mantido pela Stellar Development Foundation.

# Lumens para qualquer endereço de e-mail
Permitir que qualquer pessoa envie lumens de seu cliente Stellar para qualquer endereço de e-mail. A ideia é simplesmente inserir algo como `<endereçodeemail>*dominio.com` e já dar para enviar lumens ao endereço. Se o recipiente ainda não tiver uma conta Stellar, será criada uma para ele e ele receberá um e-mail avisando que possui lumens.

Isso seria um serviço hospedado em `dominio.com` que faz o seguinte:
- Roda um servidor federation.
- Irá federar endereços de pagamento com um prefixo de e-mail como `jed@stellar.org*dominio.com`.
- Se houver uma request de federation para um endereço que você não conheça que comece com um e-mail válido:
  - Gera um par de chaves
  - Retorna a chave pública gerada como o accountID
  - Vigiar a rede para ver se a conta foi criada.
  - Se a conta tiver sido criada, você envia um e-mail para o endereço de e-mail dado com a chave privada e links a um cliente Stellar.

*Avançado*: permitir que pessoas gerenciem a conta Stellar que você acabou de criar por meio de e-mails enviados a control@domínio.com. Isso torna do inbox de alguém um cliente Stellar. Por exemplo: `enviar 100 XLM a zezinho@gmail.com`

[Adicionar isso a uma wallet](https://galactictalk.org/d/37-project-idea-sending-lumens-to-any-address)

# Exchange Distribuída
Descrição e discussão [aqui.](https://galactictalk.org/d/26-project-idea-distributed-exchange)


# Paywall para Recursos
Digamos que você tem um serviço disponível ao público, talvez para streaming ou wi-fi aberto. Você pode permitir que outras pessoas usem esse serviço sob a condição de te pagar pequenas quantias. Esses pagamentos poderiam ser usados para prevenir spam ou para dar suporte ao seu negócio. Esse um trabalho para o **toll collector**...

## Toll Collector
Um serviço simples que monitora qualquer XLM enviado a um `endereço de pedágios`, ou toll address. O toll collector tem uma base de dados de chaves públicas e quantidades de XLM enviadas ao toll address. Ele escuta pagamentos ao toll address na rede Stellar e os adiciona a essa base de dados.

O serviço de toll collector tem um RPC ou endpoint que pode ser chamado:

  - `charge(publicKey, qtde. de XLM)` retorna
    - `qtde. de XLM cobrada`
    - `qtde. de XLM que resta nesta chave`

Sua aplicação pode publicar seu toll address do Stellar para pagamentos. Quando alguém tenta usar seu serviço, o servidor os faz autenticar sua chave pública e chama `charge` no Toll Collector para decrementar o saldo do consumidor na base de dados. Você pode enviar uma mensagem ao consumidor quando seu saldo for zero.

# Coordenador Multisig
Uma aplicação web que facilita a criação de transações multisig. Tipicamente, é preciso coordenar entre várias partes para gerar uma transação para uma conta protegida por multisig. Este site tornaria esse processo muito mais fácil e o permitiria coordenar em casos que você não conhece a outra parte.

Idealmente, o coordenador multisig incluiria os seguintes recursos:
- Associar um endereço de e-mail à sua chave pública
- Criar uma tx que você gostaria que fosse assinada por várias partes
- Inserir as chaves públicas que você gostaria que assinassem a tx
- Se alguma dessas chaves tiver associado previamente seu endereço de e-mail, será enviada uma mensagem
- Ao entrar no site, será exibida uma lista de todas as transações pendentes:
  - Pode-se ver os detalhes de cada transação
  - Pode-se ver quem iniciou a transação
  - Pode-se ver quem mais assinou a transação
  - Pode-se assinar qualquer transação que esteja aguardando a sua assinatura
- Quando uma transação pendente for assinada por pessoas suficientes, a transação é submetida à rede
- Quando a transação for submetida, todos os signatários são notificados

# Feed de Mercado
Feed de dados para a exchange distribuída dentro do Stellar. Algo equivalente à [API da Poloniex](https://poloniex.com/public?command=returnTicker).
Isso será útil para aplicações como [stellarTerm](http://stellarterm.com), assim como para adicionar o volume comercial do Stellar a sites como [CoinMarketCap](http://coinmarketcap.com).

# Monitor de Quorums
Uma página web que mostra o estado da rede de quorums em um gráfico. Idealmente, o monitor de quorums mostra:
- Um gráfico ao vivo de como a rede está conectada
- Que servidores estão tendo problemas
- Quaisquer servidores que discordem do resto da rede
- Talvez um histórico do uptime de cada validador

 Deveria ser possível ver o gráfico de quorums do ponto de vista de qualquer validador. Você provavelmente teria que rodar o stellar-core. Pode-se pegar os dados dos logs do stellar-core e do comando /quorum.

*Avançado*: Construir um servidor que se conecta ao stellar-core e monitora as mensagens externalizadas e os vários broadcasts dos validadores.

# Bibliotecas
Crie uma biblioteca em sua linguagem favorita:
- C#
- PHP
- Haskell
- Outras linguagens

Ou contribua a nossos SDKs já existentes:
- [JavaScript](https://github.com/stellar/js-stellar-sdk)
- [Go](https://github.com/stellar/go)
- [Java](https://github.com/stellar/java-stellar-sdk)
- [Python](https://github.com/StellarCN/py-stellar-base/)

# Ideias que ouvimos para produtos e serviços
- Conta de microeconomias para escola, saúde, seguros
- Microsseguros
- Empréstimos P2P
- Transferências de dinheiro condicionais
- Sistemas de doação para organizações de fins não lucrativos
- Programas de pontos de fidelidade
- Moedas para comunidades
- Bancos de tempo
- Monitoramento de horas voluntárias
- Caixa eletrônico em qualquer lugar ou aplicativos mobile de caixas eletrônicos

# Facilitador de Atomic Swaps Cross-chain
- Software para usuários finais que facilita atomic swaps cross-chain com
várias outras criptomoedas (entre tanto Lumens como outras
  moedas Stellar).
- Um serviço de rendezvous que estabelece um marketplace para swaps cross-chain.
