import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type RequestPart = "body" | "params" | "query";

export function validate(schema: ZodType, part: RequestPart = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      next(result.error);
      return;
    }
    // req.query is a getter-only property in Express 5, so mutate in place
    // rather than reassigning req[part].
    Object.assign(req[part], result.data);
    next();
  };
}
