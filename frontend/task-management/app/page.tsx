"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Calendar, ClipboardList, Plus, Trash2 } from "lucide-react";
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
    <div className="mx-auto w-full max-w-2xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your tasks</h1>
          <p className="mt-0.5 text-sm text-(--muted)">Keep track of what needs doing.</p>
        </div>
        <Link
          href="/tasks/new"
          className="flex items-center gap-1.5 rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-medium text-(--accent-foreground) transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New task
        </Link>
      </div>

      <div className="mb-6 flex gap-1.5 border-b border-(--border) pb-4 text-sm">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${
              statusFilter === filter.value
                ? "bg-foreground text-background"
                : "text-(--muted) hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

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

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[68px] animate-pulse-fade rounded-xl border border-(--border) bg-(--surface)" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">{error}</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-(--border) px-6 py-16 text-center">
        <ClipboardList className="h-8 w-8 text-(--muted)" strokeWidth={1.5} />
        <div>
          <p className="font-medium">No tasks here</p>
          <p className="mt-1 text-sm text-(--muted)">Create your first task to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} onDelete={() => handleDelete(task.id)} />
      ))}
    </ul>
  );
}

function TaskRow({ task, onDelete }: { task: Task; onDelete: () => void }) {
  const overdue = useMemo(
    () => Boolean(task.dueDate) && task.status !== "DONE" && new Date(task.dueDate as string) < new Date(),
    [task.dueDate, task.status],
  );

  return (
    <li className="group flex items-center gap-3 rounded-xl border border-(--border) bg-(--surface) px-4 py-3.5 transition-colors hover:border-(--accent)/40">
      <Link href={`/tasks/${task.id}`} className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className={`truncate font-medium ${task.status === "DONE" ? "text-(--muted) line-through" : ""}`}>
          {task.title}
        </span>
        <span className="flex items-center gap-3 text-xs">
          <StatusBadge status={task.status} />
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${overdue ? "text-red-600 dark:text-red-400" : "text-(--muted)"}`}>
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          )}
        </span>
      </Link>
      <button
        onClick={onDelete}
        aria-label="Delete task"
        className="rounded-md p-2 text-(--muted) opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 dark:hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
