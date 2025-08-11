import RBACTester from '@/components/RBACTester';
import { auth0 } from '@/lib/auth0';

export default async function RBACTestPage() {
  const session = await auth0.getSession();

  return (
    <div>
      <div style={{ padding: '16px', background: '#f0f2f5', textAlign: 'center' }}>
        {session ? (
          <span>✅ Authenticated as: <strong>{session.user.name || session.user.email}</strong></span>
        ) : (
          <span>❌ Not authenticated - <a href="/auth/login">Login here</a></span>
        )}
      </div>
      <RBACTester />
    </div>
  );
}
