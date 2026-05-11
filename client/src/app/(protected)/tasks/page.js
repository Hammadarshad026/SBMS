"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/hooks/use-auth";
import { ApiError, employeesApi, tasksApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

const emptyTaskForm = {
  title: "",
  description: "",
  deadline: "",
  assignedTo: "",
  status: "PENDING",
};

function TasksPage() {
  const { user } = useAuth();
  const employeeId = user?.employeeId ?? null;
  const isAdmin = user?.role === "ADMIN";
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [editingTask, setEditingTask] = useState(null);
  const [modalMode, setModalMode] = useState("create");

  const loadData = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const [taskResponse, employeeResponse] = await Promise.all([tasksApi.list(), employeesApi.list()]);
      setTasks(Array.isArray(taskResponse) ? taskResponse : []);
      setEmployees(Array.isArray(employeeResponse) ? employeeResponse : []);
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
        void loadData();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadData]);

  const visibleTasks = useMemo(() => {
    const query = taskSearch.trim().toLowerCase();

    let items = tasks;

    if (!isAdmin && employeeId) {
      items = tasks.filter((task) => task.assignedTo === employeeId);
    }

    if (!query) {
      return items;
    }

    return items.filter((task) => {
      const searchable = [task.title, task.description, task.status, task.employee?.user?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [employeeId, isAdmin, taskSearch, tasks]);

  const openCreate = () => {
    setModalMode("create");
    setTaskForm({ ...emptyTaskForm, deadline: new Date().toISOString().slice(0, 10) });
    setEditingTask(null);
  };

  const openEdit = (task) => {
    setModalMode("edit");
    setEditingTask(task);
    setTaskForm({
      title: task.title ?? "",
      description: task.description ?? "",
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : "",
      assignedTo: task.assignedTo ?? "",
      status: task.status ?? "PENDING",
    });
  };

  const closeModal = () => {
    setEditingTask(null);
    setTaskForm(emptyTaskForm);
  };

  const saveTask = async (event) => {
    event.preventDefault();

    try {
      if (modalMode === "create") {
        await tasksApi.create({
          title: taskForm.title,
          description: taskForm.description,
          deadline: taskForm.deadline,
          assignedTo: taskForm.assignedTo,
        });
      } else if (editingTask) {
        await tasksApi.update(editingTask.id, {
          title: taskForm.title,
          description: taskForm.description,
          deadline: taskForm.deadline,
          assignedTo: taskForm.assignedTo,
          status: taskForm.status,
        });
      }

      closeModal();
      await loadData();
    } catch (requestError) {
      setError(requestError);
    }
  };

  const deleteTask = async (taskId) => {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) {
      return;
    }

    try {
      await tasksApi.remove(taskId);
      await loadData();
    } catch (requestError) {
      setError(requestError);
    }
  };

  const updateTaskStatus = async (task, nextStatus) => {
    try {
      if (isAdmin) {
        await tasksApi.update(task.id, { status: nextStatus });
      } else {
        await tasksApi.updateStatus(task.id, { status: nextStatus });
      }

      await loadData();
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
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  Admins can create and manage tasks. Employees can update the status of tasks assigned to them.
                </CardDescription>
              </div>
              {isAdmin ? <Button onClick={openCreate}>Create task</Button> : null}
            </div>
          </CardHeader>

          <CardBody>
            <Input
              label="Search tasks"
              placeholder="Title, description, status, employee name"
              value={taskSearch}
              onChange={(event) => setTaskSearch(event.target.value)}
            />

            {error ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {formatError(error)}
              </div>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-2">
              {visibleTasks.map((task) => (
                <article key={task.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{task.description || "No description provided"}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                      {task.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoRow label="Deadline" value={formatDate(task.deadline)} />
                    <InfoRow label="Assigned to" value={task.employee?.user?.name ?? task.assignedTo} />
                  </div>

                  {(isAdmin || task.assignedTo === user?.employeeId) ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                      <select
                        className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
                        value={task.status}
                        onChange={(event) => updateTaskStatus(task, event.target.value)}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                      <div className="flex gap-2">
                        {isAdmin ? (
                          <Button variant="secondary" size="sm" onClick={() => openEdit(task)}>
                            Edit
                          </Button>
                        ) : null}
                        {isAdmin ? (
                          <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </CardBody>

          <CardFooter className="justify-between">
            <p className="text-sm text-slate-400">
              {status === "loading" ? "Loading tasks..." : `${visibleTasks.length} tasks shown`}
            </p>
            <Button variant="secondary" size="sm" onClick={loadData} disabled={status === "loading"}>
              Refresh
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Modal
        open={Boolean(modalMode)}
        onClose={closeModal}
        title={modalMode === "create" ? "Create task" : "Edit task"}
        description="Configure title, deadline, assignment, and status in one place."
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={saveTask}>{modalMode === "create" ? "Create task" : "Save task"}</Button>
          </>
        }
      >
        <form className="grid gap-4" onSubmit={saveTask}>
          <Input
            label="Title"
            value={taskForm.title}
            onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
          />
          <Input
            label="Description"
            value={taskForm.description}
            onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
          />
          <Input
            label="Deadline"
            type="date"
            value={taskForm.deadline}
            onChange={(event) => setTaskForm((current) => ({ ...current, deadline: event.target.value }))}
          />
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Assigned employee</span>
            <select
              className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none"
              value={taskForm.assignedTo}
              onChange={(event) => setTaskForm((current) => ({ ...current, assignedTo: event.target.value }))}
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.user?.name} · {employee.position}
                </option>
              ))}
            </select>
          </label>
          {modalMode === "edit" ? (
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-200">Status</span>
              <select
                className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none"
                value={taskForm.status}
                onChange={(event) => setTaskForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </label>
          ) : null}
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

  return "Unable to load tasks.";
}

export default TasksPage;