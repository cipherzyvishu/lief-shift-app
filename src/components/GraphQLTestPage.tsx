'use client';

import { useState } from 'react';
import { Card, Button, Space, Typography, Alert, Spin } from 'antd';

const { Title, Text, Paragraph } = Typography;

export default function GraphQLTestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async (testName: string, query: string) => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      
      setTestResult({
        testName,
        success: response.ok && !result.errors,
        status: response.status,
        data: result.data,
        errors: result.errors,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    {
      name: 'Basic Connection Test',
      query: 'query { hello }',
      description: 'Tests if GraphQL server is responding'
    },
    {
      name: 'My Active Shift (Authenticated)',
      query: `
        query MyActiveShift {
          myActiveShift {
            id
            clockInTime
            clockOutTime
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
      description: 'Tests the secure myActiveShift query - requires authentication'
    },
    {
      name: 'Users Query',
      query: 'query { users { id email name role } }',
      description: 'Tests the users query (not secured)'
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>🧪 GraphQL API Test Suite</Title>
      
      <Card style={{ marginBottom: '24px' }}>
        <Title level={4}>Test Your Secure GraphQL Implementation</Title>
        <Paragraph>
          Use these tests to verify that your GraphQL API is working correctly with Auth0 authentication.
          Make sure you're logged in to test authenticated queries.
        </Paragraph>
      </Card>

      <Space direction="vertical" style={{ width: '100%' }}>
        {tests.map((test, index) => (
          <Card 
            key={index}
            title={test.name}
            extra={
              <Button 
                type="primary" 
                onClick={() => runTest(test.name, test.query)}
                loading={loading}
              >
                Run Test
              </Button>
            }
          >
            <Text>{test.description}</Text>
          </Card>
        ))}
      </Space>

      {loading && (
        <Card style={{ marginTop: '24px', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Running GraphQL test...</Text>
          </div>
        </Card>
      )}

      {error && (
        <Alert
          message="Test Error"
          description={error}
          type="error"
          style={{ marginTop: '24px' }}
          showIcon
        />
      )}

      {testResult && (
        <Card 
          title={`Test Results: ${testResult.testName}`} 
          style={{ marginTop: '24px' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Status: </Text>
              <Text type={testResult.success ? 'success' : 'danger'}>
                {testResult.success ? '✅ PASSED' : '❌ FAILED'}
              </Text>
            </div>
            
            <div>
              <Text strong>HTTP Status: </Text>
              <Text>{testResult.status}</Text>
            </div>
            
            <div>
              <Text strong>Timestamp: </Text>
              <Text>{new Date(testResult.timestamp).toLocaleString()}</Text>
            </div>

            {testResult.data && (
              <div>
                <Text strong>Data:</Text>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  marginTop: '8px'
                }}>
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            )}

            {testResult.errors && (
              <div>
                <Text strong>Errors:</Text>
                <pre style={{ 
                  background: '#fff2f0', 
                  padding: '12px', 
                  borderRadius: '4px',
                  color: '#cf1322',
                  overflow: 'auto',
                  marginTop: '8px'
                }}>
                  {JSON.stringify(testResult.errors, null, 2)}
                </pre>
              </div>
            )}
          </Space>
        </Card>
      )}

      <Card style={{ marginTop: '24px' }} title="Manual Testing Tips">
        <Space direction="vertical">
          <div>
            <Text strong>✅ Authentication Test:</Text>
            <Text> Try the "My Active Shift" test while logged in, then logout and try again - it should fail with authentication error</Text>
          </div>
          <div>
            <Text strong>🔍 Browser DevTools:</Text>
            <Text> Open F12 → Console and run `await window.testGraphQL()` for detailed testing</Text>
          </div>
          <div>
            <Text strong>🎯 GraphQL Playground:</Text>
            <Text> Visit `/api/graphql` in a new tab for the Apollo Server GraphQL playground</Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}
