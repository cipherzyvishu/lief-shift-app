// src/graphql/types.ts
export interface GraphQLContext {
  session?: {
    user?: {
      email: string;
      name?: string;
      sub: string;
    };
  };
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface GraphQLResolverArgs {
  [key: string]: unknown;
}

export interface GraphQLResolverParent {
  id: string;
  userId?: string;
  locationId?: string;
  [key: string]: unknown;
}

export type GraphQLResolver<TResult = unknown, TParent = unknown, TArgs = unknown> = (
  parent: TParent,
  args: TArgs,
  context: GraphQLContext,
  info?: unknown
) => TResult | Promise<TResult>;
