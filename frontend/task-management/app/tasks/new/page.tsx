"use client";

import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { TaskForm } from "@/components/TaskForm";
import { tasksApi } from "@/lib/api";
import type { TaskInput } from "@/lib/types";

export default function NewTaskPage() {
  const router = useRouter();

  async function handleCreate(input: TaskInput) {
    await tasksApi.create(input);
    router.push("/");
  }

  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-lg p-6">
        <h1 className="mb-6 text-xl font-semibold">New task</h1>
        <TaskForm onSubmit={handleCreate} submitLabel="Create task" />
      </div>
    </RequireAuth>
  );
}
