
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

    // Resolver for fetching all locations (for manager dashboard)
    allLocations: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      // Check if user is authenticated and is a manager
      if (!context.session || !context.user) {
        throw new Error('You must be authenticated to access this resource');
      }

      if (context.user.role !== 'MANAGER') {
        throw new Error('You must be a manager to access location data');
      }

      return await prisma.location.findMany({
        orderBy: { name: 'asc' }
      });
    },

    // Analytics query for daily statistics
    dailyStats: async (_parent: unknown, args: { date: string }, context: GraphQLContext) => {
      // Check if user is authenticated and is a manager
      if (!context.session || !context.user) {
        throw new Error('You must be authenticated to access this resource');
      }

      if (context.user.role !== 'MANAGER') {
        throw new Error('You must be a manager to access analytics data');
      }

      // Parse the date and create date range for the day
      const targetDate = new Date(args.date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      console.log(`📊 Manager ${context.user.email} requesting daily stats for ${args.date}`);

      // Get all shifts that were clocked in on the target date
      const dayShifts = await prisma.shift.findMany({
        where: {
          clockInTime: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        include: {
          user: true
        }
      });

      // Calculate statistics
      const totalClockIns = dayShifts.length;
      const uniqueStaff = new Set(dayShifts.map(shift => shift.userId));
      const totalStaffActive = uniqueStaff.size;
      
      // Calculate average hours (only for completed shifts)
      const completedShifts = dayShifts.filter(shift => shift.totalHours !== null);
      const totalHours = completedShifts.reduce((sum, shift) => sum + (shift.totalHours || 0), 0);
      const avgHours = completedShifts.length > 0 ? totalHours / completedShifts.length : 0;

      console.log(`📈 Daily stats: ${totalClockIns} clock-ins, ${totalStaffActive} staff, ${avgHours.toFixed(1)}h avg`);

      return {
        date: args.date,
        avgHours: Math.round(avgHours * 100) / 100, // Round to 2 decimal places
        totalClockIns,
        totalStaffActive
      };
    },

    // Analytics query for weekly hours per staff member
    weeklyHoursPerStaff: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      // Check if user is authenticated and is a manager
      if (!context.session || !context.user) {
        throw new Error('You must be authenticated to access this resource');
      }

      if (context.user.role !== 'MANAGER') {
        throw new Error('You must be a manager to access analytics data');
      }

      // Calculate date range for last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      console.log(`📊 Manager ${context.user.email} requesting weekly hours per staff`);

      // Get all shifts from the last 7 days with completed hours
      const weeklyShifts = await prisma.shift.findMany({
        where: {
          clockInTime: {
            gte: startDate,
            lte: endDate
          },
          totalHours: {
            not: null
          }
        },
        include: {
          user: true
        },
        orderBy: {
          clockInTime: 'desc'
        }
      });

      // Group by staff and calculate totals
      const staffHoursMap = new Map();
      
      weeklyShifts.forEach(shift => {
        const staffId = shift.user.id;
        
        if (!staffHoursMap.has(staffId)) {
          staffHoursMap.set(staffId, {
            staffId: staffId,
            staffName: shift.user.name || shift.user.email.split('@')[0],
            staffEmail: shift.user.email,
            totalHours: 0,
            shiftsCount: 0
          });
        }
        
        const staffData = staffHoursMap.get(staffId);
        staffData.totalHours += shift.totalHours || 0;
        staffData.shiftsCount += 1;
      });

      // Convert map to array and sort by total hours (descending)
      const staffWeeklyHours = Array.from(staffHoursMap.values())
        .map(staff => ({
          ...staff,
          totalHours: Math.round(staff.totalHours * 100) / 100 // Round to 2 decimal places
        }))
        .sort((a, b) => b.totalHours - a.totalHours);

      console.log(`📈 Weekly stats: ${staffWeeklyHours.length} staff members with hours`);

      return staffWeeklyHours;
    },
  },

  Mutation: {
    // Secure resolver for updating location geofence radius
    updateLocation: async (_parent: unknown, args: { locationId: string; radius: number }, context: GraphQLContext) => {
      // Check if user is authenticated and is a manager
      if (!context.session || !context.user) {
        throw new Error('You must be authenticated to perform this action');
      }

      if (context.user.role !== 'MANAGER') {
        throw new Error('You must be a manager to update location settings');
      }

      // Validate radius (must be positive and reasonable)
      if (args.radius < 10 || args.radius > 10000) {
        throw new Error('Radius must be between 10 and 10,000 meters');
      }

      try {
        const updatedLocation = await prisma.location.update({
          where: { id: args.locationId },
          data: { radius: args.radius }
        });

        return updatedLocation;
      } catch {
        throw new Error('Failed to update location. Please check if the location exists.');
      }
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