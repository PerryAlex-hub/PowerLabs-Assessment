"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Pencil, Trash2 } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { StatusBadge } from "@/components/StatusBadge";
import { ApiError, tasksApi } from "@/lib/api";
import type { Task } from "@/lib/types";

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <RequireAuth>
      <TaskDetail id={id} />
    </RequireAuth>
  );
}

function TaskDetail({ id }: { id: string }) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasksApi
      .get(id)
      .then(({ task }) => setTask(task))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this task? This can't be undone.")) return;
    await tasksApi.remove(id);
    router.push("/");
  }

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-8">
      <Link href="/" className="mb-6 flex items-center gap-1.5 text-sm text-(--muted) hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to tasks
      </Link>

      {loading && <div className="h-40 animate-pulse-fade rounded-2xl border border-(--border) bg-(--surface)" />}
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">{error}</p>}

      {task && (
        <div className="flex flex-col gap-5 rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-semibold">{task.title}</h1>
            <StatusBadge status={task.status} />
          </div>

          {task.description && <p className="whitespace-pre-wrap text-sm leading-relaxed text-(--muted)">{task.description}</p>}

          <div className="flex flex-col gap-2 border-t border-(--border) pt-4 text-sm text-(--muted)">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "— no due date"}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Created {new Date(task.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Link
              href={`/tasks/${task.id}/edit`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-(--border) px-4 py-2.5 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
