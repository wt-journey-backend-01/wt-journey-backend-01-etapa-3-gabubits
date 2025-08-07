# Instruções para configuração do projeto

Esse guia foi feito para te ajudar no processo de inicialização e configuração do Docker e dos arquivos relacionados ao Knex. Esse guia considera que o usuário já tem o Docker instalado na máquina.

1. Instale as dependências do projeto

```bash
npm i
```

2. Crie um arquivo `.env` na raiz do projeto
   O arquivo `.env` é essencial nesse projeto. Através dele, o Docker acessará variáveis importantes relacionadas ao banco de dados Postgres. Sendo assim, crie esse arquivo da seguinte forma:

```text
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=policia_db
```

3. Inicialize o Docker com o PostgreSQL
   Nessa etapa, o contêiner com o banco de dados será inicializado com as configurações definidas no `docker-compose.yml`, definido na pasta raiz do projeto.

```bash
docker compose up
```

Dessa forma, a atual instância do terminal será ocupada pelo Docker e nenhum outro comando poderá ser executado. Se não quiser que isso aconteça. use:

```bash
docker compose up -d
```

4. Crie as tabelas no banco de dados
   Como o Knex está sendo utilizado nesse projeto como Query Builder da aplicação, existem duas pastas definidas na pasta `db/`: `migrations/` e `seeds/`. A pasta de migrations reúne a configuração das tabelas do banco de dados. A pasta de seeds reúne os dados de inicialização de cada tabela definida no migrations.

   Então, é preciso criar nossas tabelas para serem populadas. Para isso, utilize o comando:

```bash
npx knex migrate:latest
```

5. Popule as tabelas criadas

```bash
npx knex seed:run
```

6. Acesse o banco de dados e verifique se tudo ocorreu de forma bem-sucedida
   Esse comando fará o terminal entrar dentro do conteiner do Docker diretamente na interface do Postgres.

```bash
docker exec -it postgres-database psql -U postgres -d policia_db
```

Agora, dentro do conteiner, verifique se as tabelas estão definidas com:

```bash
policia_db=# \dt
```

Faça um simples SELECT em uma tabela para verificar que as tabelas estão populadas:

```bash
policia_db=# select * from agentes;
```

Para sair do ambiente:

```bash
policia_db=# \quit
```

7. Encerre a conexão com o Docker
   Caso queira encerrar a conexão do Docker sem apagar os dados no banco de dados, execute o comando:

```bash
docker compose down
```

Se quiser apagar a conexão e apagar o banco de dados também:

```bash
docker compose down -v
```
