# EWC Conformance

Conformant Issuer and Verifier API according to [EWC RFC100: Interoperability Profile Towards ITB - v1.0
](https://github.com/EWC-consortium/eudi-wallet-rfcs/blob/main/ewc-rfc100-interoperability-profile-towards-itb-v1.0.md)

## Getting Started
Modify the `.env` file to reflect your configuration

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


## Using Docker
The repo provide a sample `Dockerfile` that allow to build the service.

1. [Install Docker](https://docs.docker.com/get-docker/) on your machine.
1. Build your container: `docker build -t ewc-conformance .`.
1. Run your container: `docker run -p 3000:3000 ewc-conformance`.

You can view your images created with `docker images`.

### Deploy notes

Currently there is partial support for deployment because of the usage of a local db for testing purposes.
Next iteration we will provide a docker configuration to run the app with a suporting database.
