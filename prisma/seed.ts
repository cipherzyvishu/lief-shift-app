// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';

// Initialize a new Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create sample locations first
  const mainHospital = await prisma.location.upsert({
    where: { id: 'main-hospital' },
    update: {},
    create: {
      id: 'main-hospital',
      name: 'Main Hospital Ward',
      latitude: 37.7749, // San Francisco coordinates as example
      longitude: -122.4194,
      radius: 100, // 100 meters radius
    },
  });

  const emergencyWing = await prisma.location.upsert({
    where: { id: 'emergency-wing' },
    update: {},
    create: {
      id: 'emergency-wing',
      name: 'Emergency Wing',
      latitude: 37.7849, // Slightly different coordinates
      longitude: -122.4094,
      radius: 150, // 150 meters radius
    },
  });

  const nursingHome = await prisma.location.upsert({
    where: { id: 'nursing-home' },
    update: {},
    create: {
      id: 'nursing-home',
      name: 'Sunrise Nursing Home',
      latitude: 37.7649, // Different coordinates
      longitude: -122.4294,
      radius: 200, // 200 meters radius
    },
  });

  // Create a sample Manager user
  const manager = await prisma.user.upsert({
    where: { email: 'manager@lief.care' }, // Use a unique field to find the user
    update: {}, // If the user already exists, do nothing
    create: {
      email: 'manager@lief.care',
      auth0Id: 'auth0|seed_manager_placeholder', // A temporary, fake Auth0 ID
      name: 'Alice Manager',
      role: Role.MANAGER, // Assign the MANAGER role
    },
  });

  // Create a sample Care Worker user
  const careWorker = await prisma.user.upsert({
    where: { email: 'worker@lief.care' },
    update: {},
    create: {
      email: 'worker@lief.care',
      auth0Id: 'auth0|seed_worker_placeholder', // A temporary, fake Auth0 ID
      name: 'Bob CareWorker',
      role: Role.CARE_WORKER, // Assign the CARE_WORKER role
    },
  });

  console.log(`Seeding finished.`);
  console.log(`Created locations:`, { mainHospital, emergencyWing, nursingHome });
  console.log(`Created users:`, { manager, careWorker });
}

// Run the main function and exit
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });