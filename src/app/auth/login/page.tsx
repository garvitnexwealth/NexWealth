"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-6">
        <div className="card w-full p-8">
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">Login to continue tracking your wealth.</p>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="mt-6 w-full rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-ink-950"
          >
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-ink-800" />
            or
            <span className="h-px flex-1 bg-ink-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-ink-800 bg-ink-850 px-4 py-3 text-sm"
              required
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-ink-800 bg-ink-850 px-4 py-3 text-sm"
              required
            />
            {error && <p className="text-sm text-rose-300">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-full bg-teal-400 px-4 py-3 text-sm font-semibold text-ink-950"
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            New here?{" "}
            <Link href="/auth/register" className="text-teal-300">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
