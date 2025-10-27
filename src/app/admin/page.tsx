"use client";

import React, { useState, useEffect } from "react";
import DatabaseSelector from "@/components/DatabaseSelector";

interface UserInfo {
  role: string;
  tenantId?: string;
  database?: string;
}

export default function AdminHomePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user info from cookie 
    // For now, we'll check by making a request to verify the user's role
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      // Make a simple request to check user role through middleware
      const response = await fetch("/api/leads", { method: "HEAD" });
      const role = response.headers.get("x-user-role");
      const tenantId = response.headers.get("x-user-tenant");
      const database = response.headers.get("x-user-database");
      
      setUserInfo({
        role: role || "unknown",
        tenantId: tenantId || undefined,
        database: database || undefined
      });
    } catch (error) {
      console.error("Error checking user role:", error);
      setUserInfo({ role: "unknown" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Superadmin sees database selector
  if (userInfo?.role === "superadmin") {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2 text-gray-900">
            Superadmin Dashboard
          </h1>
          <p className="text-gray-600">
            Select a database below to view tenant-specific data, or use the navigation menu to view all data across tenants.
          </p>
        </div>
        
        <DatabaseSelector />
      </div>
    );
  }

  // Regular admin sees their tenant info
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2 text-gray-900">
          Admin Dashboard
        </h1>
        {userInfo?.tenantId && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h3 className="text-blue-900 font-medium">Your Tenant Information</h3>
            <p className="text-blue-700 text-sm mt-1">
              <strong>Tenant ID:</strong> {userInfo.tenantId}
            </p>
            {userInfo.database && (
              <p className="text-blue-700 text-sm">
                <strong>Database:</strong> {userInfo.database}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Leads Management</h2>
          <p className="text-gray-600 text-sm mb-4">
            View and manage customer inquiries and leads from your tenant.
          </p>
          <a 
            href="/admin/leads"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            View Leads
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Usage Analytics</h2>
          <p className="text-gray-600 text-sm mb-4">
            Monitor API usage statistics and analytics for your tenant.
          </p>
          <a 
            href="/admin/usage"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
          >
            View Usage
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
