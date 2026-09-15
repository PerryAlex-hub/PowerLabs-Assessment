"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function Nav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
        <Link href="/" className="font-semibold text-zinc-900">
          Tasks
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-zinc-600">Hi, {user.username}</span>
            <button onClick={handleLogout} className="text-zinc-600 hover:text-zinc-900">
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
