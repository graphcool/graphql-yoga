import { Request, Response } from 'express'
import { CorsOptions } from 'cors'
import { GraphQLSchema, GraphQLFieldResolver, ValidationContext } from 'graphql'
import {
  IDirectiveResolvers,
  IResolverValidationOptions,
  ITypeDefinitions,
} from 'graphql-tools/dist/Interfaces'
import { SchemaDirectiveVisitor } from 'graphql-tools/dist/schemaVisitor'
import { ExecutionParams } from 'subscriptions-transport-ws'
import { LogFunction } from 'apollo-server-core'
import { IMocks, IResolvers } from 'graphql-tools'
import {
  IMiddleware as IFieldMiddleware,
  IMiddlewareGenerator as IFieldMiddlewareGenerator,
  FragmentReplacement,
} from 'graphql-middleware'
import { APIGatewayProxyEvent, Context as LambdaContext } from 'aws-lambda'

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

export type Context = { [key: string]: any }

export interface ContextParameters {
  request: Request
  response: Response
  connection: ExecutionParams
  fragmentReplacements: FragmentReplacement[]
}

export interface LambdaContextParameters {
  event: APIGatewayProxyEvent
  context: LambdaContext
}

export type ContextCallback = (params: ContextParameters) => Context

export type LambdaContextCallback = (params: LambdaContextParameters) => Context

// check https://github.com/jaydenseric/graphql-upload#type-uploadoptions for documentation
export interface UploadOptions {
  maxFieldSize?: number
  maxFileSize?: number
  maxFiles?: number
}

export interface TracingOptions {
  mode: 'enabled' | 'disabled' | 'http-header'
}

export type ValidationRules = Array<(context: ValidationContext) => any>

export type ValidationRulesExpressCallback = (
  request: Request,
  response: Response,
) => ValidationRules

export interface ApolloServerOptions {
  tracing?: boolean | TracingOptions
  cacheControl?: boolean
  formatError?: Function
  logFunction?: LogFunction
  rootValue?: any
  validationRules?: ValidationRules | ValidationRulesExpressCallback
  fieldResolver?: GraphQLFieldResolver<any, any>
  formatParams?: Function
  formatResponse?: Function
  debug?: boolean
}

export interface HttpsOptions {
  cert: string | Buffer
  key: string | Buffer
}

export interface Options extends ApolloServerOptions {
  port?: number | string
  host?: string
  cors?: CorsOptions | false
  uploads?: UploadOptions | false
  endpoint?: string
  subscriptionsProtocol?: 'both' | 'legacy' | 'current' // default: 'both'
  subscriptions?: SubscriptionServerOptions | string | false
  playground?: string | false
  defaultPlaygroundQuery?: string
  https?: HttpsOptions
  deduplicator?: boolean
  getEndpoint?: string | boolean
  bodyParserOptions?: BodyParserJSONOptions
}

export interface OptionsWithHttps extends Options {
  https: HttpsOptions
}

export type OptionsWithoutHttps = Omit<Options, 'https'>

export interface SubscriptionServerOptions {
  path?: string
  onConnect?: Function
  onDisconnect?: Function
  keepAlive?: number
}

export interface Props<
  TFieldMiddlewareSource = any,
  TFieldMiddlewareContext = any,
  TFieldMiddlewareArgs = any
> {
  directiveResolvers?: IDirectiveResolvers<any, any>
  schemaDirectives?: {
    [name: string]: typeof SchemaDirectiveVisitor
  }
  typeDefs?: ITypeDefinitions
  resolvers?: IResolvers | IResolvers[]
  resolverValidationOptions?: IResolverValidationOptions
  schema?: GraphQLSchema
  context?: Context | ContextCallback
  mocks?: IMocks | boolean
  middlewares?: (
    | IFieldMiddleware<
        TFieldMiddlewareSource,
        TFieldMiddlewareContext,
        TFieldMiddlewareArgs
      >
    | IFieldMiddlewareGenerator<
        TFieldMiddlewareSource,
        TFieldMiddlewareContext,
        TFieldMiddlewareArgs
      >)[]
}

export interface LambdaProps<
  TFieldMiddlewareSource = any,
  TFieldMiddlewareContext = any,
  TFieldMiddlewareArgs = any
> {
  directiveResolvers?: IDirectiveResolvers<any, any>
  schemaDirectives?: {
    [name: string]: typeof SchemaDirectiveVisitor
  }
  typeDefs?: string
  resolvers?: IResolvers
  resolverValidationOptions?: IResolverValidationOptions
  schema?: GraphQLSchema
  context?: Context | LambdaContextCallback
  options?: LambdaOptions
  middlewares?: (
    | IFieldMiddleware<
        TFieldMiddlewareSource,
        TFieldMiddlewareContext,
        TFieldMiddlewareArgs
      >
    | IFieldMiddlewareGenerator<
        TFieldMiddlewareSource,
        TFieldMiddlewareContext,
        TFieldMiddlewareArgs
      >)[]
}

export interface LambdaOptions extends ApolloServerOptions {
  endpoint?: string
  deduplicator?: boolean
}

export interface BodyParserJSONOptions {
  limit?: number | string
  inflate?: boolean
  reviver?: any
  strict?: boolean
  type?: string
  verify?: any
}
