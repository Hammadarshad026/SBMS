"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";

const initialFormState = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const { signIn, isAuthenticated, isReady } = useAuth();
  const [form, setForm] = useState(initialFormState);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, isReady, nextPath, router]);

  const hints = useMemo(
    () => [
      "Use the email and password assigned from the server seed or an admin-created employee account.",
      "Admins can continue to /signup after logging in to create new employee identities.",
    ],
    [],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      await signIn(form);
      router.replace(nextPath);
    } catch (requestError) {
      setError(formatAuthError(requestError));
      setStatus("error");
    }
  }

  return (
    <Card className="w-full max-w-xl border-white/10 bg-slate-950/80">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Access the dashboard with your employee or administrator credentials.
          </CardDescription>
        </CardHeader>

        <CardBody className="gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="admin@company.com"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />

          {error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
            {hints.map((hint) => (
              <p key={hint}>{hint}</p>
            ))}
          </div>
        </CardBody>

        <CardFooter className="flex-col items-stretch sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === "loading"}>
            {status === "loading" ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-sm text-slate-400">
            Admin onboarding lives in <Link className="text-sky-200 underline-offset-4 hover:underline" href="/signup">/signup</Link>.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

function formatAuthError(error) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to sign in right now.";
}