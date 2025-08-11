/**
 * Active Staff Table - Testing Guide
 * 
 * This document provides instructions for testing the Active Staff monitoring feature.
 */

## Testing the Active Staff Table Feature

### Prerequisites
1. Make sure you're logged in as a MANAGER role user
2. Have at least one care worker clocked in to see data
3. Navigate to `/dashboard/manager`

### What You Should See

#### 1. **Manager Dashboard Access**
- Only users with MANAGER role can access `/dashboard/manager`
- Non-manager users should be redirected to home page

#### 2. **Active Staff Table**
- Replaces the previous "Staff Monitoring Coming Soon" placeholder
- Shows real-time data of currently clocked-in staff
- Auto-refreshes every 30 seconds

#### 3. **Table Columns**
- **Staff Member**: Shows name and email
- **Location**: Location where they clocked in
- **Clock-In Time**: Relative time (e.g., "2h 15m ago") with actual time
- **Clock-In Note**: Any note provided during clock-in
- **Status**: Shows "ACTIVE" for all clocked-in staff

#### 4. **Features**
- Loading state with spinner
- Error handling with retry button
- Empty state when no one is clocked in
- Sortable by clock-in time
- Pagination (if more than 10 active staff)
- Mobile responsive

### Testing Scenarios

#### Scenario 1: No Active Staff
- When no care workers are clocked in
- Should show "No staff currently clocked in"

#### Scenario 2: With Active Staff
1. Clock in as a care worker (different user)
2. Navigate back to manager dashboard
3. Should see the active staff in the table

#### Scenario 3: Role-Based Security
1. Try accessing `/api/graphql` with `activeShifts` query as a non-manager
2. Should return "Access denied. Manager role required to view active staff"

#### Scenario 4: Real-time Updates
1. Leave manager dashboard open
2. Have care worker clock in/out from different browser
3. Table should update within 30 seconds

### GraphQL Query Test
You can test the backend directly by calling:
```graphql
query {
  activeShifts {
    id
    clockInTime
    clockInNote
    user {
      name
      email
    }
    location {
      name
    }
  }
}
```

### Troubleshooting

#### "Access denied" Error
- Ensure you're logged in as a MANAGER role user
- Check the user role in the database

#### Empty Table
- Ensure at least one care worker is clocked in
- Check shift status is 'CLOCKED_IN' in database

#### GraphQL Errors
- Check browser console for detailed error messages
- Verify GraphQL endpoint is working at `/api/graphql`

This completes Task 2: Active Staff Monitoring Table implementation!
