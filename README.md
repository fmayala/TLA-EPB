# TLA-EPB

Repository for Transformer Loading Analysis tool at EPB.

> [!IMPORTANT]
> You will need to provision a compatible postgres database service with TimescaleDB if you are running this app without docker (development or production). A initialization SQL file is provided in the docker-entrypoint-initdb.d folder. You will also need to use the .env.sample to create a .env with a valid connection string to this database service.

## Running on Development (without docker)

Once you've cloned the project and installed dependencies with `yarn` or `yarn install` start a development server:

```bash
# Opens a new development server running on port 5173.
yarn run dev
```

## Building for Production (without Docker)

To create a production build for local development:

```bash
yarn run build
```

## Running on Production (without Docker)

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
  timescaledb:
    image: timescale/timescaledb:latest-pg14
    ports:
      - 5432:5432
    volumes:
      - timescaledb_data:/var/lib/postgresql/data
      - ./docker-entrypoint-initdb.d/init.sql:/docker-entrypoint-initdb.d/init.sql
      - ./imports:/imports
    environment:
      - POSTGRES_PASSWORD=<PASSWORD>
      - POSTGRES_USER=<USER>
      - POSTGRES_DB=<DATABASE>
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U epb -d xfmrdb"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - 3000:3000
    volumes:
      - ./imports:/imports
    depends_on:
      timescaledb:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://<USER>:<PASSWORD>@timescaledb:5432/<DATABASE>
      # FORMAT
      # POSTGRESQL://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>

volumes:
  timescaledb_data:
    driver: local
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

### Stopping

```bash
docker-compose down
```

## Importing Data

To import transformer identifying records and transformer measure data utilize the method below.

1. In the cloned repository you will find a folder named **scripts**.

2. There are multiple script files.
    1. **Windows**
        1. import_data.bat (XfmrMeasure data)
        2. import_xfmr.bat (XfmrDimension data)
    2. **Linux-based**
        1. import_data.sh (XfmrMeasure data)
        2. import_xfmr.sh (XfmrDimension data)

3. To ensure proper imports, after your container is successfully created and running. Place your identifying transformer csv file in the **import_xfmr** folder. Likewise, place any measure data csv files in the **import_measure** folder. Example files are provided in the **example** folder. 

4. Run the below:
    ```bash
    docker-compose restart
    ```

    It should restart the container so the container has the files you've placed in the folders.

4. Run the **import_xfmr** script that corresponds to your platform.

5. After running the **import_xfmr** script successfully run the **import_data** script.