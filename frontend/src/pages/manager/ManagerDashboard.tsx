import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../../api/client";

export function ManagerDashboard() {
  const [data, setData] = useState<{ teamReviews: number; pendingReviews: number } | null>(null);
  useEffect(() => { api.get("/dashboard/manager").then((res) => setData(res.data)); }, []);
  const completed = Math.max((data?.teamReviews ?? 0) - (data?.pendingReviews ?? 0), 0);
  const chartData = [
    { name: "Pending", value: data?.pendingReviews ?? 0, color: "#f59e0b" },
    { name: "Completed", value: completed, color: "#10b981" }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Manager Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Team Reviews</p>
          <p className="text-2xl font-semibold">{data?.teamReviews ?? 0}</p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-slate-500">Pending Approvals</p>
          <p className="text-2xl font-semibold">{data?.pendingReviews ?? 0}</p>
        </div>
      </div>
      <div className="h-72 rounded border bg-white p-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
