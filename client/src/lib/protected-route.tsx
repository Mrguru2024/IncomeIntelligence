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

        return <Component />;
      }}
    </Route>
  );
}

export default ProtectedRoute;