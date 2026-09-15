"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
      <div className="mx-auto w-full max-w-lg px-6 py-8">
        <Link href="/" className="mb-6 flex items-center gap-1.5 text-sm text-(--muted) hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to tasks
        </Link>
        <h1 className="mb-6 text-xl font-semibold">New task</h1>
        <TaskForm onSubmit={handleCreate} submitLabel="Create task" />
      </div>
    </RequireAuth>
  );
}
