"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [checkedUser, setCheckedUser] = useState(false);

  // Only check once if user is logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.replace("/main"); // replace avoids back button returning to signup
    } else {
      setCheckedUser(true);
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      alert("All fields are required.");
      return;
    }

    if (!/^[\w\.-]+@[\w\.-]+\.\w+$/.test(form.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/users/signup", form);

      // Save user and immediately redirect
      localStorage.setItem("user", JSON.stringify(res.data));
      alert("Account created successfully!");
      router.replace("/main"); // ✅ replace to prevent history loop
    } catch (err: any) {
      alert(err.response?.data?.detail || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  // Wait until login check finishes
  if (!checkedUser) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
          CineTrack Sign Up
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={handleChange}
            className="p-3 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 rounded py-3 mt-2 font-semibold disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-400 hover:underline hover:text-blue-300"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
