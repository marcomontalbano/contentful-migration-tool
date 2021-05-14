# Contributing

## Local Setup

```sh
cp .env.example .env

yarn test:integration
```

### Docker image

```sh
docker build -t contentful-migration .

export $(xargs < .env) && docker run --rm --name contentful-migration-runner -e CONTENT_MANAGEMENT_TOKEN=$CONTENT_MANAGEMENT_TOKEN -e SPACE_ID=$SPACE_ID -e ENVIRONMENT_ID=$ENVIRONMENT_ID -v $(pwd)/migrations:/app/migrations contentful-migration
```