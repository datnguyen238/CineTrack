from fastapi import APIRouter, HTTPException, Query
from app.database import get_connection
from datetime import datetime

router = APIRouter(prefix="/bookings", tags=["Bookings"])

# ------------------------------
# Create Booking
# ------------------------------
@router.post("")
def book_seat(seat_id: int = Query(...), user_id: int = Query(...)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        # 1. Verify seat exists and not reserved
        cur.execute("""
            SELECT s.showtime_id, st.show_time, s.is_reserved
            FROM seat s
            JOIN showtime st ON s.showtime_id = st.showtime_id
            WHERE s.seat_id = %s;
        """, (seat_id,))
        seat_data = cur.fetchone()

        if not seat_data:
            raise HTTPException(status_code=404, detail="Seat not found")

        showtime_id = seat_data["showtime_id"]
        show_time = seat_data["show_time"]
        is_reserved = seat_data["is_reserved"]

        if is_reserved:
            raise HTTPException(status_code=400, detail="Seat already reserved")

        # 2. Reserve seat + insert booking in one transaction
        cur.execute("UPDATE seat SET is_reserved = TRUE WHERE seat_id = %s;", (seat_id,))
        cur.execute("""
            INSERT INTO booking (seat_id, user_id, booking_time)
            VALUES (%s, %s, NOW())
            RETURNING booking_id;
        """, (seat_id, user_id))
        booking = cur.fetchone()
        conn.commit()

        return {
            "status": "success",
            "booking_id": booking["booking_id"],
            "seat_id": seat_id,
            "showtime_id": showtime_id,
            "user_id": user_id,
            "booking_time": datetime.now(),
        }

    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()  # roll back any partial reservation
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


# ------------------------------
# Get All Bookings for a User
# ------------------------------
@router.get("")
def get_bookings(user_id: int = Query(...)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT b.booking_id, m.title, st.theater, st.show_time, s.seat_number, b.booking_time
        FROM booking b
        JOIN seat s ON b.seat_id = s.seat_id
        JOIN showtime st ON s.showtime_id = st.showtime_id
        JOIN movie m ON st.movie_id = m.movie_id
        WHERE b.user_id = %s
        ORDER BY b.booking_time DESC;
    """, (user_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {
            "booking_id": r["booking_id"],
            "title": r["title"],
            "theater": r["theater"],
            "show_time": r["show_time"],
            "seat_number": r["seat_number"],
            "booking_time": r["booking_time"],
        }
        for r in rows
    ]


# ------------------------------
# Cancel Booking
# ------------------------------
@router.delete("/{booking_id}")
def cancel_booking(booking_id: int):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT seat_id FROM booking WHERE booking_id = %s;", (booking_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Booking not found")

        seat_id = row["seat_id"]

        # Delete booking + free seat in same transaction
        cur.execute("DELETE FROM booking WHERE booking_id = %s;", (booking_id,))
        cur.execute("UPDATE seat SET is_reserved = FALSE WHERE seat_id = %s;", (seat_id,))
        conn.commit()

        return {"status": "success", "message": f"Booking {booking_id} cancelled and seat {seat_id} freed."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
