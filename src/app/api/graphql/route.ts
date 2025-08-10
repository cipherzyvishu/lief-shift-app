
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { resolvers } from '@/graphql/resolvers';
import { typeDefs } from '@/graphql/schema';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';

// Initialize the Apollo Server, passing it our schema and resolver implementations
const server = new ApolloServer({
  resolvers,
  typeDefs,
});

// The startServerAndCreateNextHandler function is designed to work with the app router.
// It creates a handler that can be exported for GET and POST requests.
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req, res) => {
    // Get the Auth0 session for the current user
    const session = await auth0.getSession();
    
    // If there's a session, fetch the user from our database
    let user = null;
    if (session && session.user) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          shifts: {
            include: {
              location: true
            }
          }
        }
      });
    }
    
    return { 
      req, 
      res, 
      session,
      user 
    };
  },
});

// Export the handler for both GET and POST requests.
// GET is used by Apollo Sandbox to introspect the schema.
// POST is used for actual queries and mutations from your client.
export { handler as GET, handler as POST };