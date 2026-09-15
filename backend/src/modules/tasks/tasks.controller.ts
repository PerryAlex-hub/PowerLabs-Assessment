import type { Request, Response } from "express";
import * as tasksService from "./tasks.service.js";
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "./tasks.schemas.js";

export async function list(req: Request, res: Response) {
  // validate() has already parsed req.query into this shape, with defaults applied.
  const query = req.query as unknown as ListTasksQuery;
  const tasks = await tasksService.listTasks(req.userId as string, query);
  res.json({ tasks });
}

export async function getOne(req: Request, res: Response) {
  // validate() has already confirmed req.params.id is a single UUID string.
  const task = await tasksService.getTask(req.userId as string, req.params.id as string);
  res.json({ task });
}

export async function create(req: Request, res: Response) {
  const task = await tasksService.createTask(req.userId as string, req.body as CreateTaskInput);
  res.status(201).json({ task });
}

export async function update(req: Request, res: Response) {
  const task = await tasksService.updateTask(
    req.userId as string,
    req.params.id as string,
    req.body as UpdateTaskInput,
  );
  res.json({ task });
}

export async function remove(req: Request, res: Response) {
  await tasksService.deleteTask(req.userId as string, req.params.id as string);
  res.status(204).send();
}
