"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

function RouteGuard({ children, requiredRoles = [], redirectTo = "/login", allowUnauthenticated = false }) {
  const router = useRouter();
  const { isReady, isAuthenticated, user, signOut } = useAuth();

  const hasRequiredRole = requiredRoles.length === 0 || Boolean(user?.role && requiredRoles.includes(user.role));

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated && !allowUnauthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (isAuthenticated && requiredRoles.length > 0 && !hasRequiredRole) {
      router.replace("/dashboard");
    }
  }, [allowUnauthenticated, hasRequiredRole, isAuthenticated, isReady, redirectTo, requiredRoles.length, router]);

  if (!isReady) {
    return <FullScreenState title="Loading secure workspace" description="Restoring your session and validating access." />;
  }

  if (!isAuthenticated && !allowUnauthenticated) {
    return <FullScreenState title="Redirecting to login" description="Your session is required to open this page." />;
  }

  if (isAuthenticated && requiredRoles.length > 0 && !hasRequiredRole) {
    return (
      <FullScreenState
        title="Admin access required"
        description="This route is reserved for administrators. You can return to the dashboard or sign out first."
        action={
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => router.replace("/dashboard")}>
              Back to dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                signOut();
                router.replace("/login");
              }}
            >
              Sign out
            </Button>
          </div>
        }
      />
    );
  }

  return children;
}

function FullScreenState({ title, description, action }) {
  return (
    <div className="grid min-h-screen place-items-center px-6 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {action ? <CardFooter>{action}</CardFooter> : <CardBody />}
      </Card>
    </div>
  );
}

export { RouteGuard };