"use client";
import { useEffect, useState } from "react";

interface Usage {
  _id: string;
  model: string;
  openaiTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  userType: string;
  userMessage: string;
  timestamp: string;
}

export default function UsagePage() {
  const [usage, setUsage] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/usage")
      .then((res) => res.json())
      .then((data) => {
        setUsage(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching usage:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading usage data...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">API Usage</h1>
      {usage.length === 0 ? (
        <p>No usage records found.</p>
      ) : (
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Model</th>
              <th className="border p-2 text-left">Prompt</th>
              <th className="border p-2 text-left">Completion</th>
              <th className="border p-2 text-left">Total</th>
              <th className="border p-2 text-left">Message</th>
              <th className="border p-2 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {usage.map((u) => (
              <tr key={u._id}>
                <td className="border p-2">{u.model}</td>
                <td className="border p-2">{u.promptTokens}</td>
                <td className="border p-2">{u.completionTokens}</td>
                <td className="border p-2 font-semibold">{u.totalTokens}</td>
                <td className="border p-2">{u.userMessage}</td>
                <td className="border p-2">
                  {new Date(u.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
