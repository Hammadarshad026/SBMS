"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/hooks/use-auth";
import { ApiError, employeesApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";

function EmployeesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [editEmployee, setEditEmployee] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", position: "", salary: "" });
  const [editStatus, setEditStatus] = useState("idle");

  const loadEmployees = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await employeesApi.list();
      setEmployees(Array.isArray(response) ? response : []);
      setStatus("success");
    } catch (requestError) {
      setError(requestError);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) {
        void loadEmployees();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadEmployees]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return employees;
    }

    return employees.filter((employee) => {
      const searchable = [employee.user?.name, employee.user?.email, employee.position, employee.user?.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [employees, search]);

  const openEdit = (employee) => {
    setEditEmployee(employee);
    setEditForm({
      name: employee.user?.name ?? "",
      position: employee.position ?? "",
      salary: employee.salary?.toString?.() ?? String(employee.salary ?? ""),
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editEmployee) {
      return;
    }

    setEditStatus("loading");
    try {
      await employeesApi.update(editEmployee.id, {
        name: editForm.name,
        position: editForm.position,
        salary: Number(editForm.salary),
      });
      setEditEmployee(null);
      setEditStatus("success");
      await loadEmployees();
    } catch (requestError) {
      setEditStatus("error");
      setError(requestError);
    }
  };

  const handleDelete = async (employeeId) => {
    const confirmed = window.confirm("Delete this employee and the linked user account?");
    if (!confirmed) {
      return;
    }

    try {
      await employeesApi.remove(employeeId);
      await loadEmployees();
    } catch (requestError) {
      setError(requestError);
    }
  };

  return (
    <main className="px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <Card className="bg-white/5">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle>Employees</CardTitle>
                <CardDescription>Search, update, and remove employee records from the backend.</CardDescription>
              </div>
              {isAdmin ? (
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/signup">Create employee</Link>
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardBody>
            <Input
              label="Search employees"
              placeholder="Name, email, position, or role"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {error ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {formatError(error)}
              </div>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-2">
              {filteredEmployees.map((employee) => (
                <article key={employee.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{employee.user?.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{employee.user?.email}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                      {employee.user?.role}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoRow label="Position" value={employee.position} />
                    <InfoRow label="Salary" value={formatCurrency(employee.salary)} />
                    <InfoRow label="Created" value={formatDate(employee.createdAt)} />
                    <InfoRow label="Tasks" value={String(employee.tasks?.length ?? 0)} />
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400">
                    ID: {employee.id}
                  </div>

                  {isAdmin ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(employee)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(employee.id)}>
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </CardBody>
          <CardFooter className="justify-between">
            <p className="text-sm text-slate-400">
              {status === "loading" ? "Loading employees..." : `${filteredEmployees.length} of ${employees.length} shown`}
            </p>
            <Button variant="secondary" size="sm" onClick={loadEmployees} disabled={status === "loading"}>
              Refresh
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Modal
        open={Boolean(editEmployee)}
        onClose={() => setEditEmployee(null)}
        title="Edit employee"
        description="Update the linked user name, position, or salary."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditEmployee(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={editStatus === "loading"}>
              {editStatus === "loading" ? "Saving..." : "Save changes"}
            </Button>
          </>
        }
      >
        <form className="grid gap-4" onSubmit={handleUpdate}>
          <Input
            label="Full name"
            value={editForm.name}
            onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
          />
          <Input
            label="Position"
            value={editForm.position}
            onChange={(event) => setEditForm((current) => ({ ...current, position: event.target.value }))}
          />
          <Input
            label="Salary"
            type="number"
            step="0.01"
            value={editForm.salary}
            onChange={(event) => setEditForm((current) => ({ ...current, salary: event.target.value }))}
          />
        </form>
      </Modal>
    </main>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-white">{value || "—"}</p>
    </div>
  );
}

function formatError(error) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load employees.";
}

export default EmployeesPage;