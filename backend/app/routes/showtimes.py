from fastapi import APIRouter, HTTPException
from app.database import get_connection
from datetime import datetime

router = APIRouter(prefix="/showtimes", tags=["Showtimes"])

@router.get("/")
def get_showtimes():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT s.showtime_id, m.title, s.theater, s.show_time
        FROM showtime s
        JOIN movie m ON s.movie_id = m.movie_id
        ORDER BY s.show_time;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows


@router.post("/")
def add_showtime(movie_id: int, theater: str, show_time: datetime):
    """Add a new showtime for a movie"""
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO showtime (movie_id, theater, show_time)
            VALUES (%s, %s, %s)
            RETURNING *;
        """, (movie_id, theater, show_time))    
        conn.commit()
        new_show = cur.fetchone()
        generate_seats(new_show["showtime_id"])
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
    return new_show


def generate_seats(showtime_id: int):
    conn = get_connection()
    cur = conn.cursor()
    seats = []
    rows = ["A", "B", "C", "D", "E"]
    for row in rows:
        for num in range(1, 6):  # 5 seats per row
            seat_number = f"{row}{num}"
            seats.append((showtime_id, seat_number))
    cur.executemany(
        "INSERT INTO seat (showtime_id, seat_number) VALUES (%s, %s);", seats
    )
    conn.commit()
    cur.close()
    conn.close()
