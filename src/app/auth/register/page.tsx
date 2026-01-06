"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload?.error ?? "Registration failed");
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Registration succeeded but login failed.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-6">
        <div className="card w-full p-8">
          <h1 className="text-3xl font-semibold">Create your account</h1>
          <p className="mt-2 text-sm text-slate-400">Start building your NexWealth profile.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              type="text"
              placeholder="Name"
              className="w-full rounded-xl border border-ink-800 bg-ink-850 px-4 py-3 text-sm"
            />
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
              placeholder="Password (min 8 chars)"
              className="w-full rounded-xl border border-ink-800 bg-ink-850 px-4 py-3 text-sm"
              required
            />
            {error && <p className="text-sm text-rose-300">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-full bg-teal-400 px-4 py-3 text-sm font-semibold text-ink-950"
            >
              Register
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-teal-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
