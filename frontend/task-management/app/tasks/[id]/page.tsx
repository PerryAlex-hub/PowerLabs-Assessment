"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    <div className="mx-auto w-full max-w-lg p-6">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Back to tasks
      </Link>

      {loading && <p className="mt-6 text-zinc-500">Loading…</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      {task && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-semibold">{task.title}</h1>
            <StatusBadge status={task.status} />
          </div>

          {task.description && <p className="whitespace-pre-wrap text-zinc-700">{task.description}</p>}

          <dl className="grid grid-cols-2 gap-y-1 text-sm text-zinc-500">
            <dt>Due date</dt>
            <dd>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</dd>
            <dt>Created</dt>
            <dd>{new Date(task.createdAt).toLocaleDateString()}</dd>
          </dl>

          <div className="flex gap-3">
            <Link
              href={`/tasks/${task.id}/edit`}
              className="rounded border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="rounded border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
