// scripts/check-locations.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndSeedLocations() {
  try {
    console.log('🔍 Checking for existing locations...');
    
    const locationCount = await prisma.location.count();
    
    if (locationCount === 0) {
      console.log('📍 No locations found. Creating default locations...');
      
      const locations = [
        {
          id: 'main-hospital',
          name: 'Main Hospital Ward',
          latitude: 37.7749,
          longitude: -122.4194,
          radius: 100,
        },
        {
          id: 'emergency-wing',
          name: 'Emergency Wing',
          latitude: 37.7849,
          longitude: -122.4094,
          radius: 150,
        },
        {
          id: 'nursing-home',
          name: 'Sunrise Nursing Home',
          latitude: 37.7649,
          longitude: -122.4294,
          radius: 200,
        }
      ];

      for (const location of locations) {
        await prisma.location.create({
          data: location
        });
        console.log(`✅ Created location: ${location.name}`);
      }
      
      console.log('🎉 Default locations created successfully!');
    } else {
      console.log(`✅ Found ${locationCount} existing locations.`);
    }
    
  } catch (error) {
    console.error('❌ Error checking/creating locations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeedLocations();
