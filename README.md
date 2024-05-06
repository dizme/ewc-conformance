# EWC Conformance

Conformant Issuer and Verifier API according to [EWC RFC100: Interoperability Profile Towards ITB - v1.0
](https://github.com/EWC-consortium/eudi-wallet-rfcs/blob/main/ewc-rfc100-interoperability-profile-towards-itb-v1.0.md)

## Getting Started
Modify the `.env` file to reflect your configuration.
Be sure to set a valid `DATABASE_URL` for a PostreSQL database in `.env` file.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

> ⚠️ **IMPORTANT NOTE** The `BASE_URL` provided in env **MUST** be an internet reachable url
> 
> We suggest using [ngrok](https://ngrok.com/) for testing purposes.


## Build using Dockerfile
The repo provide a sample `Dockerfile` that allow to build the service.
Be sure to set a valid `DATABASE_URL` for a PostreSQL database in `.env` file

1. [Install Docker](https://docs.docker.com/get-docker/) on your machine.
1. Build your container: `docker build -t ewc-conformance .`.
1. Run your container: `docker run -p 3000:3000 ewc-conformance`.

You can view your images created with `docker images`.

## or `docker-compose.yaml`
The repository also contains a complete docker-compose fil. It starts a PostgreSQL database and set the Next application to use it. 
If you change the default values for postgres, just be sure to edit the env variable `DATABASE_URL` accordingly.

To build the services execute
```bash
docker compose build
```
To start containers execute
```bash
docker compose up -d
```