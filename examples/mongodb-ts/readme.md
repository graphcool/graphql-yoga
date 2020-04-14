# GraphQL-Yoga MongoDB Typescript Example

## Build

- Use `npm run build` to compile TS to JS (Putting all JS files in "dist"-directory)

## Running in Development

- Use `docker-compose up -d` to setup and start MongoDB
- Use `npm run dev` to start the server in Developer Mode. this will run the index.js in "dist"-directory

## Serving it for Production

- Use `docker-compose up -d` to setup and start MongoDB
- Use `npm run prod` to start the server in Prod Mode. this will run the index.js in "dist"-directory

### Dependencies

- Graphql-Yoga
- Mongoose
- Typescript
- ts-node
- dotenv
- Nodemon
