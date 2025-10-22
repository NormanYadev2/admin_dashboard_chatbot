import React from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between shadow">
        <div className="flex items-center space-x-6">
          <h1 className="text-lg font-semibold tracking-wide">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <Link
              href="/admin"
              className="hover:bg-blue-500 px-3 py-1 rounded transition-colors"
            >
              Home
            </Link>
            <Link
              href="/admin/leads"
              className="hover:bg-blue-500 px-3 py-1 rounded transition-colors"
            >
              Leads
            </Link>
            <Link
              href="/admin/usage"
              className="hover:bg-blue-500 px-3 py-1 rounded transition-colors"
            >
              Usage
            </Link>
          </div>
        </div>

        <form action="/api/logout" method="POST">
          <button
            type="submit"
            className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 font-medium transition-colors"
          >
            Logout
          </button>
        </form>
      </nav>

      {/* PAGE CONTENT */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
