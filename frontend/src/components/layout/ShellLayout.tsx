import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const menu = {
  ADMIN: ["/admin", "/goals", "/reviews", "/feedback", "/notifications", "/users"],
  MANAGER: ["/manager", "/goals", "/reviews", "/feedback", "/notifications"],
  EMPLOYEE: ["/employee", "/goals", "/reviews", "/feedback", "/notifications"]
};

export function ShellLayout() {
  const { user, logout } = useAuth();
  const firstRole = user?.roles[0] ?? "EMPLOYEE";
  const links = menu[firstRole as keyof typeof menu];

  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="bg-slate-900 text-white p-4">
        <h2 className="font-semibold">PMS</h2>
        <p className="text-xs text-slate-300 mt-1">{user?.name}</p>
        <nav className="mt-4 space-y-2 text-sm">
          {links.map((path) => <Link key={path} className="block hover:text-cyan-300" to={path}>{path.replace("/", "") || "home"}</Link>)}
        </nav>
        <button className="mt-6 text-xs border border-slate-500 px-2 py-1 rounded" onClick={logout}>Logout</button>
      </aside>
      <main className="p-6"><Outlet /></main>
    </div>
  );
}
