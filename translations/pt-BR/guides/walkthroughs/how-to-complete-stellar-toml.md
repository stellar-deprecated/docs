---
title: Como e por que Completar seu Stellar.toml
---

Como e por que Completar seu Stellar.toml
=========================================

>*Se tiver interesse em emitir um token na rede Stellar mas ainda não tiver feito isso, comece consultando as instruções passo a passo para criar um ativo personalizado *[*aqui*](./custom-assets.md)*.*

Olá! Criamos este guia curto para ajudar você, um emissor de tokens, a colocar seu token no melhor lugar possível para ter sucesso no Stellar.

Sobretudo, queremos garantir que você saiba como **fornecer informações à rede** sobre si mesmo e seu token, para que potenciais compradores e apps como exchanges e wallets confiem em seu ativo. O modo de providenciar essas informações é completando seu arquivo **stellar.toml**.

Os melhores tokens no Stellar já seguem as orientações abaixo, e *apps e compradores esperarão o mesmo do seu token*.

Por que completar seu arquivo stellar.toml
----------------------------------------------

Os emissores de tokens mais bem-sucedidos dão a exchanges e potenciais compradores um monte de informações sobre si mesmos. No Stellar, isso é feito no arquivo **stellar.toml**. Mais informações no stellar.toml de seu token fará que:

* seu token seja listado em *mais* exchanges

* os detentores de seu token tenham *mais* confiança

* muito provavelmente, seu projeto tenha *mais* sucesso

