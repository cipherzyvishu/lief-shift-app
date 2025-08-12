# Lief Healthcare Shift Management System

A comprehensive healthcare worker shift management application built with Next.js, featuring role-based access control, real-time monitoring, and secure authentication.

## 🏥 About

Lief is a modern healthcare workforce management solution that enables:
- **Care Workers** to clock in/out with GPS location tracking
- **Managers** to monitor active staff in real-time and access analytics
- **Administrators** to manage locations, users, and system settings

Built for healthcare facilities requiring precise time tracking, location verification, and workforce visibility.

## 🚀 Tech Stack

### Frontend
- **Next.js 15.4.6** - React framework with App Router
- **TypeScript** - Type-safe development
- **Ant Design 5.26.7** - Professional UI component library
- **Tailwind CSS** - Utility-first styling

### Backend
- **GraphQL** - Type-safe API with Apollo Server
- **Prisma 6.13.0** - Database ORM and schema management
- **PostgreSQL** - Production-ready database

### Authentication & Security
- **Auth0 v4.9.0** - Enterprise authentication service
- **Role-Based Access Control (RBAC)** - Manager/Care Worker permissions
- **JWT Sessions** - Secure session management

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **Prisma Studio** - Database administration

## 🏗️ Architecture

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes (Auth0, GraphQL)
│   │   ├── dashboard/       # Role-based dashboard pages
│   │   └── error/           # Error handling pages
│   ├── components/          # Reusable React components
│   │   ├── dashboard/       # Manager dashboard components
│   │   └── shift/           # Shift management components
│   ├── context/             # React Context providers
│   ├── graphql/             # GraphQL schema and resolvers
│   ├── lib/                 # Utility libraries (Auth0, Prisma)
│   └── middleware.ts        # Auth0 middleware
├── prisma/                  # Database schema and migrations
└── public/                  # Static assets
```

## 📊 Current Features

### ✅ Phase 1: Core Authentication & Security
- **Auth0 Integration**: Secure login/logout with session management
- **Role-Based Access Control**: Manager and Care Worker role separation
- **Protected Routes**: Server-side route protection with automatic redirects
- **Session Error Handling**: Graceful JWE error recovery and session reset

### ✅ Phase 2: Shift Management System
- **GraphQL API**: Secure, type-safe API with role-based resolvers
- **Clock In/Out System**: GPS location capture with PostgreSQL persistence
- **Real-time UI Updates**: React Context state management
- **Location Tracking**: Latitude/longitude capture for compliance
- **Shift Notes**: Optional notes during clock-in/out operations

### ✅ Phase 3: Manager Dashboard & Monitoring
- **Manager Dashboard**: Role-restricted admin interface
- **Active Staff Table**: Real-time monitoring of clocked-in workers
- **Live Updates**: Auto-refresh every 30 seconds
- **Staff Details**: Name, location, clock-in time, and notes display
- **Professional UI**: Ant Design table with sorting and pagination

### 🚧 In Development
- **Analytics Dashboard**: Charts and metrics for shift data
- **Geofencing**: Location perimeter validation
- **Shift History**: Detailed time tracking reports
- **Location Management**: Admin tools for site configuration

## 🛡️ Security Features

- **Multi-layer RBAC**: Page, API, and component-level access control
- **Session Validation**: Server-side Auth0 session verification
- **GraphQL Security**: Role-based query/mutation protection
- **Environment Isolation**: Secure environment variable management
- **Error Boundaries**: Graceful error handling and recovery

## 🗄️ Database Schema

```sql
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(CARE_WORKER)
  shifts    Shift[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Location {
  id        String   @id @default(cuid())
  name      String
  latitude  Float
  longitude Float
  radius    Int
  shifts    Shift[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Shift {
  id           String      @id @default(cuid())
  userId       String
  locationId   String
  clockInTime  DateTime    @default(now())
  clockOutTime DateTime?
  status       ShiftStatus @default(CLOCKED_IN)
  totalHours   Float?
  // GPS coordinates and notes...
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Auth0 account and application

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd lief-shift-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env.local` with the following variables:
```bash
# Database
DATABASE_URL="postgresql://..."

# Auth0 Configuration
AUTH0_SECRET="..."
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://your-domain.auth0.com"
AUTH0_CLIENT_ID="..."
AUTH0_CLIENT_SECRET="..."

# Application
APP_BASE_URL="http://localhost:3000"
```

4. **Database Setup**
```bash
# Run Prisma migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

5. **Start Development Server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 👥 User Roles & Access

### Care Worker
- Clock in/out with GPS location
- Add optional shift notes
- View personal shift status
- Access to main dashboard

### Manager
- All Care Worker permissions
- View real-time active staff table
- Access manager-only dashboard
- Monitor workforce in real-time
- (Coming soon: Analytics and reports)

## 🔧 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run build:check  # Full build validation
npx prisma studio    # Open database admin
npx prisma migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run check-locations  # Verify locations exist
npm run deploy-prep  # Prepare for deployment
```

## 🚀 Deployment

This application is ready for production deployment. See `DEPLOYMENT.md` for detailed deployment instructions.

### Quick Deployment Check
```bash
npm run build:check  # Validates types, linting, and build
```

### Deployment Requirements
- Node.js 18+ 
- PostgreSQL database
- Auth0 application configured
- Environment variables set (see `.env.example`)

### Deployment Platforms
- ✅ Vercel (recommended)
- ✅ Netlify 
- ✅ Docker containers
- ✅ Traditional hosting (PM2, etc.)

## 📱 API Endpoints

### Authentication (Auth0)
- `GET /api/auth/login` - Login redirect
- `GET /api/auth/logout` - Logout and clear session
- `GET /api/auth/callback` - Auth0 callback handler

### GraphQL API
- `POST /api/graphql` - Main GraphQL endpoint

### Utility APIs
- `GET /api/user/profile` - Get current user profile
- `POST /api/clock-in` - Clock in with location
- `POST /api/clock-out` - Clock out with location

## 📚 GraphQL Schema

### Queries
```graphql
type Query {
  hello: String                    # Health check
  users: [User!]                   # All users (admin)
  myActiveShift: Shift            # Current user's active shift
  activeShifts: [Shift!]!         # All active shifts (manager only)
}
```

### Types
```graphql
type User {
  id: ID!
  email: String!
  name: String
  role: Role!
  shifts: [Shift!]!
}

type Shift {
  id: ID!
  clockInTime: DateTime!
  clockOutTime: DateTime
  status: ShiftStatus!
  clockInNote: String
  user: User!
  location: Location!
}
```

## 🧪 Testing

The application includes comprehensive testing documentation:
- `DEPLOYMENT.md` - Production deployment testing procedures
- `ACTIVE_STAFF_TESTING.md` - Manager dashboard testing
- Manual testing for all user flows and edge cases

### Testing Approach
- **Unit Testing**: Component-level testing for critical business logic
- **Integration Testing**: API endpoint and database integration testing
- **User Acceptance Testing**: Role-based access control and workflow testing
- **Security Testing**: Authentication and authorization validation

## 📝 Documentation

- `EXAMPLES.md` - Code examples and usage patterns
- `GRAPHQL_IMPLEMENTATION.md` - GraphQL setup and security
- `CLOCK_IN_IMPLEMENTATION.md` - Shift management system
- `RBAC_IMPLEMENTATION.md` - Role-based access control

## 🚦 Project Status

**Current Phase**: Manager Dashboard Development
**Progress**: ~75% Complete
**Next Milestone**: Analytics Dashboard with Chart.js integration

### Completed ✅
- Authentication & RBAC system
- Clock-in/out functionality with GPS
- Manager dashboard with real-time staff monitoring
- GraphQL API with role-based security
- Professional UI with Ant Design

### In Progress 🚧
- Analytics dashboard with charts and metrics
- Geofencing for location validation
- Advanced shift history and reporting

### Planned 📅
- Mobile-responsive enhancements
- Advanced location management
- Notification system
- Shift scheduling features

## 🤝 Contributing

This is a healthcare workforce management system built for compliance and reliability. All contributions should maintain the high security and quality standards established in the codebase.

## 📄 License

This project is part of the Lief healthcare workforce management solution.

---

**Built with ❤️ for healthcare workers and administrators**
