import test from 'ava'
import { inflate } from 'graphql-deduplicator'
import { GraphQLServer, Options } from './index'
import { promisify } from 'util'
import { middleware } from 'graphql-middleware'
import { AddressInfo } from 'net'
import * as request from 'request-promise-native'

async function startServer(t, options?: Options) {
  const randomId = () => Math.random().toString(36).substr(2, 5)

  const typeDefs = `
    type Author {
      id: ID!
      name: String!
      lastName: String!
    }

    type Book {
      id: ID!
      name: String!
      author: Author!
    }

    type Query {
      hello(name: String): String!
      books: [Book!]!
    }
    `

  const author = {
    __typename: 'Author',
    id: randomId(),
    name: 'Jhon',
    lastName: 'Doe',
  }
  const book = {
    __typename: 'Book',
    id: randomId(),
    name: 'Awesome',
    author,
  }
  const resolvers = {
    Query: {
      hello: (_, { name }) => `Hello ${name || 'World'}`,
      books: () => Array(5).fill(book),
    },
  }

  const server = new GraphQLServer({ typeDefs, resolvers })
  const http = await server.start({ port: 0, ...options })
  const { port } = http.address() as AddressInfo
  const uri = `http://localhost:${port}/`

  if (t.context.httpServers) {
    t.context.httpServers.push(http)
  } else {
    t.context.httpServers = [http]
  }

  t.context.uri = uri
  t.context.data = { book }

  return t.context
}

test.afterEach.always('stop graphql servers', async (t) => {
  const httpServers = (t.context as any).httpServers;

  if (httpServers && httpServers.length) {
    await Promise.all(
      httpServers.map((server) => promisify(server.close).call(server)),
    )
  }
})

test('works with simple hello world server', async (t) => {
  const { uri } = await startServer(t)

  const query = `
    query {
        hello(name: "Sarah")
    }
  `

  const body = await request({
    uri,
    method: 'POST',
    json: true,
    body: { query },
  }).promise()

  t.deepEqual(body, {
    data: {
      hello: 'Hello Sarah',
    },
  })
})

test('Response data can be deduplicated with graphql-deduplicator', async (t) => {
  const {
    uri,
    data: { book },
  } = await startServer(t)

  const query = `
    query {
      books {
        __typename
        id
        name
        author {
          __typename
          id
          name
          lastName
        }
      }
    }
  `

  const body = await request({
    uri,
    method: 'POST',
    json: true,
    body: { query },
  }).promise()

  const deduplicated = await request({
    uri,
    method: 'POST',
    json: true,
    body: { query },
    headers: {
      'X-GraphQL-Deduplicate': true,
    },
  }).promise()

  t.deepEqual(body, {
    data: {
      books: Array(5).fill(book),
    },
  })

  t.deepEqual(deduplicated, {
    data: {
      books: [
        book,
        ...Array(4).fill({
          __typename: book.__typename,
          id: book.id,
        }),
      ],
    },
  })

  t.deepEqual(body.data, inflate(deduplicated.data))
})

test('graphql-deduplicated can be completely disabled', async (t) => {
  const {
    uri,
    data: { book },
  } = await startServer(t, {
    deduplicator: false,
  })

  const query = `
    query {
      books {
        __typename
        id
        name
        author {
          __typename
          id
          name
          lastName
        }
      }
    }
  `

  const body = await request({
    uri,
    method: 'POST',
    json: true,
    body: { query },
    headers: {
      'X-GraphQL-Deduplicate': true,
    },
  }).promise()

  t.deepEqual(body, {
    data: {
      books: Array(5).fill(book),
    },
  })
})

test('Works with graphql-middleware', async (t) => {
  const typeDefs = `
    type Book {
      id: ID!
      name: String!
      author: String!
    }

    type Query {
      book: Book!
    }
  `

  const resolvers = {
    Query: {
      book: () => ({
        id: 'id',
        name: 'name',
        author: 'author',
      }),
    },
  }

  const middleware = async (resolve, parent, args, ctx, info) => {
    return 'pass'
  }

  const server = new GraphQLServer({
    typeDefs,
    resolvers,
    middlewares: [middleware],
  })
  const http = await server.start({ port: 0 })
  const { port } = http.address() as AddressInfo
  const uri = `http://localhost:${port}/`

  const query = `
    query {
      book {
        id
        name
        author
      }
    }
  `

  const body = await request({
    uri,
    method: 'POST',
    json: true,
    body: { query },
  }).promise()

  t.deepEqual(body, {
    data: {
      book: {
        id: 'pass',
        name: 'pass',
        author: 'pass',
      },
    },
  })
})

test('Works with graphql-middleware generator.', async (t) => {
  const typeDefs = `
    type Book {
      id: ID!
      name: String!
      author: String!
    }

    type Query {
      book: Book!
    }
  `

  const resolvers = {
    Query: {
      book: () => ({
        id: 'id',
        name: 'name',
        author: 'author',
      }),
    },
  }

  const middlewareGenerator = middleware((schema) => {
    return async (resolve, parent, args, ctx, info) => {
      return 'pass'
    }
  })

  const server = new GraphQLServer({
    typeDefs,
    resolvers,
    middlewares: [middlewareGenerator],
  })
  const http = await server.start({ port: 0 })
  const { port } = http.address() as AddressInfo
  const uri = `http://localhost:${port}/`

  const query = `
    query {
      book {
        id
        name
        author
      }
    }
  `

  const body = await request({
    uri,
    method: 'POST',
    json: true,
    body: { query },
  }).promise()

  t.deepEqual(body, {
    data: {
      book: {
        id: 'pass',
        name: 'pass',
        author: 'pass',
      },
    },
  })
})

test('Works with array of resolvers', async (t) => {
  const typeDefs = `
    type Book {
      id: ID!
      name: String!
      author: String!
    }

    type Query {
      book: Book!
    }
  `

  const queryResolver = {
    Query: {
      book: () => ({
        id: 'id',
        name: 'name',
        author: 'author',
      }),
    },
  }

  const bookIdResolver = {
    Book: {
      id: (root) => `book-${root.id}`,
    },
  }

  const bookNameResolver = {
    Book: {
      name: (root) => `book-${root.name}`,
    },
  }

  const server = new GraphQLServer({
    typeDefs,
    resolvers: [queryResolver, bookIdResolver, bookNameResolver],
    middlewares: [],
  })
  const http = await server.start({ port: 0 })
  const { port } = http.address() as AddressInfo
  const uri = `http://localhost:${port}/`

  const query = `
    query {
      book {
        id
        name
        author
      }
    }
  `

  const body = await request({
    uri,
    method: 'POST',
    json: true,
    body: { query },
  }).promise()

  t.deepEqual(body, {
    data: {
      book: {
        id: 'book-id',
        name: 'book-name',
        author: 'author',
      },
    },
  })
})
