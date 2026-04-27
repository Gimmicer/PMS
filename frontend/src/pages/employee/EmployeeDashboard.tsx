import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../../api/client";

export function EmployeeDashboard() {
  const [data, setData] = useState<{ myGoals: number; myReviews: number } | null>(null);
  useEffect(() => { api.get("/dashboard/employee").then((res) => setData(res.data)); }, []);
  const chartData = [
    { name: "Goals", value: data?.myGoals ?? 0 },
    { name: "Reviews", value: data?.myReviews ?? 0 }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Employee Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {chartData.map((item) => (
          <div key={item.name} className="rounded border bg-white p-4">
            <p className="text-sm text-slate-500">{item.name}</p>
            <p className="text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="h-72 rounded border bg-white p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
