import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { resolvers } from '@/graphql/resolvers';
import { typeDefs } from '@/graphql/schema';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create a simplified handler that works with Next.js App Router
const handler = startServerAndCreateNextHandler(server, {
  context: async () => {
    try {
      const session = await auth0.getSession();
      let user = null;
      
      if (session?.user?.email) {
        user = await prisma.user.findUnique({
          where: { email: session.user.email }
        });
      }
      
      // Return context matching our GraphQLContext interface
      const context: {
        prisma: typeof prisma;
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
      } = {
        prisma
      };

      // Only add session if we have required fields
      if (session?.user?.email && session.user.sub) {
        context.session = {
          user: {
            email: session.user.email,
            name: session.user.name,
            sub: session.user.sub
          }
        };
      }

      // Only add user if we found one in the database
      if (user) {
        context.user = {
          id: user.id,
          email: user.email,
          role: user.role
        };
      }

      return context;
    } catch {
      return {
        prisma,
        session: undefined,
        user: undefined
      };
    }
  },
});

// Export named functions that match Next.js App Router expectations
export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}