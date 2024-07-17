## protoc-gen-graphql

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=viqueen_protoc-gen-graphql&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=viqueen_protoc-gen-graphql)

Protoc plugin to generate GraphQL schema from protobuf schema.

### install it

#### from stable

- with **homebrew** (preferred)

```bash
brew tap viqueen/labset
brew install protoc-gen-graphql
```

- with **npm**

```bash
npm install @labset/protoc-gen-graphql -g
```

### development

#### environment

- **[nvm](https://github.com/nvm-sh/nvm)** to manage node versions.

```bash
brew install nvm
```

- **[yarn](https://yarnpkg.com/)** as node package manager

```bash
brew install yarn
```

#### house-keeping

- install dependencies

```bash
nvm install
yarn
```

- build it

```bash
yarn build
```

- format it

```bash
yarn format
```

- lint it

```bash
yarn lint
yarn lint --fix
```

- test it

```bash
yarn test
```
