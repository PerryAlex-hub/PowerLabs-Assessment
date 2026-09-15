"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="mx-auto w-full max-w-lg p-6">
      <h1 className="mb-6 text-xl font-semibold">Edit task</h1>
      {loading && <p className="text-zinc-500">Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {task && <TaskForm initialTask={task} onSubmit={handleUpdate} submitLabel="Save changes" />}
    </div>
  );
}
