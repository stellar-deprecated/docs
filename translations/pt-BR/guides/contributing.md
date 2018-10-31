---
title: Guia de Contribuições
---

# Como contribuir para um projeto Stellar

Suas contribuições à rede Stellar vão ajudar a melhorar a infraestrutura financeira mundial mais rapidamente.

Queremos que seja o mais fácil possível para contribuir alterações que ajudem a rede Stellar a crescer e prosperar. Há algumas orientações que pedimos que os contribuidores sigam para podermos realizar merge com suas mudanças rapidamente.

## Para Começar

* Certifique-se de que você tem uma [conta no GitHub](https://github.com/join)
* Crie uma issue no GitHub para sua contribuição, se já não houver.
  * Descreva claramente o problema, incluindo passos para reproduzí-lo caso seja um bug.
* Faça um fork do repositório no GitHub.

## Encontrar coisas para trabalhar

O melhor lugar para começar é sempre dando uma olhada nas issues atuais no GitHub referentes ao projeto em que você tem interesse em contribuir. Issues marcadas com [help wanted](https://github.com/issues?q=is%3Aopen+is%3Aissue+user%3Astellar+label%3A%22help+wanted%22) costumam não ser muito abrangentes e são um bom lugar para começar.

O Stellar.org também usa essas mesmas issues do GitHub para acompanhar aquilo em que estamos trabalhando. Caso veja alguma issue atribuída a uma pessoa específica ou que tenha um rótulo `in progress`, significa que alguém está trabalhando nessa issue. O rótulo `orbit` quer dizer que provavelmente vamos trabalhar nessa issue nas próximas semanas. O rótulo `ready` significa que é uma issue prioritária e que trabalharemos nela na nossa próxima "orbit" (o termo que usamos no lugar de um sprint) ou na seguinte.

 E, é claro, sinta-se livre para criar uma nova issue se achar que algo precisa ser adicionado ou consertado.

## Fazer Alterações

* Crie um topic branch a partir do branch no qual você quer basear seu trabalho.
  * Normalmente seria criado a partir do branch `master`.
  * Por favor evite trabalhar diretamente no branch `master`.
* Certifique-se de que tenha adicionado os testes necessários para suas alterações e que todos os testes tenham passado.

## Submeter Alterações

* [Assine o Acordo da Licença do Contribuidor](https://docs.google.com/forms/d/1g7EF6PERciwn7zfmfke5Sir2n10yddGGSXyZsq98tVY/viewform?usp=send_form).
* Todo o conteúdo, comentários e pull requests devem seguir as [Orientações da Comunidade Stellar](https://www.stellar.org/community-guidelines/).
* Dê push em suas alterações para um topic branch no seu fork do repositório.
* Submeta uma pull request para o repositório do projeto em que você está trabalhando na organização Stellar.
 * Inclua uma [mensagem de commit](https://github.com/erlang/otp/wiki/Writing-good-commit-messages) descritiva.
 * Mudanças contribuídas por meio de pull requests devem se focar em uma issue por vez.
 * Dê rebase em suas mudanças locais em relação ao branch `master`. Resolva todos os conflitos que surgirem.

Nesse momento, a bola fica com a gente. Gostamos de pelo menos comentar as pull requests dentro de três dias úteis (tipicamente um dia útil). Podemos sugerir algumas mudanças, melhorias ou alternativas.

## Pequenas Mudanças

### Documentação
Para pequenas alterações nos comentários e na documentação, nem sempre é preciso criar uma nova issue no GitHub. Nesse caso, é adequado começar a primeira linha de um commit com 'doc' em vez do número de uma issue.

# Recursos Adicionais
* [Acordo da Licença do Contribuidor](https://docs.google.com/forms/d/1g7EF6PERciwn7zfmfke5Sir2n10yddGGSXyZsq98tVY/viewform?usp=send_form)
* [Explore a API](https://www.stellar.org/developers/reference/)
* canal #dev no [Slack](http://slack.stellar.org)
* canal IRC #stellar-dev no freenode.org

Este documento tem como inspiração:

https://github.com/puppetlabs/puppet/blob/master/CONTRIBUTING.md

https://github.com/thoughtbot/factory_girl_rails/blob/master/CONTRIBUTING.md

https://github.com/rust-lang/rust/blob/master/CONTRIBUTING.md
