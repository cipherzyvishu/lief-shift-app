#!/bin/bash

# Lief Healthcare Shift Management - Deployment Script
# This script prepares the application for production deployment

echo "🏥 Lief Healthcare Shift Management - Deployment Preparation"
echo "============================================================"

# Step 1: Install dependencies
echo "📦 Installing production dependencies..."
npm ci --only=production

# Step 2: Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Step 3: Check and create default locations
echo "📍 Checking for default locations..."
node scripts/check-locations.js

# Step 4: Run type checking
echo "🔍 Running TypeScript type checking..."
npx tsc --noEmit --skipLibCheck

# Step 5: Run linting
echo "🧹 Running code linting..."
npm run lint

# Step 6: Build the application
echo "🏗️ Building application for production..."
npm run build

# Step 7: Deployment ready
echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Set up production environment variables"
echo "2. Configure production database"
echo "3. Set up Auth0 production application"
echo "4. Deploy to your hosting platform"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
