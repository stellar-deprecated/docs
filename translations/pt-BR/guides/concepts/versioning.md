---
title: Versionamento e Upgrades
---


Este documento descreve os vários mecanismos usados para manter o sistema como um todo funcionando enquanto evolui.

# Versionamento do ledger
## ledgerVersion
Este uint32 armazenado no ledger header descreve o número da versão do protocolo geral.
Protocolo, neste caso, é definido tanto como "wire format" – como as formas serializadas de todos os objetos armazenados no ledger – e seu comportamento.

Esse número da versão é incrementado a cada vez que o protocolo muda.

### Integração com consenso
Na maioria das vezes, o consenso é simplesmente alcançado em relação a que conjunto de transações deve ser aplicado ao ledger anterior.

Porém, pode-se também obter consenso em relação aos passos de um upgrade.

Um tal passo é "faça update no ledgerVersion para o valor X após o ledger N".

Se os nós não considerarem que o passo do upgrade é válido, eles simplesmente abandonam o passo de upgrade em sua votação.

Um nó pode considerar um passo inválido ou porque não o entendeu, ou porque alguma condição não foi cumprida. No exemplo anterior, pode ser que X não seja suportado pelo nó ou que o número do ledger ainda não chegou a N.

Passos de upgrade são aplicados antes de aplicar o conjunto de transações para garantir que a lógica que organiza os passos é mesma que os processa. Senão, os passos teriam que ser aplicados após o fechamento do ledger.

### Versões suportadas
Cada nó tem sua própria maneira de acompanhar que versão ele suporta – por exemplo, uma "versão min", "versão max" – mas também pode incluir coisas como "versões na lista negra". Versões suportadas não são monitoradas internamente no protocolo.

Note que minProtocolVersion é diferente da versão que uma instância entende:
tipicamente, uma implementação entende versões n … maxProtocolVersion, onde n <= minProtocolVersion.
O motivo disso é que nós devem ser capazes de rever transações do histórico (até a versão 'n'), mas pode haver algum problema/vulnerabilidade que não queremos que seja abusada para novas transações.

## Versionamento de objetos do ledger

Estruturas de dados que têm probabilidade de evoluir ao longo do tempo contêm o seguinte ponto de extensão:
```C++
union switch(int v)
{
case 0:
    void;
} ext;
```

Neste caso, a versão 'v' se refere à versão do objeto e permite a adição de novos braços.

Esse esquema oferece diversos benefícios:
* Implementações tornam-se wire compatible sem mudanças no código, apenas atualizando seus arquivos de definição de protocolo.
* Mesmo sem atualizar os arquivos de definição de protocolo, implementações mais antigas continuam funcionando, contanto que não encontrem formatos mais novos.
* Promove compartilhamento de código entre versões dos objetos.

Note que, enquanto que esse esquema promove compartilhamento de código para componentes que consomem esses objetos, o compartilhamento de código não é necessariamente promovido para o próprio stellar-core porque o comportamento precisa ser preservado para todas as versões: para reconstruir a cadeia de ledgers a partir de períodos de tempo arbitrários, o comportamento deve ser 100% compatível.

## Versionamento de operações

Operações são versionadas como um todo: se um novo parâmetro precisa ser adicionado ou alterado, o versionamento ocorre por meio da adição de uma nova operação.
Isso causa um pouco de duplicação da lógica nos clientes, mas evita introduzir bugs em potencial. Por exemplo, o código que for assinar somente certos tipos de transações deve estar inteiramente consciente do que está sendo assinado.

## Versionamento de envelope

Padrão usado para permitir extensibilidade de envelopes (conteúdo assinado):
```C++
union TransactionEnvelope switch (int v)
{
case 0:
    struct
    {
        Transaction tx;
        DecoratedSignature signatures<20>;
    } v0;
};
```

Esse padrão permite a capacidade de modificar o envelope se necessário e certifica que clientes não consumam cegamente conteúdo que não puderam validar.

## Upgrade em objetos que não têm um ponto de extensão

Os esquemas do objeto devem ser clonados e seu objeto pai deve ser atualizado para usar o novo tipo de objeto. Aqui, supõe-se que não haja nenhum objeto "root" desversionado.

## Considerações sobre o tempo de vida de implementações suportadas

Para manter a base de código em um estado sustentável, implementações podem não preservar a habilidade de rever tudo a partir do gênesis. Ao invés disso, podem optar por suportar um alcance limitado – por exemplo, preservar apenas a capacidade de rever os 3 meses anteriores de transações (supondo que o minProtocolVersion da rede seja mais recente do que isso).

Isso não muda a habilidade do nó de se (re)juntar ou participar na rede; somente afeta a habilidade do nó realizar uma validação histórica.

# Versionamento overlay

Overlay segue um padrão similar para versionamento: possui um min-maxOverlayVersion.

A política de versionamento na camada de overlay é bem mais agressiva quanto à rotina de descontinuação; o conjunto de nós envolvidos é limitado àqueles que se conectam diretamente à instância.

Com isso em mente, estruturas seguem o modelo "clone" nesta camada:
se uma mensagem precisa ser modificada, uma nova mensagem é definida por meio da clonagem do tipo da mensagem antiga usando um novo identificador de tipo.

Sabendo que a implementação antiga será deletada de qualquer maneira, o modelo clone torna impossível refatorar grandes partes do código e evita a dor de cabeça de se manter versões antigas.

Nesta camada, é aceitável modificar o comportamento de versões antigas, contanto que permaneçam compatíveis.

A implementação pode decidir compartilhar o código subjacente – por exemplo, convertendo mensagens legacy ao novo formato internamente.

A mensagem "HELLO" trocada quando pares se conectam um com o outro contém a versão min e max suportada pela instância. O outro endpoint pode decidir desconectar imediatamente caso não seja compatível.
