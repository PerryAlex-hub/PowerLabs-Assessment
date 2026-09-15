"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { TaskForm } from "@/components/TaskForm";
import { ApiError, tasksApi } from "@/lib/api";
import type { Task, TaskInput } from "@/lib/types";

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <RequireAuth>
      <EditTask id={id} />
    </RequireAuth>
  );
}

function EditTask({ id }: { id: string }) {
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

  async function handleUpdate(input: TaskInput) {
    await tasksApi.update(id, input);
    router.push(`/tasks/${id}`);
  }

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-8">
      <Link href={`/tasks/${id}`} className="mb-6 flex items-center gap-1.5 text-sm text-(--muted) hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to task
      </Link>
      <h1 className="mb-6 text-xl font-semibold">Edit task</h1>
      {loading && <div className="h-64 animate-pulse-fade rounded-2xl border border-(--border) bg-(--surface)" />}
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">{error}</p>}
      {task && <TaskForm initialTask={task} onSubmit={handleUpdate} submitLabel="Save changes" />}
    </div>
  );
}
