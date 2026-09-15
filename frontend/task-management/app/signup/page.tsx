"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

const inputClasses =
  "rounded-lg border border-(--border) bg-(--surface) px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20";

const labelClasses = "text-xs font-medium uppercase tracking-wide text-(--muted)";

export default function SignupPage() {
  const { user, signup } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup(username, email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <CheckCircle2 className="h-8 w-8 text-(--accent)" strokeWidth={2} />
        <h1 className="text-xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-(--muted)">Start tracking your tasks.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-sm"
      >
        {error && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className={labelClasses}>
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            minLength={3}
            maxLength={30}
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className={labelClasses}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={inputClasses}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-medium text-(--accent-foreground) transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-(--muted)">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-(--accent) hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
