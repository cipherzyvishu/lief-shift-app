# How to Test the Secure GraphQL API ✅

## 🎯 **READY TO TEST!** Your server is running and test data is set up.

## Quick Start Testing (Recommended)

### 1. 🚀 **Go to Test Page** 
Visit: **http://localhost:3000/test-graphql**

This gives you a comprehensive test suite with buttons to test all GraphQL functionality.

### 2. 🔐 **Make sure you're logged in**
- If not logged in, click the login link at the top
- Use any of these test accounts:
  - `manager@lief.care` (Manager role)
  - `worker@lief.care` (Care Worker role) 
  - `test@test.com` (Your account)

### 3. 🧪 **Run the tests**
- Click "Run Test" on each test case
- **Basic Connection Test**: Should always pass
- **My Active Shift**: Will show `null` if no active shift, or shift data if clocked in
- **Users Query**: Shows all users (not secured)

## Method 1: Browser UI Testing (Easiest)

### ✅ Test the Main App
1. **Go to**: `http://localhost:3000`
2. **Login** with your credentials
3. **Look for**: "Your Active Shift" card
   - Shows "No Active Shift" if you haven't clocked in
   - Shows shift details if you have an active shift

### ✅ Test Clock-in Flow (NOW FULLY FUNCTIONAL!)
1. **Use the clock-in controls** on the main page
2. **Clock in** - This now:
   - ✅ Saves a real shift to PostgreSQL database
   - ✅ Captures your location coordinates
   - ✅ Allows optional notes
   - ✅ Updates the UI immediately
3. **See the "Your Active Shift" card update** with real database data
4. **Clock out** - This now:
   - ✅ Updates the shift in the database with clock-out time
   - ✅ Calculates total hours worked
   - ✅ Captures clock-out location and notes
   - ✅ Removes the active shift from the UI

## Method 2: Browser Console Testing

### ✅ Open Developer Console (F12)
```javascript
// Test the GraphQL API directly
await window.testGraphQL()
```

Expected results:
- **While logged in**: Returns shift data or `null`
- **While logged out**: Returns authentication error

## Method 3: Create Test Shift for Testing

### ✅ Create a test shift for your account:
```bash
# Replace with your email address
npx tsx scripts/test-shift-utils.ts create test@test.com
```

### ✅ Clean up test data:
```bash
npx tsx scripts/test-shift-utils.ts cleanup
```

## Method 4: GraphQL Playground

### ✅ Direct GraphQL Testing
1. **Visit**: `http://localhost:3000/api/graphql`
2. **Try these queries**:

#### Basic Test:
```graphql
query {
  hello
}
```

#### Secure Query (requires login):
```graphql
query MyActiveShift {
  myActiveShift {
    id
    clockInTime
    clockInNote
    status
    location {
      name
      latitude
      longitude
    }
    user {
      name
      email
    }
  }
}
```

## 🔍 What to Look For

### ✅ **Security Working Correctly**
1. **Authenticated requests**: Return data or null
2. **Unauthenticated requests**: Return authentication errors
3. **User isolation**: Only shows YOUR active shift, not others

### ✅ **Data Structure**
- `myActiveShift` returns `null` when no active shift
- When active shift exists, includes:
  - Shift details (id, clockInTime, status)
  - Location info (name, coordinates)
  - User info (name, email)

### ✅ **Error Handling**
- Authentication errors show helpful messages
- Network errors are handled gracefully
- Loading states work properly

## 🎯 Test Scenarios

### Scenario 1: No Active Shift
1. Make sure you're not clocked in
2. Query `myActiveShift`
3. **Expected**: Returns `null`

### Scenario 2: With Active Shift  
1. Clock in using the UI controls
2. Query `myActiveShift`
3. **Expected**: Returns shift data with location

### Scenario 3: Authentication Test
1. Log out of the app
2. Try to query `myActiveShift`
3. **Expected**: Authentication error

### Scenario 4: User Isolation
1. Create shifts for different users
2. Login as different users
3. **Expected**: Each user only sees their own shifts

## 🚨 Troubleshooting

### **GraphQL errors?**
- Check browser console for detailed errors
- Verify you're logged in
- Check the test page: `http://localhost:3000/test-graphql`

### **No shift data?**
- ✅ **NEW**: Use the fully functional clock-in controls on the main page!
- Create a test shift manually: `npx tsx scripts/test-shift-utils.ts create your-email@example.com`

### **Authentication errors?**
- Make sure you're logged in: `http://localhost:3000/auth/login`
- Check session cookies in browser dev tools

## 🎉 Success Indicators

✅ **Authentication working**: Unauthenticated requests fail  
✅ **User isolation working**: Only see your own data  
✅ **Data structure correct**: Matches GraphQL schema  
✅ **UI integration working**: ActiveShiftDisplay shows data  
✅ **Error handling working**: Graceful error messages  

Your secure GraphQL API is fully functional! 🚀
