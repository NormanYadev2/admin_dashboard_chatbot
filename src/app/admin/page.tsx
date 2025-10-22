import React from "react";

export default function AdminHomePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Welcome to the Admin Dashboard</h1>
      <p className="text-gray-700">
        For now only leads and usage pages are available.
        
      </p>
      <p className="text-gray-700 mt-2">
        Leads: view the users who have submitted inquiries.
        
      </p>
      <p className="text-gray-700 mt-2">
        Usage: monitor API usage statistics.
      </p>
    </div>
  );
}
