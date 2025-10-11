CREATE TABLE movie (
    movie_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    genre VARCHAR(50),
    duration INT,
    release_date DATE
);

CREATE TABLE showtime (
    showtime_id SERIAL PRIMARY KEY,
    movie_id INT REFERENCES movie(movie_id) ON DELETE CASCADE,
    theater VARCHAR(50),
    show_time TIMESTAMP
);

CREATE TABLE seat (
    seat_id SERIAL PRIMARY KEY,
    showtime_id INT REFERENCES showtime(showtime_id) ON DELETE CASCADE,
    seat_number VARCHAR(5),
    is_reserved BOOLEAN DEFAULT FALSE
);

CREATE TABLE booking (
    booking_id SERIAL PRIMARY KEY,
    user_name VARCHAR(50),
    seat_id INT REFERENCES seat(seat_id),
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_user (
    user_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
