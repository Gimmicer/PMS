import { useEffect, useState } from "react";
import { api } from "../../api/client";

export function GoalsPage() {
  const [goals, setGoals] = useState<unknown[]>([]);
  useEffect(() => { api.get("/goals").then((res) => setGoals(res.data)); }, []);
  return <div><h1 className="text-2xl font-semibold">Goals</h1><pre>{JSON.stringify(goals, null, 2)}</pre></div>;
}
