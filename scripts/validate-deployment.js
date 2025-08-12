// scripts/validate-deployment.js
// Simple validation script to verify deployment readiness

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function validateDeployment() {
  console.log('🔍 Validating deployment readiness...\n');
  
  let allChecksPass = true;

  try {
    // Check 1: Database Connection
    console.log('1. Database Connection...');
    await prisma.$connect();
    console.log('   ✅ Database connected successfully');
    
    // Check 2: Required Tables Exist
    console.log('\n2. Database Schema...');
    const userCount = await prisma.user.count();
    const locationCount = await prisma.location.count();
    const shiftCount = await prisma.shift.count();
    
    console.log(`   ✅ Users table: ${userCount} records`);
    console.log(`   ✅ Locations table: ${locationCount} records`);
    console.log(`   ✅ Shifts table: ${shiftCount} records`);
    
    // Check 3: Default Locations
    console.log('\n3. Default Locations...');
    if (locationCount === 0) {
      console.log('   ⚠️  No locations found - run `npm run db:seed`');
      allChecksPass = false;
    } else {
      console.log('   ✅ Default locations exist');
    }
    
    // Check 4: Environment Variables
    console.log('\n4. Environment Variables...');
    const requiredEnvVars = [
      'DATABASE_URL',
      'AUTH0_SECRET',
      'AUTH0_BASE_URL',
      'AUTH0_ISSUER_BASE_URL',
      'AUTH0_CLIENT_ID',
      'AUTH0_CLIENT_SECRET'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar} is set`);
      } else {
        console.log(`   ❌ ${envVar} is missing`);
        allChecksPass = false;
      }
    }
    
    // Final Status
    console.log('\n' + '='.repeat(50));
    if (allChecksPass) {
      console.log('🎉 DEPLOYMENT READY - All checks passed!');
      console.log('✅ Database schema is valid');
      console.log('✅ Required data exists');
      console.log('✅ Environment variables configured');
      console.log('\n🚀 Ready to deploy to production!');
    } else {
      console.log('⚠️  DEPLOYMENT NOT READY - Some issues found');
      console.log('Please fix the issues above before deploying.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    allChecksPass = false;
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

validateDeployment();
