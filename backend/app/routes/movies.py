from fastapi import APIRouter
from app.database import get_connection

router = APIRouter(prefix="/movies", tags=["Movies"])

@router.get("/")
def get_movies():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM movie;")
    movies = cur.fetchall()
    cur.close()
    conn.close()
    return movies