Por exemplo, a aplicação [StellarX](http://stellarx.com/) usa o arquivo stellar.toml para decidir como seu token é apresentado a traders em sua visão de mercados. Se você não fornecer informações o suficiente, seu token pode não aparecer para vários traders. Outras exchanges de Stellar como stellarport.io e stellarterm.com tomam decisões semelhantes.

*Muitas nem chegarão a listar seu token sem um stellar.toml robusto.*

O arquivo stellar.toml é *tão* importante que a primeira Proposta do Ecossistema Stellar (Stellar Ecosystem Proposal) é devotada a descrever o que ele deveria conter. Você pode encontrar a SEP 0001 completa [aqui](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md), mas vamos resumir abaixo as partes importantes.

O que é o seu stellar.toml?
--------------------------

Seu stellar.toml é um arquivo escrito em [TOML](https://github.com/toml-lang/toml), que é um formato simples para arquivos de configuração, e publicado em https://SEU_DOMINIO/.well-known/stellar.toml. Qualquer pessoa pode consultá-lo, e ele *prova* que o dono do domínio https que hospeda o stellar.toml se *responsabiliza* pelas contas e tokens listados no arquivo. Então é a sua chance de legitimizar sua oferta e anunciar informações vitais sobre sua organização e seu token. **Se você oferecer mais de um token, é possível listar todos eles em um único arquivo stellar.toml.**

Como completar seu stellar.toml
---------------------------------

A [SEP 0001](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md) especifica cinco seções que você pode adicionar ao seu stellar.toml: Account Information, Issuer Documentation, Point of Contact Documentation, Currency Documentation, e Validator Information. Dentro dessas seções, alguns campos só se aplicam a tokens especializados, mas muitos se aplicam a *todos* os tokens, e estas orientações irão indicar quais campos são:

* **Required**: exigidos. Todos os emissores de tokens *devem* incluir essa informação em seu stellar.toml se quiserem ser listados em exchanges.

* **Suggested**: sugeridos. Recomenda-se a emissores de tokens que quiserem que sua oferta ganhe destaque que completem esses campos.

### ACCOUNT INFORMATION

Informações da conta. Há um campo na seção Account Information que é exigido a *todos* os emissores de tokens:

* `ACCOUNTS`: Uma lista de **chaves públicas** de todas as contas Stellar associadas ao seu token.

Listar suas chaves públicas permite que usuários confirmem que você de fato as possui. Por exemplo, quando o https://google.com hospeda um arquivo stellar.toml, os usuários podem ter certeza de que *somente* as contas listadas lá pertencem ao Google. Assim, se vier alguém dizendo que "Você precisa pagar sua conta do Google deste mês! Envie seu pagamento ao endereço GEUSOUOGOOGLEDEVERDADEMESMO", mas aquela chave não estiver listada no stellar.toml do Google, os usuários sabem que não devem confiar nela.

Em maior parte, as outras informações especificadas na seção Account Information é somente necessária para validadores e instituições financeiras.

Aqui está um exemplo de um campo `ACCOUNTS` completo que lista três chaves públicas:

	ACCOUNTS=[
	"GAOO3LWBC4XF6VWRP5ESJ6IBHAISVJMSBTALHOQM2EZG7Q477UWA6L7U",
	"GAENZLGHJGJRCMX5VCHOLHQXU3EMCU5XWDNU4BGGJFNLI2EL354IVBK7",
	"GB6REF5GOGGSEHZ3L2YK6K4T4KX3YDMWHDCPMV7MZJDLHBDNZXEPRBGM"
	]

### ISSUER DOCUMENTATION

Documentação sobre o emissor. Informações básicas sobre a sua organização entram em uma **tabela** TOML chamada `[DOCUMENTATION]`. A Issuer Documentation é a sua oportunidade para informar exchanges e compradores sobre o seu negócio e demonstrar que o seu negócio é legítimo e confiável.

Quanto mais você preencher, será mais provável que pessoas acreditem na sua oferta.  

**Required:** Todos os emissores devem incluir as seguintes informações:

* O nome jurídico de sua organização (`org_name`) e, se seu negócio possuir um, seu DBA oficial (`org_dba`).

* A URL do site oficial da sua organização (`org_url`). Para provar que o site é seu, *você deve hospedar seu stellar.toml no mesmo domínio listado aqui*. Assim, exchanges e compradores podem ver o certificado SSL no seu site, e se sentirem razoavelmente seguros que você quem está dizendo que é.

* Uma URL a um logo da organização (`org_logo`), que irá ser exibido próximo ao nome da sua organização em exchanges. Se você deixar de fornecer um logo, o ícone próximo a sua organização irá aparecer em branco em muitas exchanges.

* O endereço físico de sua organização (`org_physical_address`). Entendemos que você possa preferir manter privado o seu endereço de trabalho. Recomenda-se pelo menos inserir a *cidade* e *país* no qual você opera. Incluir também a rua seria ideal e daria um alto nível de confiança e transparência a seus potenciais usuários.

* O número de telefone oficial da sua organização (`org_phone_number`).

* O nome de usuário oficial da sua organização no Twitter (`org_twitter`).

* O melhor endereço de e-mail para contato da sua organização (`org_official_email`). Ele deve ser hospedado no mesmo domínio que o seu site oficial.

**Suggested:** Incluir essas informações irá ajudar sua oferta a se destacar:

* A conta oficial da sua organização no Github (`org_github`).

* A conta oficial da sua organização no Keybase (`org_keybase`). Sua conta no Keybase deve conter uma prova da posse de qualquer conta pública online listada aqui, incluindo o domínio de sua organização.

* Uma descrição da sua organização (`org_description`). Este conteúdo é bem aberto, e você pode escrever o quanto quiser. É um grande lugar para se distinguir descrevendo o que você faz.

Exchanges podem desejar informações verificáveis adicionais ao decidir como apresentar seu token a traders, e priorizar tokens que as incluírem:

* Comprovante do endereço físico listado acima (`org_physical_address_attestation`). É uma URL de uma imagem, hospedada no domínio de sua organização, de um documento oficial feito por um terceiro (como uma conta de luz) que mostra o nome e endereço da sua organização.

* Comprovante do número de telefone listado acima (`org_phone_number_attestation`). É uma URL de uma imagem, hospedada no domínio de sua organização, mostrando uma conta de telefone que lista ambos o número de telefone e nome da sua organização.

Veja um exemplo de uma Issuer Documentation completa:

    [DOCUMENTATION]
    ORG_NAME="Nome da Organização"
    ORG_DBA="DBA da Organização"
    ORG_URL="https://www.dominio.com"
    ORG_LOGO="https://www.dominio.com/logoincrivel.jpg"
    ORG_DESCRIPTION="Descrição do emissor"
    ORG_PHYSICAL_ADDRESS="123 Sesame St., New York, NY, 12345"
    ORG_PHYSICAL_ADDRESS_ATTESTATION="https://www.dominio.com/address_attestation.jpg"
    ORG_PHONE_NUMBER="1 (123)-456-7890"
    ORG_PHONE_NUMBER_ATTESTATION="https://www.dominio.com/phone_attestation.jpg"
    ORG_KEYBASE="accountname"
    ORG_TWITTER="orgtweet"
    ORG_GITHUB="orgcode"
    ORG_OFFICIAL_EMAIL="support@dominio.com"

### POINT OF CONTACT DOCUMENTATION

Documentação sobre o ponto de contato. Informações sobre o ponto de contato principal da sua organização entram numa **lista** TOML chamada `[[PRINCIPALS]]`. É preciso inserir informações de contato para *pelo menos uma pessoa* da sua organização. Senão, exchanges não podem verificar sua oferta, e não é provável que os compradores se interessem.

**Required**: Todos os emissores de token devem incluir as seguintes informações sobre o seu ponto de contato:

* O nome do contato principal (`name`).

* O endereço de e-mail oficial do contato principal (`email`). Deve estar hospedado no mesmo domínio que o site oficial da organização.

* O nome de usuário pessoal do contato no Twitter (`twitter`).

**Suggested:** Se o ponto de contato da sua organização tem as contas abaixo, sugerimos também incluir:

* A conta pessoal do contato no Github (`github`).

* A conta pessoal do contato no Keybase (`keybase`). Esta conta deve incluir prova de posse do endereço de e-mail listado acima.

Igualmente, quanto mais informações fornecidas, melhor. Exchanges podem desejar informações verificáveis adicionais ao decidir apresentar seu token a traders, e priorizar tokens que as incluírem:

* Um hash SHA-256 de uma foto de um documento de identidade oficial com foto do contato (`id_photo_hash`).

* Um hash SHA-256 de uma foto de verificação do ponto de contato segurando uma mensagem assinada, datada e escrita à mão, detalhada na SEP 0001 (`verification_photo_hash`).

Os hashes das fotos permitem que exchanges e wallets confirmem a identidade do seu contato. Esses serviços podem entrar em contato de maneira privada para pedir fotos de ID e verificação, e bater essas fotos com os hashes listados aqui para confirmar sua veracidade. Se os hashes forem confirmados, eles vão divulgar a seus clientes que suas informações de contato foram verificadas.

Aqui está um exemplo de um Point of Contact Documentation completo para uma pessoa:

    [[PRINCIPALS]]
    name="Jane Jedidiah Johnson"
    email="jane@dominio.com"
    twitter="@crypto_jane"
    keybase="crypto_jane"
    github="crypto_jane"
    id_photo_hash="5g249e170f4f134b18ab3de069c5a13e5c3ef3ef90f3643afa15a1603c34cf38"
    verification_photo_hash="693687f6abd594366a09cfe6b380e58f9023867a851cc9fa71f302ab4889e48"


### TOKEN DOCUMENTATION

Documentação sobre o Token. Informações sobre o seu token entram em uma **lista** TOML chamada `[[CURRENCIES]]`. Se você estiver emitindo mais de um token, você pode incluir todos eles em um só stellar.toml. Cada token deve ter sua própria lista `[[CURRENCIES]]`.

**Required**: Todos os emissores devem fornecer as seguintes informações sobre cada token emitido:

* O código do ativo (`code`). Esta é uma das duas informações que identificam o seu token. Sem ele, seu token não pode ser listado em nenhum lugar.

* A chave pública Stellar da conta emissora (`issuer`). Esta é a segunda informação chave que identifica o seu token. Sem ela, seu token não pode ser listado em nenhum lugar.

* O status do seu token (`status`): *live*, *dead*, ou *test*. Marcar seu token como *live* significa que você está pronto para que exchanges o incluam em listagens. Se o seu token estiver pronto para comercialização e você deixar de listar seu status, ele pode não aparecer em exchanges.

* Uma preferência pelo número de casas decimais quando o cliente exibir o saldo da conta (`display_decimals`).

* Um nome curto do token (`name`). Se você deixar de nomear o seu token, exchanges podem acabar não o exibindo adequamente.

Você também precisa descrever sua **política de emissão do token**, preenchendo exatamente *um* dos seguintes campos mutuamente exclusivos:

* `fixed_number`, que você deve especificar se estiver emitindo um número fixo de tokens que nunca irá aumentar.

* `max_number`, que você deve especificar se estiver um limite máximo para o número de tokens a ser emitido.

* `is_unlimited`, que você deve especificar se você se reserva o direito de criar mais tokens ao seu critério.

**Suggested:** Se você quiser que seu token se destaque, recomenda-se incluir também o seguinte:

* Uma descrição do seu token e o que ele representa (`desc`). Este é um bom lugar para esclarecer o que o seu token faz, e por que alguém poderia se interessar por comprá-lo.

* Quaisquer condições que você puser para o resgate de seu token (`conditions`).

* Uma URL de uma imagem que representa o token representing token (`image`).  Sem ela, seu token aparecerá em branco em muitas exchanges.

Veja um exemplo de uma Currency Documentation completa:

	[[CURRENCIES]]
    code="BODE"
    issuer="GD5T6IPRNCKFOHQWT264YPKOZAWUMMZOLZBJ6BNQMUGPWGRLBK3U7ZNP"
    status=”live”
    display_decimals=2
    name="títulos BODE"
    desc="1 token BODE dá direito a uma porcentagem dos rendimentos da Fazenda de Bodes Elkins."
    conditions="Só haverá 10,000 tokens BODE em existência. Distribuiremos a porcentagem dos rendimentos anualmente em 15 de Janeiro"
    image="https://pbs.twimg.com/profile_images/666921221410439168/iriHah4f.jpg"
    fixed_number=10000

### ANCHORED OR ASSET-BACKED TOKEN REQUIREMENTS:

Requisitos para tokens ancorados ou garantidos por ativos. Tokens ancorados são ativos especializados no ecossistema Stellar porque podem ser resgatados fora da rede na forma de outros ativos. Se você está emitindo um token ancorado, você precisa fornecer informações adicionais sobre esses ativos, e sobre como resgatar seu token recebendo esses ativos em troca.

Além da Currency Documentation listada acima, são **exigidos** os campos a seguir para tokens ancorados:

* O tipo do ativo que o seu token representa (`anchor_asset_type`). As categorias possíveis são *fiat*, *crypto*, *stock*, *bond*, *commodity*, *realestate*, e *other*.

* O nome do ativo que serve como âncora para o seu token (`anchor_asset`).

* Instruções para resgatar seu token e receber o ativo subjacente (`redemption_instructions`).

Por causa da natureza de ativos ancorados a crypto, exchanges podem não listá-los sem as seguintes informações **verificáveis**:

* Os endereços públicos que detêm os ativos crypto (`collateral_addresses`).

* Prova de que você controla esses endereços públicos (`collateral_address_signatures`). A [SEP 0001](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md) contém um modelo para essas assinaturas, e instruções para adaptá-las ao seu token.

Exchanges usam as assinaturas dos endereços colaterais para verificar que as contas listadas pertencem a você, e irão olhar a reserva nessas contas. Se você não puder provar 100% da reserva, é improvável que elas listem seu token.

	[[CURRENCIES]]
	code="BTC"
	issuer="GAOO3LWBC4XF6VWRP5ESJ6IBHAISVJMSBTALHOQM2EZG7Q477UWA6L7U"
	status=”live”
	display_decimals=7
	name=”Bitcoin”
	desc=”A organização promete comprar cada token BTC de qualquer detentor por um valor de 1 Bitcoin”
	conditions="Aplicam-se taxas de saque"
	image="https://domain.com/img/Bitcoin-100x100.png"
	anchor_asset_type="crypto"
	anchor_asset="BTC"
	redemption_instructions="Usar SEP6 com nosso servidor federation"
	collateral_addresses=["2C1mCx3ukix1KfegAY5zgQJV7sanAciZpv"]
	collateral_address_signatures=["304502206e21798a42fae0e854281abd38bacd1aeed3ee3738d9e1446618c4571d10"]

Como publicar  How to publish your stellar.toml
--------------------------------
After you've followed the steps above to complete your stellar.toml, post it at the following location:

* https://YOUR_DOMAIN/.well-known/stellar.toml

Enable [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) so people can access this file from other sites, and set the following header for an HTTP response for a /.well-known/stellar.toml file request.

* Access-Control-Allow-Origin: *

Once you've done that, you're all set!  Now apps and buyers can access all the information you've provided with a simple HTTP request.

### An example of a good stellar.toml: Stronghold

If you want to see a stellar.toml done right, take a look at Stronghold’s [here](https://stronghold.co/.well-known/stellar.toml).  You can easily find out everything you need to know about the company, their Stellar accounts, their points of contact, and their tokens, and you can take steps to verify that information.    

If your stellar.toml looks like Stronghold’s, exchanges and buyers will take notice.  

Nota: para efeitos informativos, esta tradução optou em traduzir parte do conteúdo dos exemplos de preenchimento do stellar.toml, mas os documentos reais devem estar escritos em inglês para facilitar a compreensão por todo o ecossistema Stellar.

*****
