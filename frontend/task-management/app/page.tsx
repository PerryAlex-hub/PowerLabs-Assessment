"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { StatusBadge } from "@/components/StatusBadge";
import { ApiError, tasksApi } from "@/lib/api";
import type { Task, TaskStatus } from "@/lib/types";

const FILTERS: Array<{ value: TaskStatus | ""; label: string }> = [
  { value: "", label: "All" },
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
];

export default function TasksPage() {
  return (
    <RequireAuth>
      <TaskList />
    </RequireAuth>
  );
}

function TaskList() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your tasks</h1>
        <Link href="/tasks/new" className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700">
          New task
        </Link>
      </div>

      <div className="mb-4 flex gap-2 text-sm">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-full px-3 py-1 ${
              statusFilter === filter.value ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Keying by filter remounts this with fresh loading/error state
          instead of resetting it manually inside an effect. */}
      <TaskListResults key={statusFilter} status={statusFilter} />
    </div>
  );
}

function TaskListResults({ status }: { status: TaskStatus | "" }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tasksApi
      .list(status ? { status } : undefined)
      .then(({ tasks }) => setTasks(tasks))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, [status]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this task? This can't be undone.")) return;
    await tasksApi.remove(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  if (loading) return <p className="text-zinc-500">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (tasks.length === 0) return <p className="text-zinc-500">No tasks yet. Create your first one.</p>;

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => {
        const overdue = Boolean(task.dueDate) && task.status !== "DONE" && new Date(task.dueDate as string) < new Date();
        return (
          <li key={task.id} className="flex items-center justify-between rounded border border-zinc-200 bg-white px-4 py-3">
            <Link href={`/tasks/${task.id}`} className="flex flex-1 flex-col gap-1">
              <span className="font-medium">{task.title}</span>
              <span className="flex items-center gap-2 text-xs text-zinc-500">
                <StatusBadge status={task.status} />
                {task.dueDate && (
                  <span className={overdue ? "text-red-600" : ""}>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
              </span>
            </Link>
            <button onClick={() => handleDelete(task.id)} className="text-sm text-zinc-400 hover:text-red-600">
              Delete
            </button>
          </li>
        );
      })}
    </ul>
  );
}
