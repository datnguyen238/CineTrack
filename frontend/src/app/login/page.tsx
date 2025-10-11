"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [checkedUser, setCheckedUser] = useState(false); // prevent infinite loop

  // Check if already logged in
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user_id) {
          router.replace("/main");
          return;
        }
      }
    } catch {
      localStorage.removeItem("user");
    }
    setCheckedUser(true); // allow rendering login form
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/users/login", form);

      // Ensure user_id exists
      if (!res.data.user_id) {
        alert("Invalid response from server. Please try again.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(res.data));
      alert(`Welcome back, ${res.data.name}!`);
      router.replace("/main");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Login failed");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  // Don't render until we know login status
  if (!checkedUser) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
          Login to CineTrack
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 rounded py-3 mt-2 font-semibold disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-400">
          Don’t have an account?{" "}
          <a href="/" className="text-blue-400 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
