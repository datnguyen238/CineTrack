from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import import_movies, movies, showtimes, seats, bookings, users


app = FastAPI(title="CineTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(movies.router)
app.include_router(showtimes.router)
app.include_router(seats.router)
app.include_router(bookings.router)
app.include_router(import_movies.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {"message": "CineTrack API is running!"}
