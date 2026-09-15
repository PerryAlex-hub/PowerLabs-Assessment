import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import * as authService from "./auth.service.js";
import { AUTH_COOKIE_NAME } from "./auth.service.js";

const COOKIE_MAX_AGE_MS = 60 * 60 * 1000; // matches the JWT's own expiry

function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

export async function signup(req: Request, res: Response) {
  const { user, token } = await authService.signup(req.body);
  setAuthCookie(res, token);
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const { user, token } = await authService.login(req.body);
  setAuthCookie(res, token);
  res.json({ user });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const user = await authService.getUserById(req.userId as string);
  res.json({ user });
}
