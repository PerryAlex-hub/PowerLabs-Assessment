import type { Task, TaskInput, TaskStatus, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    // Sends and stores the auth cookie set by the API, since frontend and
    // backend are on different origins.
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, body?.error?.message ?? "Something went wrong", body?.error?.details);
  }

  return body as T;
}

export const authApi = {
  signup: (input: { username: string; email: string; password: string }) =>
    request<{ user: User }>("/api/auth/signup", { method: "POST", body: JSON.stringify(input) }),
  login: (input: { email: string; password: string }) =>
    request<{ user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify(input) }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ user: User }>("/api/auth/me"),
};

export const tasksApi = {
  list: (params?: { status?: TaskStatus; sort?: "createdAt" | "dueDate"; order?: "asc" | "desc" }) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.sort) search.set("sort", params.sort);
    if (params?.order) search.set("order", params.order);
    const query = search.toString();
    return request<{ tasks: Task[] }>(`/api/tasks${query ? `?${query}` : ""}`);
  },
  get: (id: string) => request<{ task: Task }>(`/api/tasks/${id}`),
  create: (input: TaskInput) => request<{ task: Task }>("/api/tasks", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: TaskInput) =>
    request<{ task: Task }>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  remove: (id: string) => request<void>(`/api/tasks/${id}`, { method: "DELETE" }),
};
