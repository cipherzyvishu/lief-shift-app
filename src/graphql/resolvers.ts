
import { prisma } from '@/lib/prisma';
import { GraphQLScalarType, Kind } from 'graphql';

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
    myActiveShift: async (parent: any, args: any, context: any) => {
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
    activeShifts: async (parent: any, args: any, context: any) => {
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
  },

  // Resolvers for nested fields
  User: {
    shifts: async (parent: any) => {
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
    user: async (parent: any) => {
      return await prisma.user.findUnique({
        where: { id: parent.userId }
      });
    },
    location: async (parent: any) => {
      return await prisma.location.findUnique({
        where: { id: parent.locationId }
      });
    },
  },
};