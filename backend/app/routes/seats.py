from fastapi import APIRouter, HTTPException
from app.database import get_connection

router = APIRouter(prefix="/seats", tags=["Seats"])

@router.get("/{showtime_id}")
def get_seats(showtime_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT seat_id, seat_number, is_reserved
        FROM seat
        WHERE showtime_id = %s
        ORDER BY seat_number;
    """, (showtime_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        raise HTTPException(status_code=404, detail="No seats found for this showtime")

    layout = {}
    for seat in rows:
        row_letter = seat["seat_number"][0]
        layout.setdefault(row_letter, [])
        layout[row_letter].append({
            "seat_id": seat["seat_id"],
            "seat_number": seat["seat_number"],
            "reserved": seat["is_reserved"],
        })

    return {"showtime_id": showtime_id, "layout": layout}

