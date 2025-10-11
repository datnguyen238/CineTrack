import axios from "axios";

// Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // FastAPI backend
});

export default api;


export interface Movie {
  movie_id: number;
  title: string;
  genre: string;
  duration?: number;
  release_date?: string;
  poster_url?: string;
  imdb_rating?: number;
}

export interface Seat {
  seat_id: number;
  seat_number: string;
  reserved: boolean;
}

export interface SeatLayout {
  [row: string]: Seat[];
}

export interface Showtime {
  showtime_id: number;
  title: string;
  theater: string;
  show_time: string;
}
