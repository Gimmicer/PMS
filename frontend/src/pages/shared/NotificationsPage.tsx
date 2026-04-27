import { useEffect, useState } from "react";
import { api } from "../../api/client";

export function NotificationsPage() {
  const [items, setItems] = useState<unknown[]>([]);
  useEffect(() => { api.get("/notifications").then((res) => setItems(res.data)); }, []);
  return <div><h1 className="text-2xl font-semibold">Notifications</h1><pre>{JSON.stringify(items, null, 2)}</pre></div>;
}
