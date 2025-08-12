# Deployment Checklist for Lief Healthcare Shift Management System

## ✅ Pre-Deployment Tasks

### 1. Environment Setup
- [ ] Copy `.env.example` to `.env.local` (for local) or `.env` (for production)
- [ ] Configure all required environment variables:
  - `DATABASE_URL` - PostgreSQL connection string
  - `AUTH0_SECRET` - Generate 32-character secret key
  - `AUTH0_BASE_URL` - Your application URL
  - `AUTH0_ISSUER_BASE_URL` - Your Auth0 domain
  - `AUTH0_CLIENT_ID` - Auth0 application client ID
  - `AUTH0_CLIENT_SECRET` - Auth0 application client secret
  - `APP_BASE_URL` - Application base URL
  - `NODE_ENV` - Set to "production" for production

### 2. Database Setup
- [ ] Ensure PostgreSQL database is running and accessible
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Seed database with default locations: `npm run db:seed`
- [ ] Verify locations exist: `npm run check-locations`

### 3. Auth0 Configuration
- [ ] Set up Auth0 application with correct callback URLs
- [ ] Configure allowed callback URLs: `{BASE_URL}/api/auth/callback`
- [ ] Configure allowed logout URLs: `{BASE_URL}`
- [ ] Set up user roles (MANAGER, CARE_WORKER)
- [ ] Test authentication flow

### 4. Code Quality & Type Safety
- [ ] Run type checking: `npm run type-check`
- [ ] Run linting: `npm run lint`
- [ ] Fix any TypeScript errors or warnings
- [ ] Ensure all components are properly typed

### 5. Build Process
- [ ] Run production build: `npm run build`
- [ ] Check for build errors or warnings
- [ ] Test build output: `npm run start`
- [ ] Verify all pages load correctly
- [ ] Test API endpoints functionality

### 6. Security Checklist
- [ ] Verify environment variables are not exposed to client
- [ ] Check RBAC implementation (Manager vs Care Worker access)
- [ ] Test protected routes and API endpoints
- [ ] Verify session handling and JWT security
- [ ] Test middleware authentication flow

### 7. Functional Testing
- [ ] Test user authentication (login/logout)
- [ ] Test clock-in functionality with GPS
- [ ] Test clock-out functionality
- [ ] Test manager dashboard and active staff table
- [ ] Test real-time updates (30-second refresh)
- [ ] Test error handling and user feedback

## 🚀 Deployment Commands

### Local Development
```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

### Production Build
```bash
npm install --production
npm run db:generate
npm run prebuild  # Includes location check
npm run build
npm run start
```

### Health Check Commands
```bash
npm run check-locations  # Verify default locations exist
npm run db:studio        # Open database admin
npm run type-check       # TypeScript validation
npm run lint            # Code quality check
```

## 🌐 Deployment Platforms

### Vercel Deployment
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Configure build command: `npm run build`
4. Configure output directory: `.next`
5. Set Node.js version: 18.x or higher

### Netlify Deployment
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Configure environment variables
5. Add `@netlify/plugin-nextjs` plugin

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Performance Monitoring

### Key Metrics to Monitor
- Database connection pool usage
- Auth0 API response times
- GraphQL query performance
- Real-time update frequency
- User session duration

### Health Check Endpoints
- `GET /api/auth/me` - Authentication status
- `POST /api/graphql` - GraphQL server health
- Database connectivity via Prisma

## 🔧 Troubleshooting

### Common Issues
1. **"No location available for clock-in"**
   - Solution: Run `npm run db:seed` or `npm run check-locations`

2. **Auth0 JWE Errors**
   - Check AUTH0_SECRET length (must be 32+ characters)
   - Verify AUTH0_BASE_URL matches deployment URL

3. **Database Connection Issues**
   - Verify DATABASE_URL format and accessibility
   - Check firewall rules for database port

4. **GraphQL Authentication Errors**
   - Verify user roles are properly set in database
   - Check session context passing to resolvers

### Debug Commands
```bash
npm run db:studio           # Database inspection
npx prisma migrate status   # Migration status
npx prisma validate         # Schema validation
npm run type-check         # TypeScript errors
```

## 📋 Post-Deployment Verification

### Functional Tests
- [ ] User can register/login via Auth0
- [ ] Care workers can clock in/out successfully
- [ ] Managers can view active staff table
- [ ] Real-time updates work correctly
- [ ] GPS location capture functions
- [ ] Error handling displays user-friendly messages

### Performance Tests
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] GraphQL queries efficient

### Security Tests
- [ ] Unauthorized users cannot access protected routes
- [ ] Care workers cannot access manager-only features
- [ ] API endpoints properly validate authentication
- [ ] Environment variables secured

---

**Deployment Status**: Ready for production ✅

**Last Updated**: August 12, 2025
