"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api, { Movie, SeatLayout, Showtime } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Record<string, Showtime[]>>({});
  const [selectedShow, setSelectedShow] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<SeatLayout | null>(null);

  const router = useRouter();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Helper function: format date as MM/DD, HH:MM
  const formatTime = (t: string) => {
    const d = new Date(t);
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
      d.getDate()
    ).padStart(2, "0")}, ${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  // Load movie info
  useEffect(() => {
    api.get<Movie[]>("/movies").then((res) => {
      const found = res.data.find((m) => m.movie_id === Number(id));
      setMovie(found || null);
    });
  }, [id]);

  // Load and group showtimes by theater
  useEffect(() => {
    if (!movie) return;
    api.get<Showtime[]>("/showtimes").then((res) => {
      const filtered = res.data.filter((s) => s.title === movie.title);
      const grouped: Record<string, Showtime[]> = {};
      filtered.forEach((s) => {
        if (!grouped[s.theater]) grouped[s.theater] = [];
        grouped[s.theater].push(s);
      });
      setShowtimes(grouped);
    });
  }, [movie]);

  // Load seat layout
  const loadSeats = async (showtime: Showtime) => {
    const res = await api.get<{ layout: SeatLayout }>(
      `/seats/${showtime.showtime_id}`
    );
    setSeats(res.data.layout);
    setSelectedShow(showtime);
  };

  // Booking with confirmation
  const bookSeat = async (seatId: number, seatNumber: string) => {
    if (!selectedShow) return;
    if (!user || !user.user_id) {
      alert("Please log in before booking a seat.");
      router.push("/login");
      return;
    }

    const confirmed = confirm(
      `Confirm booking for seat ${seatNumber} at ${selectedShow.theater} on ${formatTime(
        selectedShow.show_time
      )}?`
    );
    if (!confirmed) return;

    try {
      const res = await api.post("/bookings", null, {
        params: { seat_id: seatId, user_id: user.user_id },
      });

      alert(`Seat ${seatNumber} booked successfully for ${user.name}!`);
      await loadSeats(selectedShow);
    } catch (err: any) {
      alert(`${err.response?.data?.detail || "Booking failed"}`);
    }
  };


  if (!movie)
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        Loading movie details...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row p-6 gap-10">
      {/* Left: Movie Info + Showtimes */}
      <div className="flex-1">
        <h2 className="text-3xl font-bold mb-4">{movie.title}</h2>

        {movie.poster_url && (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-56 mb-6 rounded-lg shadow-lg"
          />
        )}

        <p className="text-gray-400 mb-2 text-lg">{movie.genre}</p>
        <p className="text-yellow-400 mb-8 text-lg">
          ⭐ {movie.imdb_rating ? movie.imdb_rating.toFixed(1) : "0.0"}
        </p>

        <h3 className="text-2xl font-semibold mb-4">Showtimes by Theater</h3>
        {Object.entries(showtimes).map(([theater, times]) => (
          <div key={theater} className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-blue-400">
              {theater}
            </h4>
            <div className="flex flex-wrap gap-3">
              {times.map((s) => (
                <button
                  key={s.showtime_id}
                  onClick={() => loadSeats(s)}
                  className={`px-4 py-2 rounded-lg transition font-medium ${
                    selectedShow?.showtime_id === s.showtime_id
                      ? "bg-blue-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {formatTime(s.show_time)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Right: Seat Layout */}
      <div className="flex-1 bg-gray-800 rounded-xl p-8 shadow-lg flex flex-col items-center">
        {seats ? (
          <>
            <h3 className="text-2xl font-semibold mb-4">
              {selectedShow?.theater} — {formatTime(selectedShow!.show_time)}
            </h3>

            {/* Screen Indicator */}
            <div className="w-3/4 bg-gray-300 text-center text-black font-semibold py-2 rounded-t-md mb-8">
              SCREEN
            </div>

            {/* Seat Layout Grid */}
            <div className="flex flex-col gap-5 w-full items-center">
              {Object.entries(seats).map(([row, list]) => (
                <div
                  key={row}
                  className="flex gap-5 items-center justify-center"
                >
                  <span className="w-6 font-bold text-xl">{row}</span>
                  {list.map((seat) => (
                    <button
                      key={seat.seat_id}
                      onClick={() =>
                        !seat.reserved && bookSeat(seat.seat_id, seat.seat_number)
                      }
                      className={`w-14 h-14 text-lg font-semibold rounded-lg transition duration-200 shadow-md
                        ${
                          seat.reserved
                            ? "bg-red-600 cursor-not-allowed text-gray-200"
                            : "bg-green-500 hover:bg-green-600 active:scale-95"
                        }`}
                    >
                      {seat.seat_number}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-6 mt-10 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-green-500"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-red-600"></div>
                <span>Reserved</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-lg">
            Select a showtime to view seats.
          </p>
        )}
      </div>
    </div>
  );
}
