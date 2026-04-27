import { useEffect, useState } from "react";
import { api } from "../../api/client";

export function ReviewsPage() {
  const [reviews, setReviews] = useState<unknown[]>([]);
  useEffect(() => { api.get("/reviews").then((res) => setReviews(res.data)); }, []);
  return <div><h1 className="text-2xl font-semibold">Reviews</h1><pre>{JSON.stringify(reviews, null, 2)}</pre></div>;
}
