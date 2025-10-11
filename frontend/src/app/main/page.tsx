"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { Movie } from "@/lib/api";

export default function MainPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filtered, setFiltered] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [rating, setRating] = useState("All");

  // Redirect unauthenticated users to /login
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  // Load all movies
  useEffect(() => {
    api
      .get<Movie[]>("/movies")
      .then((res) => {
        setMovies(res.data);
        setFiltered(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Handle search and filters
  useEffect(() => {
    let results = movies;

    // Filter by search
    if (search.trim() !== "") {
      results = results.filter((m) =>
        m.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by genre
    if (genre !== "All") {
      results = results.filter((m) =>
        m.genre?.toLowerCase().includes(genre.toLowerCase())
      );
    }

    // Filter by rating
    if (rating !== "All") {
      const minRating = parseFloat(rating);
      results = results.filter((m) => (m.imdb_rating || 0) >= minRating);
    }

    setFiltered(results);
  }, [search, genre, rating, movies]);

  // Extract genre options dynamically
  const genres = Array.from(
    new Set(
      movies
        .flatMap((m) => (m.genre ? m.genre.split(",").map((g) => g.trim()) : []))
        .filter(Boolean)
    )
  );

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🎬 CineTrack</h1>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search by movie title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Genre Filter */}
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full sm:w-1/4 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
        >
          <option value="All">All Genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* Rating Filter */}
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full sm:w-1/4 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
        >
          <option value="All">All Ratings</option>
          <option value="9">9+</option>
          <option value="8">8+</option>
          <option value="7">7+</option>
          <option value="6">6+</option>
          <option value="5">5+</option>
          <option value="0">All (0+)</option>
        </select>
      </div>

      {/* Movie Grid */}
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">No movies found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filtered.map((m) => (
            <Link href={`/movie/${m.movie_id}`} key={m.movie_id}>
              <div className="bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition flex flex-col">
                <div className="w-full aspect-[2/3] bg-gray-700 rounded-t-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={
                      m.poster_url && m.poster_url !== "N/A"
                        ? m.poster_url
                        : "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
                    }
                    alt={m.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-3 flex flex-col flex-grow justify-between">
                  <h2 className="font-semibold text-base truncate">
                    {m.title}
                  </h2>
                  <p className="text-sm text-gray-400 line-clamp-1">
                    {m.genre}
                  </p>
                  <p className="text-yellow-400 text-sm mt-1">
                    ⭐ {(m.imdb_rating ?? 0).toFixed(1)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
