"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Booking {
  booking_id: number;
  title: string;
  theater: string;
  show_time: string;
  seat_number: string;
  booking_time: string;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Load bookings for the logged-in user
  useEffect(() => {
    if (!user?.user_id) {
      router.push("/login");
      return;
    }

    api
      .get("/bookings", { params: { user_id: user.user_id } }) // ✅ unified route
      .then((res) => setBookings(res.data))
      .catch(() => alert("Failed to load bookings."));
  }, [router, user]);

  // Cancel booking
  const cancelBooking = async (id: number) => {
    const confirmCancel = confirm("Are you sure you want to cancel this booking?");
    if (!confirmCancel) return;

    try {
      await api.delete(`/bookings/${id}`); 
      alert("Booking cancelled successfully!");
      setBookings((prev) => prev.filter((b) => b.booking_id !== id));
    } catch {
      alert("Failed to cancel booking.");
    }
  };

  // Format showtime (MM/DD, HH:mm)
  const formatTime = (t: string) => {
    const d = new Date(t);
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
      d.getDate()
    ).padStart(2, "0")}, ${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">🎟️ My Bookings</h1>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <p className="text-gray-400 text-lg">You have no current bookings.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.booking_id}
              className="bg-gray-800 p-5 rounded-lg flex justify-between items-center shadow-md hover:bg-gray-700 transition"
            >
              <div>
                <p className="font-semibold text-lg">{b.title}</p>
                <p className="text-gray-400">
                  {b.theater} — Seat {b.seat_number} — {formatTime(b.show_time)}
                </p>
              </div>
              <button
                onClick={() => cancelBooking(b.booking_id)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
