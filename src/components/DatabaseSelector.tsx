"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DatabaseInfo {
  name: string;
  displayName: string;
  tenantId: string;
  description: string;
}

export default function DatabaseSelector() {
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/databases");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch databases: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDatabases(data);
    } catch (err) {
      console.error("Error fetching databases:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch databases");
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseSelect = (database: DatabaseInfo, page: 'leads' | 'usage' = 'leads') => {
    // Store selected database in localStorage for the session
    localStorage.setItem("selectedDatabase", JSON.stringify(database));
    
    // Navigate to the specified page for the selected database
    router.push(`/admin/${page}?db=${database.tenantId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error Loading Databases</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={fetchDatabases}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Available Databases</h2>
      
      {databases.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No databases found</div>
          <p className="text-gray-500 text-sm">No tenant databases are currently available.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {databases.map((database) => (
            <div
              key={database.name}
              className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all bg-white group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {database.displayName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {database.description}
                  </p>
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {database.name}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleDatabaseSelect(database, 'leads')}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View Leads
                </button>
                <button
                  onClick={() => handleDatabaseSelect(database, 'usage')}
                  className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  View Usage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-blue-900 font-medium mb-2">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => router.push("/admin/leads")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            View All Leads
          </button>
          <button 
            onClick={() => router.push("/admin/usage")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
          >
            View All Usage
          </button>
        </div>
        <p className="text-blue-700 text-xs mt-2">
          Click a database above to view data for that specific tenant, or use quick actions to view all data.
        </p>
      </div>
    </div>
  );
}