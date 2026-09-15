"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import type { Task, TaskInput, TaskStatus } from "@/lib/types";

interface TaskFormProps {
  initialTask?: Task;
  onSubmit: (input: TaskInput) => Promise<void>;
  submitLabel: string;
}

const inputClasses =
  "rounded-lg border border-(--border) bg-(--surface) px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20";

const labelClasses = "text-xs font-medium uppercase tracking-wide text-(--muted)";

export function TaskForm({ initialTask, onSubmit, submitLabel }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? "TODO");
  const [dueDate, setDueDate] = useState(initialTask?.dueDate ? initialTask.dueDate.slice(0, 10) : "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description: description || undefined,
        status,
        dueDate: dueDate || undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-sm"
    >
      {error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className={labelClasses}>
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder="What needs to be done?"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className={labelClasses}>
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Add more detail (optional)"
          className={`${inputClasses} resize-none`}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="status" className={labelClasses}>
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className={inputClasses}
          >
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="dueDate" className={labelClasses}>
            Due date
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-medium text-(--accent-foreground) transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
