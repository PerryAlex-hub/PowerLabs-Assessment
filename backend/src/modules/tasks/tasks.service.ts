import { prisma } from "../../db/prisma.js";
import { NotFoundError } from "../../errors/AppError.js";
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "./tasks.schemas.js";

async function findOwnedTask(userId: string, id: string) {
  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) {
    // 404 rather than 403: a task owned by someone else should look
    // identical to one that doesn't exist at all.
    throw new NotFoundError("Task not found");
  }
  return task;
}

export function listTasks(userId: string, query: ListTasksQuery) {
  return prisma.task.findMany({
    where: { userId, ...(query.status && { status: query.status }) },
    orderBy: { [query.sort]: query.order },
  });
}

export function getTask(userId: string, id: string) {
  return findOwnedTask(userId, id);
}

export function createTask(userId: string, input: CreateTaskInput) {
  return prisma.task.create({ data: { ...input, userId } });
}

export async function updateTask(userId: string, id: string, input: UpdateTaskInput) {
  await findOwnedTask(userId, id);
  return prisma.task.update({ where: { id }, data: input });
}

export async function deleteTask(userId: string, id: string) {
  await findOwnedTask(userId, id);
  await prisma.task.delete({ where: { id } });
}
