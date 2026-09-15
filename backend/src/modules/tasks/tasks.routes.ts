import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { validate } from "../../middleware/validate.js";
import { createTaskSchema, listTasksQuerySchema, taskIdParamSchema, updateTaskSchema } from "./tasks.schemas.js";
import * as tasksController from "./tasks.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", validate(listTasksQuerySchema, "query"), tasksController.list);
router.post("/", validate(createTaskSchema), tasksController.create);
router.get("/:id", validate(taskIdParamSchema, "params"), tasksController.getOne);
router.patch("/:id", validate(taskIdParamSchema, "params"), validate(updateTaskSchema), tasksController.update);
router.delete("/:id", validate(taskIdParamSchema, "params"), tasksController.remove);

export default router;
