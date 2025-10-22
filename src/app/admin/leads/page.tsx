"use client";
import { useEffect, useState } from "react";

interface Lead {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then(res => res.json())
      .then(data => {
        setLeads(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching leads:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading leads...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Leads</h1>
      {leads.length === 0 ? (
        <p>No leads found.</p>
      ) : (
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Message</th>
              <th className="border p-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id}>
                <td className="border p-2">{lead.name}</td>
                <td className="border p-2">{lead.email}</td>
                <td className="border p-2">{lead.message}</td>
                <td className="border p-2">
                  {new Date(lead.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
