// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';

// Initialize a new Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

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

  console.log(`Seeding finished. Created users:`, { manager, careWorker });
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