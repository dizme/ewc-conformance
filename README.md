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

## Deploy notes

Currently there is no documentation on deployment because of the usage of a local db for testing purposes. Next iteration we will provide a docker configuration to run the app with a suporting database.