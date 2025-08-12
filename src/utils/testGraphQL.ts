// Test script for the secure GraphQL API
// This demonstrates how to use the myActiveShift query

const testGraphQLQuery = async () => {
  try {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query TestQueries {
            hello
            myActiveShift {
              id
              clockInTime
              notes
              status
              location {
                name
                address
              }
              user {
                name
                email
              }
            }
          }
        `,
      }),
    });

    const result = await response.json();
    console.log('GraphQL Response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('Error testing GraphQL:', error);
    throw error;
  }
};

// For browser console testing
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).testGraphQL = testGraphQLQuery;
}

export { testGraphQLQuery };
