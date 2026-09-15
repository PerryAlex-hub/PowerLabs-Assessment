import type { TaskStatus } from "@/lib/types";

const LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

const DOT_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-zinc-400",
  IN_PROGRESS: "bg-(--accent)",
  DONE: "bg-emerald-500",
};

const TEXT_COLORS: Record<TaskStatus, string> = {
  TODO: "text-zinc-600 dark:text-zinc-400",
  IN_PROGRESS: "text-(--accent)",
  DONE: "text-emerald-600 dark:text-emerald-400",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${TEXT_COLORS[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[status]}`} />
      {LABELS[status]}
    </span>
  );
}
