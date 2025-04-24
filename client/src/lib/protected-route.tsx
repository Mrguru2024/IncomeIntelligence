import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Route, Redirect } from 'wouter';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { isLoading, user } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        // If no user, redirect to auth page
        if (!user) {
          return <Redirect to="/auth" />;
        }

        // If user has not completed onboarding, redirect to onboarding page
        // Only exception is if they're already on the onboarding page
        if (!user.onboardingCompleted && path !== '/onboarding') {
          return <Redirect to="/onboarding" />;
        }
        
        // Debug log for guardrails route
        if (path === '/guardrails') {
          console.log("🛡️ RENDERING GUARDRAILS COMPONENT", { path });
        }

        // Return the component with a debug wrapper for guardrails
        return path === '/guardrails' ? (
          <div className="relative">
            <div className="sticky top-0 left-0 right-0 z-50 py-2 px-4 bg-purple-600 text-white text-center font-bold">
              GUARDRAILS PROTECTED ROUTE ACTIVE
            </div>
            <Component />
          </div>
        ) : (
          <Component />
        );
      }}
    </Route>
  );
}

export default ProtectedRoute;