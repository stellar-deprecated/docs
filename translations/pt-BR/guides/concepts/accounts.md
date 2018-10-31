---
title: Contas
---

Contas são a estrutura de dados central no Stellar. Contas são identificadas por uma chave pública e salvas no ledger.
Todo o resto que está dentro do ledger, como ofertas ou [trustlines](./assets.md#trustlines), são detidos por alguma conta específica.

Contas são criadas com a operação [Create Account](./list-of-operations.md#create-account).

O acesso às contas é controlado por criptografia de chave pública/privada. Para uma conta realizar uma transação – ex.: realizar um
pagamento – a transação deve ser assinada pela chave privada que corresponde à chave pública daquela conta. Também é possível
preparar esquemas [multi-sig](./multi-sig.md) (multiassinaturas) mais complexos para autorizar transações em uma conta.


## Campos da Conta

Contas possuem os seguintes campos:

> #### Account ID
> ID da Conta. É a chave pública inicialmente usada para criar a conta. É possível substituir a chave usada para assinar as transações da conta por uma chave pública diferente, mas o ID original da conta sempre será usado para identificá-la.
>
> #### Balance
> Saldo. É o número de lumens mantidos na conta. O saldo é denominado por 1/10.000.000 avos de um lumen, a menor unidade divisível de um lumen.
>
> #### Sequence number
> Número sequencial atual da conta. Este número começa igual ao número do ledger no qual a conta foi criada.
>
> #### Number of subentries
> Número de outras [entradas](./ledger.md#ledger-entries) detidas pela conta. Este número é usado para calcular o [saldo mínimo](./fees.md#saldo-minimo-da-conta) da conta.
>
> #### Inflation destination
> (opcional) Conta designada a receber inflação. Toda conta pode votar para enviar [inflação](./inflation.md) a uma conta de destino.
>
> #### Flags
> Atualmente há três flags, usadas por emissores de [ativos](./assets.md).
>
>   - **Authorization required (0x1)**: Autorização necessária. Requer que a conta emissora dê permissão a outras contas para deter crédito da conta emissora.
>   - **Authorization revocable (0x2)**: Autorização revogável. Permite que a conta emissora revogue seu crédito mantido por outras contas.
>   - **Authorization immutable (0x4)**: Autorização imutável. Se for usada, nenhuma outra flag de autorização pode ser usada e a conta nunca pode ser deletada.
>
> #### Home domain
> Um nome de domínio que pode ser opcionalmente adicionado à conta. Clientes podem acessar um [stellar.toml](./stellar-toml.md) hospedado neste domínio. Deve estar no formato de um [nome de domínio completamente qualificado (FQDN)](https://pt.wikipedia.org/wiki/FQDN) como `exemplo.com.br`.
>
> O protocolo federation pode usar o home domain para obter mais detalhes sobre um memo de uma transação ou detalhes do [endereço](https://www.stellar.org/developers/learn/concepts/federation.html#stellar-addresses) de uma conta. Para saber mais sobre federation, veja o [guia do federation](./federation.md).
>
>
> #### Thresholds
> Operações têm níveis de acesso variáveis. Este campo especifica thresholds (limiares) para os níveis de acesso baixo, médio e alto, assim como o peso da chave mestra. Para mais informações, ver [multi-sig](./multi-sig.md).
>
> #### Signers
> Signatários; usado para [multi-sig](./multi-sig.md). Este campo lista outras chaves públicas e seus pesos, que podem ser usados para autorizar transações para esta conta.
