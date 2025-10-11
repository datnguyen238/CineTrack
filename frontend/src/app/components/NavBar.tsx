"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<{ name?: string; user_id?: number } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user_id) setUser(parsed);
      }
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    alert("Logged out!");
    window.location.href = "/login";
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
      {/* App title */}
      <Link href="/main" className="text-2xl font-bold text-blue-400 hover:text-blue-300">
        🎬 CineTrack
      </Link>

      {/* Right side */}
      {user ? (
        <div className="flex items-center gap-5">
          <span className="text-gray-300 font-medium">Hi, {user.name}</span>

          <Link
            href="/my-bookings"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition"
          >
            My Bookings
          </Link>

          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md font-medium transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition"
        >
          Login
        </Link>
      )}
    </nav>
  );
}
