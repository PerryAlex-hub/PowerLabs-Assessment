import type { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import { AppError } from "../errors/AppError.js";
import { env } from "../config/env.js";

// Express only treats a middleware as an error handler if it declares all 4 params.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid input", details: z.treeifyError(err) },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: env.NODE_ENV === "production" ? "Something went wrong" : String(err),
    },
  });
}
