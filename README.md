<p align="center"><img src="https://imgur.com/Sv6j0B6.png" width="100" /></p>

# graphql-yoga

[![CircleCI](https://circleci.com/gh/prisma/graphql-yoga.svg?style=shield)](https://circleci.com/gh/prisma/graphql-yoga) [![npm version](https://badge.fury.io/js/graphql-yoga.svg)](https://badge.fury.io/js/graphql-yoga)

Fully-featured GraphQL Server with focus on easy setup, performance & great developer experience

## Overview

* **Easiest way to run a GraphQL server:** Sensible defaults & includes everything you need with minimal setup.
* **Includes Subscriptions:** Built-in support for GraphQL subscriptions using WebSockets.
* **Compatible:** Works with all GraphQL clients (Apollo, Relay...) and fits seamless in your GraphQL workflow.

`graphql-yoga` is based on the following libraries & tools:

* [`express`](https://github.com/expressjs/express)/[`apollo-server`](https://github.com/apollographql/apollo-server): Performant, extensible web server framework
* [`graphql-subscriptions`](https://github.com/apollographql/graphql-subscriptions)/[`subscriptions-transport-ws`](https://github.com/apollographql/subscriptions-transport-ws): GraphQL subscriptions server
* [`graphql.js`](https://github.com/graphql/graphql-js)/[`graphql-tools`](https://github.com/apollographql/graphql-tools): GraphQL engine & schema helpers
* [`graphql-playground`](https://github.com/graphcool/graphql-playground): Interactive GraphQL IDE

## Features

* GraphQL spec-compliant
* File upload
* GraphQL Subscriptions
* TypeScript typings
* GraphQL Playground
* Extensible via Express middleware
* Schema directives
* Apollo Tracing
* Accepts both `application/json` and `application/graphql` content-types
* Runs everywhere: Can be deployed via `now`, `up`, AWS Lambda, Heroku etc.
* Supports middleware out of the box.

## Install

```sh
yarn add graphql-yoga
```

## Usage

### Quickstart ([Hosted demo](https://demo-graphql-yoga.glitch.me))

```ts
import { GraphQLServer } from 'graphql-yoga'
// ... or using `require()`
// const { GraphQLServer } = require('graphql-yoga')

const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
  },
}

const server = new GraphQLServer({ typeDefs, resolvers })
server.start(() => console.log('Server is running on localhost:4000'))
```

> To get started with `graphql-yoga`, follow the instructions in the READMEs of the [examples](./examples).

### API

#### `GraphQLServer`

##### `constructor(props: Props): GraphQLServer`

The `props` argument accepts the following fields:

| Key                         | Type                                                            | Default | Note                                                                                                                                                                                                                                              |
| --------------------------- | --------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typeDefs`                  | `String` or `Function` or `DocumentNode` or `array` of previous | `null`  | Contains GraphQL type definitions in [SDL](https://blog.graph.cool/graphql-sdl-schema-definition-language-6755bcb9ce51) or file path to type definitions (required if `schema` is not provided \*)                                                |
| `resolvers`                 | Object                                                          | `null`  | Contains resolvers for the fields specified in `typeDefs` (required if `schema` is not provided \*)                                                                                                                                               |
| `resolverValidationOptions` | Object                                                          | `null`  | Object which controls the resolver validation behaviour (see ["Generating a schema"](https://www.apollographql.com/docs/graphql-tools/generate-schema.html#makeExecutableSchema)) for more information                                            |
| `schema`                    | Object                                                          | `null`  | An instance of [`GraphQLSchema`](http://graphql.org/graphql-js/type/#graphqlschema) (required if `typeDefs` and `resolvers` are not provided \*)                                                                                                  |
| `mocks`                     | Object or Boolean                                               | `null`  | Applies [mocks to schema](https://github.com/apollographql/graphql-tools/blob/master/docs/source/mocking.md). Setting this to true will apply a default mock, however you can pass an object to customize the mocks similar to the resolvers map. |
| `context`                   | Object or Function                                              | `{}`    | Contains custom data being passed through your resolver chain. This can be passed in as an object, or as a Function with the signature `(req: ContextParameters) => any` \*\*                                                                     |
| `schemaDirectives`          | Object                                                          | `null`  | [`Apollo Server schema directives`](https://www.apollographql.com/docs/graphql-tools/schema-directives.html) that allow for transforming schema types, fields, and arguments                                                                      |
| `middlewares`               | `array` of Middleware                                           | `[]`    | A list of [`GraphQLMiddleware`](https://github.com/graphcool/graphql-middleware) middleware.                                                                                                                                                      |

> (\*) There are two major ways of providing the [schema](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e) information to the `constructor`:
>
> 1.  Provide `typeDefs` and `resolvers` and omit the `schema`, in this case `graphql-yoga` will construct the `GraphQLSchema` instance using [`makeExecutableSchema`](https://www.apollographql.com/docs/graphql-tools/generate-schema.html#makeExecutableSchema) from [`graphql-tools`](https://github.com/apollographql/graphql-tools).
> 2.  Provide the `schema` directly and omit `typeDefs` and `resolvers`.

> (\*\*) Notice that the `req` argument is an object of the shape `{ request, response, connection }` which either carries a `request: Request` property (when it's a `Query`/`Mutation` resolver), `response: Response` property (when it's a `Query`/`Mutation` resolver), or a `connection: SubscriptionOptions` property (when it's a `Subscription` resolver). [`Request`](http://expressjs.com/en/api.html#req) is imported from Express.js. [`Response`](http://expressjs.com/en/api.html#res) is imported from Express.js aswell. `SubscriptionOptions` is from the [`graphql-subscriptions`](https://github.com/apollographql/graphql-subscriptions) package. `SubscriptionOptions` are getting the `connectionParams` automatically injected under `SubscriptionOptions.context.[CONNECTION_PARAMETER_NAME]`

Here is example of creating a new server:

```js
const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
  },
}

const server = new GraphQLServer({ typeDefs, resolvers })
```

#### `start(options: Options, callback: ((options: Options) => void) = (() => null)): Promise<void>`

Once your `GraphQLServer` is instantiated, you can call the `start` method on it. It takes two arguments: `options`, the options object defined above, and `callback`, a function that's invoked right before the server is started. As an example, the `callback` can be used to print information that the server has started.

The `options` object has the following fields:

| Key                      | Type                                                             | Default                                                                                          | Note                                                                                                                                                                                                                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cors`                   | Object                                                           | `null`                                                                                           | Contains [configuration options](https://github.com/expressjs/cors#configuration-options) for [cors](https://github.com/expressjs/cors)                                                                                                                                                                                      |
| `tracing`                | Boolean or [TracingOptions](/src/types.ts#L49-L51)               | `'http-header'`                                                                                  | Indicates whether [Apollo Tracing](https://github.com/apollographql/apollo-tracing) should be enabled or disabled for your server (if a string is provided, accepted values are: `'enabled'`, `'disabled'`, `'http-header'`)                                                                                                 |
| `port`                   | Number or String                                                 | `4000`                                                                                           | Determines the port your server will be listening on (note that you can also specify the port by setting the `PORT` environment variable)                                                                                                                                                                                    |
| `endpoint`               | String                                                           | `'/'`                                                                                            | Defines the HTTP endpoint of your server                                                                                                                                                                                                                                                                                     |
| `subscriptions`          | Object or String or `false`                                      | `'/'`                                                                                            | Defines the subscriptions (websocket) endpoint for your server; accepts an object with [subscription server options](https://github.com/apollographql/subscriptions-transport-ws#constructoroptions-socketoptions) `path`, `keepAlive`, `onConnect` and `onDisconnect`; setting to `false` disables subscriptions completely |
| `playground`             | String or `false`                                                | `'/'`                                                                                            | Defines the endpoint where you can invoke the [Playground](https://github.com/graphcool/graphql-playground); setting to `false` disables the playground endpoint                                                                                                                                                             |
| `defaultPlaygroundQuery` | String                                                           | `undefined`                                                                                      | Defines default query displayed in Playground.                                                                                                                                                                                                                                                                               |
| `uploads`                | [UploadOptions](/src/types.ts#L39-L43) or `false` or `undefined` | `null`                                                                                           | Provides information about upload limits; the object can have any combination of the following three keys: `maxFieldSize`, `maxFileSize`, `maxFiles`; each of these have values of type Number; setting to `false` disables file uploading                                                                                   |
| `https`                  | [HttpsOptions](/src/types.ts#L62-L65) or `undefined`             | `undefined`                                                                                      | Enables HTTPS support with a key/cert                                                                                                                                                                                                                                                                                        |
| `getEndpoint`            | String or Boolean                                                | `false`                                                                                          | Adds a graphql HTTP GET endpoint to your server (defaults to `endpoint` if `true`). Used for leveraging CDN level caching.                                                                                                                                                                                                   |
| `deduplicator`           | Boolean                                                          | `true`                                                                                           | Enables [graphql-deduplicator](https://github.com/gajus/graphql-deduplicator). Once enabled sending the header `X-GraphQL-Deduplicate` will deduplicate the data.                                                                                                                                                            |
| `bodyParserOptions`      | BodyParserJSONOptions                                            | [BodyParserJSONOptions Defaults](https://github.com/expressjs/body-parser#bodyparserjsonoptions) | Allows pass through of [body-parser options](https://github.com/expressjs/body-parser#bodyparserjsonoptions)                                                                                                                                                                                                                 |
| `playgroundSettings`      | [PlaygroundSettings](/src/types.ts#L76-L92)                                | null | Allows to modify playground settings on server start (https://github.com/prisma/graphql-playground#properties)                                                                                                                                                                                                                 |

Additionally, the `options` object exposes these `apollo-server` options:

| Key               | Type                 | Note                                                                                                                                                                                                                                                                                                                                 |
| ----------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cacheControl`    | Boolean              | Enable extension that returns Cache Control data in the response                                                                                                                                                                                                                                                                     |
| `formatError`     | Number               | A function to apply to every error before sending the response to clients. Defaults to [defaultErrorFormatter](https://github.com/graphcool/graphql-yoga/blob/master/src/defaultErrorFormatter.ts). Please beware, that if you override this, `requestId` and `code` on errors won't automatically be propagated to your yoga server |
| `logFunction`     | LogFunction          | A function called for logging events such as execution times                                                                                                                                                                                                                                                                         |
| `rootValue`       | any                  | RootValue passed to GraphQL execution                                                                                                                                                                                                                                                                                                |
| `validationRules` | Array of functions   | Additional GraphQL validation rules to be applied to client-specified queries                                                                                                                                                                                                                                                        |
| `fieldResolver`   | GraphQLFieldResolver | Specify a custom default field resolver function                                                                                                                                                                                                                                                                                     |
| `formatParams`    | Function             | A function applied to each query in a batch to format parameters before execution                                                                                                                                                                                                                                                    |
| `formatResponse`  | Function             | A function applied to each response after execution                                                                                                                                                                                                                                                                                  |
| `debug`           | boolean              | Print additional debug logging if execution errors occur                                                                                                                                                                                                                                                                             |

```js
const options = {
  port: 8000,
  endpoint: '/graphql',
  subscriptions: '/subscriptions',
  playground: '/playground',
}

server.start(options, ({ port }) =>
  console.log(
    `Server started, listening on port ${port} for incoming requests.`,
  ),
)
```

#### `PubSub`

See the original documentation in [`graphql-subscriptions`](https://github.com/apollographql/graphql-subscriptions).

#### `mocking`

Mocking the schema is straight forward, along wit

```javascript
import { GraphqlServer, MockList } from 'graphql-yoga'

const typeDefs = `
  type Query {
    hello(name: String): String!
    listOfStrings: [String]
  }
`

const mocks = {
  Query: () => ({
    hello: () => 'Hello World',
    listOfStrings: () => new MockList([2, 6]),
  }),
}

const server = new GraphQLServer({ typeDefs, mocks })
```

### Endpoints

## Examples

There are three examples demonstrating how to quickly get started with `graphql-yoga`:

* [hello-world](./examples/hello-world): Basic setup for building a schema and allowing for a `hello` query.
* [subscriptions](./examples/subscriptions): Basic setup for using subscriptions with a counter that increments every 2 seconds and triggers a subscription.
* [fullstack](./examples/fullstack): Fullstack example based on [`create-react-app`](https://github.com/facebookincubator/create-react-app) demonstrating how to query data from `graphql-yoga` with [Apollo Client 2.0](https://www.apollographql.com/client/).

## Workflow

Once your `graphql-yoga` server is running, you can use [GraphQL Playground](https://github.com/graphcool/graphql-playground) out of the box – typically running on `localhost:4000`. (Read [here](https://blog.graph.cool/introducing-graphql-playground-f1e0a018f05d) for more information.)

[![](https://imgur.com/6IC6Huj.png)](https://www.graphqlbin.com/RVIn)

## Deployment

### `now`

To deploy your `graphql-yoga` server with [`now`](https://zeit.co/now), follow these instructions:

1.  Download [**Now Desktop**](https://zeit.co/download)
2.  Navigate to the root directory of your `graphql-yoga` server
3.  Run `now` in your terminal

### Heroku

To deploy your `graphql-yoga` server with [Heroku](https://heroku.com), follow these instructions:

1.  Download and install the [Heroku Command Line Interface](https://devcenter.heroku.com/articles/heroku-cli#download-and-install) (previously Heroku Toolbelt)
2.  Log in to the Heroku CLI with `heroku login`
3.  Navigate to the root directory of your `graphql-yoga` server
4.  Create the Heroku instance by executing `heroku create`
5.  Deploy your GraphQL server by executing `git push heroku master`

### `up` (Coming soon 🔜 )

### AWS Lambda (Coming soon 🔜 )

## FAQ

### How does `graphql-yoga` compare to `apollo-server` and other tools?

As mentioned above, `graphql-yoga` is built on top of a variety of other packages, such as `graphql.js`, `express` and `apollo-server`. Each of these provides a certain piece of functionality required for building a GraphQL server.

Using these packages individually incurs overhead in the setup process and requires you to write a lot of boilerplate. `graphql-yoga` abstracts away the initial complexity and required boilerplate and lets you get started quickly with a set of sensible defaults for your server configuration.

`graphql-yoga` is like [`create-react-app`](https://github.com/facebookincubator/create-react-app) for building GraphQL servers.

### Can't I just setup my own GraphQL server using `express` and `graphql.js`?

`graphql-yoga` is all about convenience and a great "Getting Started" experience by abstracting away the complexity that comes when you're building your own GraphQL server from scratch. It's a pragmatic approach to bootstrap a GraphQL server, much like how [`create-react-app`](https://github.com/facebookincubator/create-react-app) removes friction when first starting out with React.

Whenever the defaults of `graphql-yoga` are too tight a corset for you, you can simply _eject_ from it and use the tooling it's built upon - there's no lock-in or any other kind of magic going on preventing you from doing this.

### How to eject from the standard `express` setup?

The core value of `graphql-yoga` is that you don't have to write the boilerplate required to configure your [express.js](https://github.com/expressjs/) application. However, once you need to add more customized behaviour to your server, the default configuration provided by `graphql-yoga` might not suit your use case any more. For example, it might be the case that you want to add more custom _middleware_ to your server, like for logging or error reporting.

For these cases, `GraphQLServer` exposes the `express.Application` directly via its [`express`](./src/index.ts#L17) property:

```js
server.express.use(myMiddleware())
```

Middleware can also be added specifically to the GraphQL endpoint route, by using:

```js
server.express.post(server.options.endpoint, myMiddleware())
```

Any middleware you add to that route, will be added right before the `apollo-server-express` middleware.

## Help & Community [![Slack Status](https://slack.prisma.io/badge.svg)](https://slack.prisma.io)

Join our [Slack community](http://slack.graph.cool/) if you run into issues or have questions. We love talking to you!

<p align="center"><a href="https://oss.prisma.io"><img src="https://imgur.com/IMU2ERq.png" alt="Prisma" height="170px"></a></p>
