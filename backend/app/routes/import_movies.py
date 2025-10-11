from fastapi import APIRouter, Query, HTTPException
from app.database import get_connection
import requests, os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/import", tags=["Import"])

OMDB_API_KEY = os.getenv("OMDB_API_KEY")

@router.post("/movies")
def import_movie(title: str = Query(..., description="Movie title to import from OMDb")):
    if not OMDB_API_KEY:
        raise HTTPException(status_code=500, detail="OMDb API key missing")

    # Make request to OMDb
    url = f"http://www.omdbapi.com/?t={title}&apikey={OMDB_API_KEY}"
    res = requests.get(url).json()
    print("OMDb Response:", res)

    if res.get("Response") != "True":
        raise HTTPException(status_code=404, detail=f"Movie not found: {title}")

    # Safe runtime parsing
    runtime_value = res.get("Runtime", "0 min").split()[0]
    duration = int(runtime_value) if runtime_value.isdigit() else None

    # Safe rating parsing (default 0.0 if N/A)
    imdb_rating = 0.0
    if res.get("imdbRating") and res["imdbRating"] != "N/A":
        try:
            imdb_rating = float(res["imdbRating"])
        except ValueError:
            imdb_rating = 0.0

    # Poster handling
    poster = res.get("Poster")
    if not poster or poster == "N/A":
        poster = "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO movie (title, genre, duration, release_date, poster_url, imdb_rating)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (title) DO UPDATE
            SET genre = EXCLUDED.genre,
                duration = EXCLUDED.duration,
                release_date = EXCLUDED.release_date,
                poster_url = EXCLUDED.poster_url,
                imdb_rating = EXCLUDED.imdb_rating;
        """, (
            res.get("Title"),
            res.get("Genre"),
            duration,
            f"{res.get('Year', '2000')}-01-01",
            poster,
            imdb_rating
        ))
        conn.commit()
    except Exception as e:
        print("Database Error:", e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

    return {
        "status": "success",
        "title": res["Title"],
        "genre": res["Genre"],
        "duration": duration,
        "imdb_rating": imdb_rating,
        "poster_url": poster
    }
