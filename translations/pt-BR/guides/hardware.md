---
title: Requisitos de Hardware
---

# Considerações

A Rede Stellar é um sistema em atividade e os requisitos de hardware irão crescer junto com o uso da rede. Por favor mantenha isso em mente ao decidir que hardware usar para sua integração ao Stellar.

Se optar pelos requisitos mínimos que listamos abaixo, você pode sofrer lag durante picos de tráfego na rede enquanto seu nó tenta alcançar o resto da rede. Para ter uma experiência fluida, recomenda-se usar hardware que cumpra os requisitos recomendados listados para cada serviço.

Nos esforçaremos para deixar esta documentação atualizada enquanto fazemos melhorias no código.

# Nós

## Stellar-Core

Instâncias de Stellar-Core participam da rede como um nó e, assim, precisam ser potentes o suficiente para suportar o volume da rede.

### Mínimo
**CPU**: 4-Core (8-Thread) Intel i7/Xeon ou equivalente (c5.xlarge na AWS)\
**RAM**: 8GB DDR4\
**SSD**: 64GB

### Recomendado
**CPU**: 8-Core (16-Thread) Intel i7/Xeon ou equivalente (c5.2xlarge na AWS)\
**RAM**: 16GB DDR4\
**SSD**: 120GB

## Horizon

Instâncias de Horizon recebem dados da rede e logo precisam ser potentes o suficientes para suportar receber todas as transações mais recentes da rede.

Há um volume considerável de computação que é feito no lado base de dados do Horizon; esses requisitos são apenas para o lado aplicação do Horizon. Se você está seguindo esses requisitos, é preciso considerar usar uma máquina mais potente se for usar a mesma máquina para a base de dados, ou mesmo uma máquina separada para a base de dados.

### Mínimo
**CPU**: 8-Core (16-Thread) Intel i7/Xeon ou equivalente (c5.2xlarge na AWS)\
**RAM**: 16GB DDR4\
**SSD**: 64GB

### Recomendado
**CPU**: 16-Core (32-Thread) Intel i7/Xeon ou equivalente (c5.4xlarge na AWS)\
**RAM**: 32GB DDR4\
**SSD**: 120GB

# Servidores de Âncoras

Os requisitos de hardware para os serviços de âncoras dependem do seu próprio uso interno: estes requisitos de hardware não irão aumentar junto com o volume da rede. Nossas sugestões abaixo consideram que você irá rodar uma máquina para cada serviço, mas você pode combinar serviços em uma só máquina com uma capacidade maior usando máquinas virtuais se preferir.

## Servidor Bridge

### Mínimo
**CPU**: 2-Core (4-Thread) Intel i7/Xeon ou equivalente (c5.large na AWS)\
**RAM**: 4GB DDR3/DDR4\
**SSD**: Requer uma base de dados para guardar transações processadas. Os requisitos de CPU e RAM acima não levam em conta o hardware que roda essa BD. O tamanho da BD depende do seu uso da rede. 20GB parece ser um bom ponto de partida.

### Recomendado
**CPU**: 4-Core (8-Thread) Intel i7/Xeon ou equivalente (c5.xlarge na AWS)\
**RAM**: 8GB DDR4\
**SSD**: Requer uma base de dados para guardar transações processadas. Os requisitos de CPU e RAM acima não levam em conta o hardware que roda essa BD. O tamanho da BD depende do seu uso da rede. 20GB parece ser um bom ponto de partida.

## Servidor Federation

### Mínimo
**CPU**: 2-Core (4-Thread) Intel i7/Xeon ou equivalente (c5.large na AWS)\
**RAM**: 4GB DDR3/DDR4\
**SSD**: Requer uma base de dados para guardar transações processadas. Os requisitos de CPU e RAM acima não levam em conta o hardware que roda essa BD. O tamanho da BD depende de quantas contas você possui. Veja callbacks para mais informações.

### Recomendado
**CPU**: 4-Core (8-Thread) Intel i7/Xeon ou equivalente (c5.xlarge na AWS)\
**RAM**: 8GB DDR4\
**SSD**: Requer uma base de dados para guardar transações processadas. Os requisitos de CPU e RAM acima não levam em conta o hardware que roda essa BD. O tamanho da BD depende de quantas contas você possui. Veja callbacks para mais informações.

## Servidor Compliance

### Mínimo
**CPU**: 2-Core (4-Thread) Intel i7/Xeon ou equivalente (c5.large na AWS)\
**RAM**: 4GB DDR3/DDR4\
**SSD**: Requer uma base de dados para guardar transações processadas. Os requisitos de CPU e RAM acima não levam em conta o hardware que roda essa BD. O tamanho da BD depende do seu uso da rede. 20GB parece ser um bom ponto de partida.

### Recomendado
**CPU**: 4-Core (8-Thread) Intel i7/Xeon ou equivalente (c5.xlarge na AWS)\
**RAM**: 8GB DDR4\
**SSD**: Requer uma base de dados para guardar transações processadas. Os requisitos de CPU e RAM acima não levam em conta o hardware que roda essa BD. O tamanho da BD depende do seu uso da rede. 20GB parece ser um bom ponto de partida.
