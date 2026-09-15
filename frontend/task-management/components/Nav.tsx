"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Nav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-(--border) bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <CheckCircle2 className="h-5 w-5 text-(--accent)" strokeWidth={2.25} />
          Tasks
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-(--muted)">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-(--accent) text-xs font-medium text-(--accent-foreground)">
                {user.username.slice(0, 1).toUpperCase()}
              </span>
              {user.username}
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="rounded-md p-1.5 text-(--muted) transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
