import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Route } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
}

export function ProtectedRoute({
  path,
  component: Component,
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : user ? (
        <Component />
      ) : null}
    </Route>
  );
}
