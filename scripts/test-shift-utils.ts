import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to create a test shift for a user
export async function createTestShift(userEmail: string) {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      throw new Error(`User with email ${userEmail} not found`);
    }

    // Check if user already has an active shift
    const existingActiveShift = await prisma.shift.findFirst({
      where: {
        userId: user.id,
        status: 'CLOCKED_IN'
      }
    });

    if (existingActiveShift) {
      console.log('User already has an active shift:', existingActiveShift.id);
      return existingActiveShift;
    }

    // Find or create a test location
    let location = await prisma.location.findFirst({
      where: { name: 'Test Care Facility' }
    });

    if (!location) {
      location = await prisma.location.create({
        data: {
          name: 'Test Care Facility',
          latitude: 40.7128,
          longitude: -74.0060,
          radius: 100,
        }
      });
    }

    // Create a test shift
    const shift = await prisma.shift.create({
      data: {
        userId: user.id,
        locationId: location.id,
        clockInTime: new Date(),
        clockInLat: location.latitude,
        clockInLng: location.longitude,
        status: 'CLOCKED_IN',
        clockInNote: 'Test shift created for GraphQL testing'
      },
      include: {
        user: true,
        location: true
      }
    });

    console.log('✅ Created test shift for', user.email, 'at', location.name);
    return shift;

  } catch (error) {
    console.error('❌ Error creating test shift:', error);
    throw error;
  }
}

// Function to clean up test shifts
export async function cleanupTestShifts() {
  try {
    const deletedShifts = await prisma.shift.deleteMany({
      where: {
        clockInNote: { contains: 'Test shift created for GraphQL testing' }
      }
    });

    console.log(`🧹 Cleaned up ${deletedShifts.count} test shifts`);
    return deletedShifts.count;
  } catch (error) {
    console.error('❌ Error cleaning up test shifts:', error);
    throw error;
  }
}

// Script runner
async function main() {
  const command = process.argv[2];
  const userEmail = process.argv[3];

  switch (command) {
    case 'create':
      if (!userEmail) {
        console.log('Usage: npx tsx scripts/test-shift-utils.ts create <user-email>');
        process.exit(1);
      }
      await createTestShift(userEmail);
      break;
    
    case 'cleanup':
      await cleanupTestShifts();
      break;
    
    default:
      console.log('Usage:');
      console.log('  npx tsx scripts/test-shift-utils.ts create <user-email>');
      console.log('  npx tsx scripts/test-shift-utils.ts cleanup');
  }

  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}
