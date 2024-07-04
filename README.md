# MyAmble 3.jv.0

## Running locally with docker

```bash
docker compose up -d
```

## Running locally without docker

1. Start the postgres database
2. Start the nextjs app

## Deploying to AWS

0. Mask sure the [`aws-amplify.yml`](./github/workflows/aws-amplify.yml) workflow is enabled
1. Push commits to the main branch
2. AWS Amplift will automatically deploy the latest version to the production environment
