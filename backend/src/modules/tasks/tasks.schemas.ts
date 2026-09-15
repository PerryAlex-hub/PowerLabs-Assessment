import { z } from "zod";

const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional(),
  status: taskStatusSchema.optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskIdParamSchema = z.object({
  id: z.string().uuid("Invalid task id"),
});

export const listTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  sort: z.enum(["dueDate", "createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
