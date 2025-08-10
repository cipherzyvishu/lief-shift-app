import { auth0 } from "@/lib/auth0";
import UserSync from "@/components/UserSync";
import ClockInControls from "@/components/ClockInControls";
import ActiveShiftDisplay from "@/components/ActiveShiftDisplay";
import './globals.css';

export default async function Home() {
  // Fetch the user session
  const session = await auth0.getSession();

  // If no session, show sign-up and login buttons
  if (!session) {
    return (
      <main>
        <a href="/auth/login?screen_hint=signup">
          <button className="bg-amber-300 border-2 border-amber-500 rounded-2xl">Sign up</button>
        </a>
        <a href="/auth/login">
          <button className="bg-amber-300 border-2 border-amber-500 rounded-2xl">Log in</button>
        </a>
      </main>
    );
  }

  // If session exists, show a welcome message and logout button
  return (
    <main>
      <h1>Welcome, {session.user.name}!</h1>
      <UserSync />
      
      {/* Display current active shift using secure GraphQL */}
      <ActiveShiftDisplay />
      
      {/* Clock In/Out Feature */}
      <ClockInControls />
      
      <p>
        <a href="/auth/logout">
          <button className="bg-amber-300 border-2 border-amber-500 rounded-2xl">Log out</button>
        </a>
      </p>
    </main>
  );
}