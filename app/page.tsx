import { HomeScreen } from "@/components/home/HomeScreen";

/**
 * Authentication is enforced by middleware from the HTTP-only session cookie.
 * Keeping this route server-rendered avoids a second, stale client-side auth
 * source such as sessionStorage during login navigation.
 */
export default function RootPage() {
  return <HomeScreen />;
}
