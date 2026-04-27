import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { z } from "zod";

const loginFormSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export function LoginPage() {
  const { login, getDefaultRoute } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@pms.local");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = loginFormSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form input");
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);
      nav(getDefaultRoute(user.roles));
    } catch {
      setError("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form className="bg-white p-6 rounded shadow w-80" onSubmit={submit}>
        <h1 className="text-xl font-semibold mb-4">Login</h1>
        <input className="border w-full p-2 mb-3" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input className="border w-full p-2 mb-3" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
        {error ? <p className="text-red-600 text-sm mb-3">{error}</p> : null}
        <button disabled={submitting} className="bg-slate-900 text-white w-full p-2 rounded disabled:opacity-60">
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
