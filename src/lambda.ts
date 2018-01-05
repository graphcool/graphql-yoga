import { graphqlLambda } from 'apollo-server-lambda'
import * as fs from 'fs'
import { GraphQLSchema } from 'graphql'
import { importSchema } from 'graphql-import'
import lambdaPlayground from 'graphql-playground-middleware-lambda'
import { makeExecutableSchema } from 'graphql-tools'
import * as path from 'path'

import { LambdaOptions, LambdaProps } from './types'

export class GraphQLServerLambda {
  options: LambdaOptions
  executableSchema: GraphQLSchema

  // TODO: Get endpoint from a variable?
  playgroundHandler = lambdaPlayground({ endpoint: '/dev/graphql' })

  protected context: any

  constructor(props: LambdaProps) {
    const defaultOptions: LambdaOptions = {
      tracing: { mode: 'http-header' },
    }
    this.options = { ...defaultOptions, ...props.options }

    this.context = props.context

    if (props.schema) {
      this.executableSchema = props.schema
    } else if (props.typeDefs && props.resolvers) {
      let { typeDefs, resolvers } = props

      // read from .graphql file if path provided
      if (typeDefs.endsWith('graphql')) {
        const schemaPath = path.isAbsolute(typeDefs) ? path.resolve(typeDefs) : path.resolve(typeDefs)

        if (!fs.existsSync(schemaPath)) {
          throw new Error(`No schema found for path: ${schemaPath}`)
        }

        typeDefs = importSchema(schemaPath)
      }

      this.executableSchema = makeExecutableSchema({
        typeDefs,
        resolvers,
      })
    }
  }

  graphqlHandler(event, context, callback) {
    function callbackFilter(error, output) {
      // eslint-disable-next-line no-param-reassign
      output.headers['Access-Control-Allow-Origin'] = '*'

      callback(error, output)
    }

    const tracing = event => {
      const t = this.options.tracing
      if (typeof t === 'boolean') {
        return t
      } else if (t.mode === 'http-header') {
        return event.headers['x-apollo-tracing'] !== undefined
      } else {
        return t.mode === 'enabled'
      }
    }

    const handler = graphqlLambda(async (event, context) => {
      let apolloContext
      try {
        apolloContext =
          typeof this.context === 'function' ? await this.context({ event, context }) : this.context
      } catch (e) {
        console.error(e)
        throw e
      }

      return {
        schema: this.executableSchema,
        tracing: tracing(event),
        context: apolloContext,
      }
    })
    return handler(event, context, callbackFilter)
  }
}