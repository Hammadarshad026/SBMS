"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RouteGuard } from "@/components/auth/route-guard";
import { employeesApi } from "@/lib/api";

const defaultForm = {
  name: "",
  email: "",
  password: "",
  role: "EMPLOYEE",
  position: "",
  salary: "",
};

function SignupPageInner() {
  const [form, setForm] = useState(defaultForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      await employeesApi.create({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        position: form.position,
        salary: Number(form.salary),
      });

      setForm(defaultForm);
      setStatus("success");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create employee.");
      setStatus("error");
    }
  }

  return (
    <Card className="w-full max-w-2xl border-white/10 bg-slate-950/80">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Admin onboarding</CardTitle>
          <CardDescription>
            Create a new employee account. The backend will create both the user and employee records in one transaction.
          </CardDescription>
        </CardHeader>

        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            placeholder="Ava Patel"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            placeholder="ava@company.com"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Role</span>
            <select
              className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/15"
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            >
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
          <Input
            label="Position"
            placeholder="Operations Associate"
            value={form.position}
            onChange={(event) => setForm((current) => ({ ...current, position: event.target.value }))}
          />
          <Input
            label="Salary"
            type="number"
            step="0.01"
            min="0"
            placeholder="4500"
            value={form.salary}
            onChange={(event) => setForm((current) => ({ ...current, salary: event.target.value }))}
          />

          {error ? (
            <div className="sm:col-span-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
        </CardBody>

        <CardFooter className="flex-col items-stretch sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            Users created here can sign in immediately with the password entered above.
          </p>
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === "loading"}>
            {status === "loading" ? "Creating employee..." : "Create employee"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <RouteGuard requiredRoles={["ADMIN"]}>
      <SignupPageInner />
    </RouteGuard>
  );
}