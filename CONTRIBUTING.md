# Contributing

## Local Setup

```sh
cp .env.example .env

# fill the env variable

yarn test:integration
```

### Docker image

```sh
docker build -t contentful-migration .

# run migration with `contentful-migration@latest`
export $(xargs < .env) && docker run --rm --name contentful-migration-runner -e CONTENT_MANAGEMENT_TOKEN=$CONTENT_MANAGEMENT_TOKEN -e SPACE_ID=$SPACE_ID -e ENVIRONMENT_ID=$ENVIRONMENT_ID -v $(pwd)/migrations:/app/migrations contentful-migration

# run migration with `contentful-migration@4.0.0`
export $(xargs < .env) && docker run --rm --name contentful-migration-runner -e CONTENT_MANAGEMENT_TOKEN=$CONTENT_MANAGEMENT_TOKEN -e SPACE_ID=$SPACE_ID -e ENVIRONMENT_ID=$ENVIRONMENT_ID -v $(pwd)/migrations:/app/migrations contentful-migration --cfmversion 4.0.0
```

### CLI

```sh
yarn build

env $(xargs < .env) yarn ts-node ./bin/index.js run ./migrations
```


## Release

```sh
# Creates a new version by incrementing the major, minor, or patch number of the current version.
yarn version [--major | --minor | --patch]

# Creates a new prerelease version by incrementing the major, minor, or patch number of the current version and adding a prerelease number.
yarn version --preid beta [--premajor | --preminor | --prepatch]

# Increments the prerelease version number keeping the main version.
yarn version --prerelease

# Push branch and tags
git push origin main --follow-tags
```