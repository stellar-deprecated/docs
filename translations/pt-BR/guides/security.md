---
title: Segurança
---

Com Stellar, você irá trocar ativos que são muito valiosos, então segurança é importante. As orientações a seguir podem ajudá-lo a manter sua integração Stellar segura.


## Segurança embutida

Stellar usa ferramentas e técnicas de criptografia que são padrão de indústria, o que significa que o código é bem testado e compreendido. Todas as transações na rede são públicas, o que quer dizer que a movimentação dos fundos pode sempre ser auditada. Cada transação é assinada por quem quer que a tenha enviado usando o [algoritmo Ed25519](https://ed25519.cr.yp.to), o que prova criptograficamente que o remetente tinha autorização para fazer a transação.

Embora todas as transações sejam públicas, bancos que usem Stellar para trocar fundos em nome de correntistas individuais podem manter privadas as informações sobre os remetentes e destinatários armazenando identificadores encriptados ou únicos no campo memo da transação. Isso permite que bancos cumpram com exigências regulatórias de compliance e deixem o histórico de transações verificável enquanto mantêm seguras informações privilegiadas.


## Contas offline seguras

Um dos métodos mais simples de prover segurança a uma conta é manter sua seed secreta guardada em um ambiente offline — pode ser em um computador sem conexão à internet ou apenas um pedaço de papel na carteira de alguém. Transações podem ser criadas e assinadas em um computador offline, e depois salvas em um drive USB (ou outro meio de armazenamento) e transferidas para um computador com acesso à internet, que envia as transações a um servidor Horizon ou uma instância do Stellar Core. Se preferir gravar a seed no papel em vez de um computador, use um programa que não salva a seed para criar e assinar a transação.

Como um computador offline não tem conexão, é extremamente difícil que alguém sem acesso físico a ele consiga acessar as chaves da conta. No entanto, isso também torna faz de todas as transações um processo extremamente manual. Uma prática comum em vez disso é manter duas contas: uma conta offline que guarda seguramente a maioria dos seus ativos e outra conta online que detém apenas alguns ativos. A maioria das transações pode ser realizada com a conta online e, quando seus fundos estiverem baixos, alguém pode reabastecê-la manualmente a partir da conta offline.

Pode-se pensar neste método como ter um cofre de banco e uma caixa registradora. Na maior parte do tempo, o cofre ficará trancado, só sendo aberto ocasionalmente (e sob procedimentos específicos) para reabastecer a gaveta do caixa quando ela estiver com poucos fundos, ou para guardar fundos excessivos quando o caixa estiver lotado. Se alguém tentar roubar o banco, é extremamente difícil que se perca algo além do que estava no caixa.


## Exigir mais de uma autorização ou signatários

Contas sensíveis podem ser protegidas exigindo autorização de mais de um indivíduo para fazer uma transação. Leia o [guia multisignature](concepts/multi-sig.md) para saber melhor como fazê-lo.

Se forem exigidos mais de um signatário, é bom também ter certeza de não exigir que todos os signatários possíveis assinem a transação. Se um dos signatários perder as chaves de sua conta, você perderá a capacidade de realizar transações se sua assinatura for necessária.


## Garantir que os ativos sejam revogáveis

Ao emitir seus próprios ativos, recomenda-se ter certeza de que eles podem ser revogados usando a [flag “authorization revocable” na conta](concepts/accounts.md#flags). Isso permite que você congele seus ativos que estejam na conta de outra pessoa em caso de roubo ou outras circunstâncias desse tipo.


## Realizar verificações de compliance

O protocolo que está no núcleo do Stellar está limitado a um meio simples e verificável de se trocar ativos. Se você é uma instituição financeira ou estiver fazendo grandes transações, você deveria também realizar procedimentos <abbr title="Know Your Customer">KYC</abbr> e outras verificações regulatórias de compliance relacionadas. Você pode encontrar mais informações no nosso [guia do protocolo compliance](compliance-protocol.md) ou usar o [Servidor Stellar Bridge](https://github.com/stellar/bridge-server) para simplificar o processo.


## E se as chaves de uma conta forem comprometidas?

Como a segurança do Stellar é baseada em encriptação de chaves públicas, é crucial que a seed secreta de uma conta não seja compartilhada. Qualquer pessoa que tiver acesso à seed efetivamente tem controle sobre a conta. Porém, se alguém descobrir a seed de sua conta ou você compartilhá-la por acidente com alguém que não deveria sabê-la, você pode remover a habilidade dessa seed de controlar a conta com os seguintes passos:

1. Faça um novo par de chaves.
2. Adicione a nova chave pública como um signatário da conta comprometida. (Use a [operação `set options`](concepts/list-of-operations.md#set-options)).
3. Remova a autoridade de assinatura da chave comprometida.
4. Agora a nova chave pública controla a conta e as chaves comprometidas não são mais capazes de assinar transações.
5. Notifique os donos de outras contas que a nova chave tem autoridade sobre a a chave que foi comprometida. Eles precisarão seguir os passos 2 e 3 para suas contas também.

É importante compreender que contas que permitem mais de uma assinatura precisam ser capazes de remover uma chave comprometida. Sempre tenha o cuidado de definir diferentes pesos nas chaves de modo que isso seja possível — nunca exija que *todos* os signatários sejam envolvidos em uma transação.


## E se houver um bug no código do Stellar?

Todo nó mantém um arquivo histórico, então sempre há um registro forte e confiável do que aconteceu. Usuários afetados por um bug podem examinar todos os detalhes históricos e concordar em um método de atenuação até o bug ser consertado.


## Proteger uma Instância do Stellar Core

Geralmente é uma boa ideia assegurar que o acesso ao Stellar Core seja extremamente limitado. Certifique-se que os únicos ports abertos são aqueles necessários para se comunicar com o Horizon e outras instâncias do Stellar Core na rede pública. O acesso às bases de dado do Stellar Core também deve ser altamente restrito.


## Fique em Dia com os Patches de Segurança

Certifique-se de estar usando os softwares mais seguros disponíveis ficando em dia com as últimas versões. Stellar.org publica anúncios de novos releases em uma mailing list que você pode se inscrever em https://www.freelists.org/list/sdf-releases.
