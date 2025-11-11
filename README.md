# Projeto Integrador – Cloud Developing 2025/1

> CRUD simples (API de Filmes) + API Gateway + Lambda /report + RDS + Deploy Manual

**Grupo**:

1.  10420681 - Anna Julia Santos de Paula - Infraestrutura/Backend/API Gateway/ Vídeo/Testes
3.  10420655 - Letícia Santiago da Silva - Criação e configuração do container (Dockerfile)
4.  10420646- Isadora Caetano Brandão de Sousa - Testes, depuração da conectividade
5.  10420562 - Valéria Almeida - Criação do Diagrama de Arquitetura/ Vídeo/Testes
## 1\. Visão geral

O domínio de negócio escolhido foi um **Catálogo de Filmes**.

Este projeto implementa um sistema de CRUD (Create, gitRead, Update, Delete) simples para gerenciar registros de filmes, incluindo título, diretor, ano e gênero. O objetivo é demonstrar a configuração e integração de serviços-chave da AWS em uma arquitetura de nuvem, com foco na configuração manual e integração dos serviços.

## 2\. Arquitetura

O diagrama abaixo ilustra o fluxo de dados da aplicação.


<img width="561" height="351" alt="arquitetura1" src="https://github.com/user-attachments/assets/1660e9d8-5df0-4551-80c9-b410404bb866" />


| Camada | Serviço | Descrição |
|---|---|---|
| Backend | **EC2 + Docker** | API REST em Node.js (Express), containerizada com Docker e executada em uma instância EC2. |
| Banco | Amazon RDS | **PostgreSQL** em uma instância do Amazon RDS. A instância está configurada **sem acesso público**. |
| Gateway | Amazon API Gateway | **API Gateway (HTTP)**. Roteia `ANY /{proxy+}` para o EC2 e `GET /report` para a função Lambda. |
| Função | AWS Lambda | Função Node.js que consome a própria API (via GET /filmes), calcula estatísticas (total, contagem por gênero) e as retorna em JSON. |
| CI/CD | **Deploy Manual** | Processo de deploy manual via SSH e Docker. Push no GitHub -\> `git pull` no EC2 -\> `docker build` -\> `docker run`. |

## 3\. Como rodar localmente

Para rodar a API localmente (para testes, sem o banco de dados da nuvem), você pode usar o Node.js diretamente ou o Docker.

### 3.1. Variáveis de Ambiente

Primeiro, crie um arquivo `.env` na pasta `api/` (você pode copiar do `api/.env.example`).

**`api/.env.example`**

```
# Host do banco de dados (ex: localhost, se estiver rodando um Postgres local)
DB_HOST=localhost

# Porta do banco de dados
DB_PORT=5432

# Nome do usuário do banco
DB_USER=postgres

# Senha do usuário
DB_PASSWORD=sua_senha_local

# Nome do banco
DB_NAME=filmesdb

# Desligar SSL para testes locais
DB_SSL=false

# Porta que a API vai rodar
PORT=3000
```

### 3.2. Rodando com Node.js (Sem Docker)

```bash
# Entre na pasta da API
cd api

# Crie seu arquivo .env
# (copie o .env.example e preencha)

# Instale as dependências
npm install

# Inicie o servidor
npm start
```

A API estará rodando em `http://localhost:3000`.

### 3.3. Rodando com Docker

```bash
# Crie seu arquivo .env na pasta 'api/'
# (copie o .env.example e preencha)

# 1. Construa a imagem
docker build -t api-filmes ./api

# 2. Rode o container, passando o arquivo .env
# (O $(pwd) pega o caminho atual)
docker run -d -p 3000:3000 \
  --name api-filmes-local \
  --env-file ./api/.env \
  api-filmes
```

A API estará rodando em `http://localhost:3000`.
