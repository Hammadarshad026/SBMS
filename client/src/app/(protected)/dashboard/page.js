"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ApiError, attendanceApi, employeesApi, financialsApi, tasksApi } from "@/lib/api";
import { formatCurrency, formatDate, formatDateTime, formatDuration } from "@/lib/format";

function DashboardPage() {
  const { user } = useAuth();
  const [state, setState] = useState({
    status: "loading",
    error: null,
    employees: [],
    tasks: [],
    attendance: [],
    summary: null,
    todayAttendance: null,
  });

  const loadDashboard = useCallback(async () => {
    setState((current) => ({ ...current, status: "loading", error: null }));

    try {
      const [employees, tasks, attendance, summary, todayAttendance] = await Promise.all([
        employeesApi.list(),
        tasksApi.list(),
        attendanceApi.list(),
        financialsApi.summary(),
        user?.employeeId ? attendanceApi.today() : Promise.resolve(null),
      ]);

      setState({
        status: "success",
        error: null,
        employees: Array.isArray(employees) ? employees : [],
        tasks: Array.isArray(tasks) ? tasks : [],
        attendance: Array.isArray(attendance) ? attendance : [],
        summary,
        todayAttendance,
      });
    } catch (requestError) {
      setState((current) => ({
        ...current,
        status: "error",
        error: requestError,
      }));
    }
  }, [user?.employeeId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const metrics = useMemo(() => {
    const totalEmployees = state.employees.length;
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter((task) => task.status === "COMPLETED").length;
    const pendingTasks = state.tasks.filter((task) => task.status === "PENDING").length;

    return [
      { label: "Employees", value: totalEmployees.toString(), detail: "Registered users with employee profiles" },
      { label: "Tasks", value: totalTasks.toString(), detail: `${pendingTasks} pending · ${completedTasks} completed` },
      {
        label: "Net profit",
        value: state.summary ? formatCurrency(state.summary.netProfit) : "—",
        detail: state.summary ? `${formatCurrency(state.summary.totalSales)} revenue` : "Waiting for financial summary",
      },
    ];
  }, [state.employees.length, state.summary, state.tasks]);

  const recentTasks = state.tasks.slice(0, 4);
  const recentAttendance = state.attendance.slice(0, 4);

  return (
    <main className="px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section id="overview" className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="bg-white/5">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle>Operational dashboard</CardTitle>
                  <CardDescription>
                    Live data from employees, attendance, tasks, and finance. The shell now reflects the backend state.
                  </CardDescription>
                </div>
                <Button variant="secondary" size="sm" onClick={loadDashboard} disabled={state.status === "loading"}>
                  {state.status === "loading" ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </CardHeader>

            <CardBody className="grid gap-3 md:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-2xl font-semibold text-white">{metric.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{metric.detail}</p>
                </div>
              ))}
            </CardBody>

            <CardFooter className="justify-between">
              <p className="text-sm text-slate-400">
                Signed in as <span className="text-white">{user?.name ?? "User"}</span> · {user?.role ?? "Role unknown"}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/employees">Employees</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/tasks">Tasks</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/attendance">Attendance</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="bg-slate-950/80">
            <CardHeader>
              <CardTitle>Today at a glance</CardTitle>
              <CardDescription>
                Quick status for attendance and operations based on the authenticated session.
              </CardDescription>
            </CardHeader>
            <CardBody className="gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Attendance</p>
                <p className="mt-2 text-sm text-white">
                  {user?.employeeId
                    ? state.todayAttendance
                      ? state.todayAttendance.checkOut
                        ? "Checked in and out today"
                        : "Checked in today"
                      : "No attendance record yet today"
                    : "Admin accounts do not track attendance actions"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {state.todayAttendance ? formatDateTime(state.todayAttendance.checkIn) : ""}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Finance</p>
                <p className="mt-2 text-sm text-white">
                  {state.summary
                    ? `Sales ${formatCurrency(state.summary.totalSales)} · Expenses ${formatCurrency(state.summary.totalExpenses)}`
                    : "Summary unavailable"}
                </p>
                <p className="mt-1 text-xs text-slate-400">Financials require admin access.</p>
              </div>

              {state.error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                  {formatError(state.error)}
                </div>
              ) : null}
            </CardBody>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="bg-white/5">
            <CardHeader>
              <CardTitle>Recent tasks</CardTitle>
              <CardDescription>Current workload and status distribution from the tasks endpoint.</CardDescription>
            </CardHeader>
            <CardBody>
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{task.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{task.description || "No description provided"}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200">
                        {task.status}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      Due {formatDate(task.deadline)} · Assigned to {task.employee?.user?.name ?? task.assignedTo}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState title="No tasks yet" description="Create a task from the tasks page to populate this section." />
              )}
            </CardBody>
          </Card>

          <Card className="bg-white/5">
            <CardHeader>
              <CardTitle>Recent attendance</CardTitle>
              <CardDescription>The latest attendance records returned by the backend.</CardDescription>
            </CardHeader>
            <CardBody>
              {recentAttendance.length > 0 ? (
                recentAttendance.map((record) => (
                  <div key={record.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{formatDate(record.date)}</p>
                        <p className="mt-1 text-sm text-slate-400">Employee {record.employeeId}</p>
                      </div>
                      <span className="text-xs text-slate-400">{formatDuration(record.checkIn, record.checkOut)}</span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      In {formatDateTime(record.checkIn)} · Out {record.checkOut ? formatDateTime(record.checkOut) : "—"}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState title="No attendance yet" description="Attendance history will appear once employees check in." />
              )}
            </CardBody>
          </Card>
        </section>
      </div>
    </main>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-6 text-center">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
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

  return "Unable to load dashboard data.";
}