import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../../api/client";

export function AdminDashboard() {
  const [data, setData] = useState<{ users: number; goals: number; reviews: number } | null>(null);
  useEffect(() => { api.get("/dashboard/admin").then((res) => setData(res.data)); }, []);
  const chartData = data
    ? [
        { name: "Users", value: data.users },
        { name: "Goals", value: data.goals },
        { name: "Reviews", value: data.reviews }
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {chartData.map((item) => (
          <div key={item.name} className="rounded border bg-white p-4">
            <p className="text-sm text-slate-500">{item.name}</p>
            <p className="text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="h-72 rounded border bg-white p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
