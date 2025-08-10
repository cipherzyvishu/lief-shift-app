// Simple script to add test data for testing GraphQL functionality
// Run this with: npx tsx scripts/add-test-data.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestData() {
  console.log('🌟 Adding test data for GraphQL testing...');

  try {
    // Create a test location if it doesn't exist
    const existingLocation = await prisma.location.findFirst({
      where: { name: 'Test Care Facility' }
    });

    let location;
    if (!existingLocation) {
      location = await prisma.location.create({
        data: {
          name: 'Test Care Facility',
          latitude: 40.7128,
          longitude: -74.0060,
          radius: 100,
        },
      });
      console.log('✅ Created test location:', location.name);
    } else {
      location = existingLocation;
      console.log('✅ Using existing test location:', location.name);
    }

    // List all users to show available test accounts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        shifts: {
          where: { status: 'CLOCKED_IN' },
          include: { location: true }
        }
      }
    });

    console.log('\n👥 Available users for testing:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
      if (user.shifts.length > 0) {
        console.log(`    🕒 Has active shift at: ${user.shifts[0].location.name}`);
      } else {
        console.log(`    💤 No active shifts`);
      }
    });

    console.log('\n🧪 Test Data Summary:');
    console.log(`   - Locations: ${await prisma.location.count()}`);
    console.log(`   - Users: ${await prisma.user.count()}`);
    console.log(`   - Active Shifts: ${await prisma.shift.count({ where: { status: 'CLOCKED_IN' } })}`);
    console.log(`   - Total Shifts: ${await prisma.shift.count()}`);

    console.log('\n🚀 Ready for testing! You can now:');
    console.log('   1. Login to your app at http://localhost:3000');
    console.log('   2. Visit http://localhost:3000/test-graphql for comprehensive testing');
    console.log('   3. Use the clock-in controls to create active shifts');
    console.log('   4. Test the myActiveShift GraphQL query');

  } catch (error) {
    console.error('❌ Error adding test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addTestData().catch(console.error);
