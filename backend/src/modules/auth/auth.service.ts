import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../db/prisma.js";
import { env } from "../../config/env.js";
import { ConflictError, UnauthorizedError } from "../../errors/AppError.js";
import type { LoginInput, SignupInput } from "./auth.schemas.js";

export const AUTH_COOKIE_NAME = "token";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "1h";

export interface AuthTokenPayload {
  sub: string;
}

function toPublicUser(user: { id: string; username: string; email: string }) {
  return { id: user.id, username: user.username, email: user.email };
}

function signToken(userId: string): string {
  const payload: AuthTokenPayload = { sub: userId };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
  });

  if (existing) {
    const field = existing.email === input.email ? "email" : "username";
    throw new ConflictError(`This ${field} is already in use`, { field });
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { username: input.username, email: input.email, passwordHash },
  });

  return { user: toPublicUser(user), token: signToken(user.id) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Same error for "no such user" and "wrong password" so a caller can't
  // use this endpoint to find out which emails are registered.
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new UnauthorizedError("Invalid email or password");
  }

  return { user: toPublicUser(user), token: signToken(user.id) };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toPublicUser(user) : null;
}
