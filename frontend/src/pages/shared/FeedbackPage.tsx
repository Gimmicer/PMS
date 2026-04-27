import { useEffect, useState } from "react";
import { api } from "../../api/client";

export function FeedbackPage() {
  const [feedback, setFeedback] = useState<unknown[]>([]);
  useEffect(() => { api.get("/feedback").then((res) => setFeedback(res.data)); }, []);
  return <div><h1 className="text-2xl font-semibold">Feedback</h1><pre>{JSON.stringify(feedback, null, 2)}</pre></div>;
}
