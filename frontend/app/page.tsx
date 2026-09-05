"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user";
import { useLoginMutation } from "@/lib/queries";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLoginMutation();

  useEffect(() => {
    if (user) {
      router.replace(user.role === "ADMIN" ? "/admin/employees" : "/check-in");
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const result = await login.mutateAsync({ email, password });
      const fullUser = await api.getUser(result.user.id);
      setUser(fullUser);
      router.push(fullUser.role === "ADMIN" ? "/admin/employees" : "/check-in");
    } catch {}
  }

  return (
    <div className="flex-1 w-full flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-1">Dexa Attendance</h1>
        <p className="text-sm text-brand-400 mb-6">Sign in to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm border-brand-800 bg-transparent"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm border-brand-800 bg-transparent"
          />
          {login.error && (
            <p className="text-sm text-red-400">
              {login.error instanceof Error
                ? login.error.message
                : "Login failed"}
            </p>
          )}
          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-md bg-brand-600 hover:bg-brand-800 text-white py-2 text-sm disabled:opacity-40"
          >
            {login.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
