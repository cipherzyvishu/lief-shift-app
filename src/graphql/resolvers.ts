
import { prisma } from '@/lib/prisma';
import { GraphQLScalarType, Kind } from 'graphql';
import { GraphQLContext, GraphQLResolverParent } from './types';

// A custom resolver to handle the DateTime type we defined in our schema
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date custom scalar type',
  serialize(value: unknown) {
    if (value instanceof Date) {
      return value.toISOString(); // Convert outgoing Date to ISO string
    }
    throw Error('GraphQL Date Scalar serializer expected a `Date` object');
  },
  parseValue(value: unknown) {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value); // Convert incoming ISO string/timestamp to Date
    }
    throw new Error('GraphQL Date Scalar parser expected a `string` or `number`');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Date(ast.value); // Convert value from the query string
    }
    return null;
  },
});


export const resolvers = {
  DateTime: dateTimeScalar,

  Query: {
    // Resolver for the simple test query
    hello: () => 'Hello, world! The GraphQL server is running!',

    // Resolver for fetching users from the database
    users: async () => {
      // Use our Prisma Client instance to query the database for all users
      return await prisma.user.findMany();
    },

    // Secure resolver for getting the current user's active shift
    myActiveShift: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      // Check if user is authenticated
      if (!context.session || !context.user) {
        throw new Error('You must be authenticated to access this resource');
      }

      // Find the user's active shift (one that is CLOCKED_IN)
      const activeShift = await prisma.shift.findFirst({
        where: {
          userId: context.user.id,
          status: 'CLOCKED_IN'
        },
        include: {
          user: true,
          location: true
        }
      });

      return activeShift;
    },

    // Secure resolver for managers to get all active shifts
    activeShifts: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      // Check if user is authenticated
      if (!context.session || !context.user) {
        throw new Error('You must be authenticated to access this resource');
      }

      // Check if user has MANAGER role
      if (context.user.role !== 'MANAGER') {
        throw new Error('Access denied. Manager role required to view active staff');
      }

      // Fetch all shifts that are currently CLOCKED_IN with user details
      const activeShifts = await prisma.shift.findMany({
        where: {
          status: 'CLOCKED_IN'
        },
        include: {
          user: true,
          location: true
        },
        orderBy: {
          clockInTime: 'desc' // Most recent clock-ins first
        }
      });

      return activeShifts;
    },

    // Secure resolver for managers to get paginated shift history
    allShifts: async (_parent: unknown, args: { skip?: number; take?: number }, context: GraphQLContext) => {
      // Check if user is authenticated
      if (!context.session || !context.user) {
        throw new Error('You must be authenticated to access this resource');
      }

      // Check if user has MANAGER role
      if (context.user.role !== 'MANAGER') {
        throw new Error('Access denied. Manager role required to view shift history');
      }

      // Set default pagination values
      const skip = args.skip || 0;
      const take = args.take || 10; // Default to 10 items per page
      const maxTake = 100; // Prevent too large queries

      // Ensure take doesn't exceed maximum
      const limitedTake = Math.min(take, maxTake);

      console.log(`🔍 Manager ${context.user.email} requesting shifts with pagination: skip=${skip}, take=${limitedTake}`);

      // Get paginated shifts with related data
      const shifts = await prisma.shift.findMany({
        skip,
        take: limitedTake,
        include: {
          user: true,
          location: true
        },
        orderBy: {
          clockInTime: 'desc' // Most recent shifts first
        }
      });

      // Get total count for pagination
      const totalCount = await prisma.shift.count();

      // Calculate pagination metadata
      const hasNextPage = skip + limitedTake < totalCount;
      const hasPreviousPage = skip > 0;

      console.log(`📊 Retrieved ${shifts.length} shifts out of ${totalCount} total`);

      return {
        shifts,
        totalCount,
        hasNextPage,
        hasPreviousPage
      };
    },
  },

  // Resolvers for nested fields
  User: {
    shifts: async (parent: GraphQLResolverParent) => {
      return await prisma.shift.findMany({
        where: { userId: parent.id },
        include: {
          location: true,
          user: true
        }
      });
    },
  },

  Shift: {
    user: async (parent: GraphQLResolverParent) => {
      return await prisma.user.findUnique({
        where: { id: parent.userId as string }
      });
    },
    location: async (parent: GraphQLResolverParent) => {
      return await prisma.location.findUnique({
        where: { id: parent.locationId as string }
      });
    },
  },
};