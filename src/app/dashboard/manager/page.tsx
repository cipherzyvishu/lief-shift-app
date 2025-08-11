import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ManagerDashboard from "@/components/ManagerDashboard";

export default async function ManagerPage() {
  // Get the user's session
  const session = await auth0.getSession();

  // If no session, redirect to login
  if (!session) {
    redirect('/auth/login');
  }

  // Fetch user's database profile with role information
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    }
  });

  // If user not found in database, redirect to sync
  if (!user) {
    redirect('/api/sync-user?returnTo=/dashboard/manager');
  }

  // RBAC Check: Only MANAGER role can access this page
  if (user.role !== 'MANAGER') {
    console.log(`🚫 Access denied for ${user.email} - Role: ${user.role} (Required: MANAGER)`);
    redirect('/');
  }

  console.log(`✅ Manager dashboard access granted for ${user.email}`);

  return (
    <div>
      <ManagerDashboard user={user} />
    </div>
  );
}
