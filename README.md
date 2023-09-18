# TLA-EPB

Repository for Transformer Loading Analysis tool at EPB.

## Running on development

Once you've cloned the project and installed dependencies with `yarn` or `yarn install` start a development server:

```bash
# Opens a new development server running on port 5173.
yarn run dev
```

## Building

To create a production build for local development:

```bash
yarn run build
```

## Running on production

After creating a production build, run the following command

```bash
yarn run serve
```

## Installation on Production

### Installing Docker and Docker-Compose

#### **Using Docker Desktop**
Linux: https://docs.docker.com/desktop/install/linux-install/

Mac: https://docs.docker.com/desktop/install/mac-install/

Windows: https://docs.docker.com/desktop/install/windows-install/

### Docker configuration

Open the docker-compose.yml file. It should look like this:

```yml
version: '3.9'

services:
  postgres:
    image: postgres:14-alpine
    ports:
      - 5432:5432
    volumes:
      - ~/apps/postgres:/var/lib/postgresql/data
      - ./docker-entrypoint-initdb.d/init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      - POSTGRES_PASSWORD=<DATABASE_PASSWORD>
      - POSTGRES_USER=<DATABASE_USERNAME>
      - POSTGRES_DB=<DATABASE_NAME>
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U <POSTGRES_USER> -d <POSTGRES_DB_NAME>"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - 3000:3000
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@postgres:5432/<POSTGRES_DB_NAME>
      # FORMAT
      # POSTGRESQL://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>
```

You will need to change the values encapsulated in arrow brackets.

**ex: <POSTGRES_USER> --> test**

The variables are self explanatory but for clarification:

- <POSTGRES_DB_NAME> is the Postgres Database Name
- <POSTGRES_USER> is the Database Username
- <POSTGRES_PASSWORD> is the Database Password

### Running

Make sure you have docker installed. See https://docs.docker.com/compose/install/#installation-scenarios

Docker Desktop is the easiest method of installing **Docker** and **Docker-Compose** both are required to run this application.

After cloning the repository and changing configuration as needed run the following:

```bash
docker-compose up -d
```
