"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ApiError, attendanceApi } from "@/lib/api";
import { formatDate, formatDateTime, formatDuration } from "@/lib/format";

function AttendancePage() {
  const { user } = useAuth();
  const employeeId = user?.employeeId ?? null;
  const isAdmin = user?.role === "ADMIN";
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [employeeLookup, setEmployeeLookup] = useState("");

  const loadAttendance = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const query = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      if (isAdmin) {
        const response = await attendanceApi.list(query);
        setRecords(Array.isArray(response) ? response : []);
        setTodayAttendance(null);
      } else if (employeeId) {
        const [today, history] = await Promise.all([
          attendanceApi.today(),
          attendanceApi.byEmployee(employeeId, query),
        ]);

        setTodayAttendance(today);
        setRecords(Array.isArray(history) ? history : []);
      } else {
        setTodayAttendance(null);
        setRecords([]);
      }

      setStatus("success");
    } catch (requestError) {
      setError(requestError);
      setStatus("error");
    }
  }, [employeeId, endDate, isAdmin, startDate]);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) {
        void loadAttendance();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadAttendance]);

  const handleCheckIn = async () => {
    try {
      await attendanceApi.checkIn();
      await loadAttendance();
    } catch (requestError) {
      setError(requestError);
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceApi.checkOut();
      await loadAttendance();
    } catch (requestError) {
      setError(requestError);
    }
  };

  const filteredAdminRecords = useMemo(() => {
    const query = employeeLookup.trim().toLowerCase();

    if (!query) {
      return records;
    }

    return records.filter((record) => {
      const employeeName = record.employee?.user?.name?.toLowerCase() ?? "";
      const employeeId = record.employeeId?.toLowerCase() ?? "";

      return employeeName.includes(query) || employeeId.includes(query);
    });
  }, [employeeLookup, records]);

  return (
    <main className="px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="bg-white/5">
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
              <CardDescription>
                Check in and out from your employee session, or audit company attendance as an administrator.
              </CardDescription>
            </CardHeader>
            <CardBody className="gap-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Today</p>
                <p className="mt-2 text-sm text-white">
                  {employeeId
                    ? todayAttendance
                      ? todayAttendance.checkOut
                        ? "Checked out"
                        : "Checked in"
                      : "No attendance record yet"
                    : "Admin attendance actions are not available"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {todayAttendance ? `In ${formatDateTime(todayAttendance.checkIn)}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleCheckIn} disabled={!employeeId}>
                  Check in
                </Button>
                <Button variant="secondary" onClick={handleCheckOut} disabled={!employeeId}>
                  Check out
                </Button>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                  {formatError(error)}
                </div>
              ) : null}
            </CardBody>
          </Card>

          <Card className="bg-slate-950/80">
            <CardHeader>
              <CardTitle>{isAdmin ? "Company attendance" : "My attendance history"}</CardTitle>
              <CardDescription>
                Date filters apply to the current query returned by the backend.
              </CardDescription>
            </CardHeader>
            <CardBody className="grid gap-3 sm:grid-cols-2">
              <Input label="Start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              <Input label="End date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />

              {isAdmin ? (
                <Input
                  label="Employee lookup"
                  placeholder="Name or employee ID"
                  value={employeeLookup}
                  onChange={(event) => setEmployeeLookup(event.target.value)}
                  containerClassName="sm:col-span-2"
                />
              ) : null}

              <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                {isAdmin
                  ? "Administrators can audit attendance records across the business."
                  : "Employees can use the buttons on the left and review their own history here."}
              </div>
            </CardBody>
            <CardFooter className="justify-between">
              <p className="text-sm text-slate-400">
                {status === "loading" ? "Loading attendance..." : `${filteredAdminRecords.length} records shown`}
              </p>
              <Button variant="secondary" size="sm" onClick={loadAttendance} disabled={status === "loading"}>
                Refresh
              </Button>
            </CardFooter>
          </Card>
        </section>

        <Card className="bg-white/5">
          <CardHeader>
            <CardTitle>Attendance records</CardTitle>
            <CardDescription>Chronological records from the attendance endpoints.</CardDescription>
          </CardHeader>
          <CardBody>
            {filteredAdminRecords.length > 0 ? (
              filteredAdminRecords.map((record) => (
                <article key={record.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">
                        {formatDate(record.date)} · {record.employee?.user?.name ?? record.employeeId}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">Employee ID: {record.employeeId}</p>
                    </div>
                    <span className="text-sm text-slate-300">{formatDuration(record.checkIn, record.checkOut)}</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Check in {formatDateTime(record.checkIn)} · Check out {record.checkOut ? formatDateTime(record.checkOut) : "—"}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
                No attendance records available for the selected filters.
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </main>
  );
}

function formatError(error) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load attendance.";
}

export default AttendancePage;