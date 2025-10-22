"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // redirect logged-in users to /admin
    const token = document.cookie.split("; ").find(c => c.startsWith("token="));
    if (token) router.push("/admin");
    else router.push("/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
