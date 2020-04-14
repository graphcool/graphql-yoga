import dotenv from 'dotenv';
import { GraphQLServer } from 'graphql-yoga';
import { startDB, models } from './db';
import { resolvers }  from './graphql/resolvers';

dotenv.config();

const db = startDB;

const context = {
  models,
  db,
};

const Server = new GraphQLServer({
  typeDefs: './src/graphql/schema.graphql',
  resolvers,
  context,
});

// options
const opts = {
  port: process.env.SERVER_PORT,
};


Server.start(opts, ({ port }) => {
  console.log('Server is running on http://localhost:' + port);
});
