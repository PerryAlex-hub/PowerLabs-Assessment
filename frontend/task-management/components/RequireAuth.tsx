"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto w-full max-w-2xl p-6">
        <div className="h-6 w-32 animate-pulse-fade rounded bg-(--border)" />
        <div className="mt-6 flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse-fade rounded-xl bg-(--border)" />
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
