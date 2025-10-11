from fastapi import APIRouter, HTTPException, Body
from app.database import get_connection
import re

router = APIRouter(prefix="/users", tags=["Users"])

def is_valid_email(email: str) -> bool:
    return re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email) is not None


@router.post("/signup")
def signup(name: str = Body(...), email: str = Body(...), password: str = Body(...)):
    if not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    conn = get_connection()
    cur = conn.cursor()
    try:
        # Check for existing email
        cur.execute("SELECT user_id FROM app_user WHERE email = %s;", (email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        # Insert new user
        cur.execute(
            "INSERT INTO app_user (name, email, password) VALUES (%s, %s, %s) RETURNING user_id, name, email;",
            (name, email, password),
        )
        user = cur.fetchone()
        conn.commit()

        return {
            "status": "success",
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
        }

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


@router.post("/login")
def login(email: str = Body(...), password: str = Body(...)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM app_user WHERE email = %s;", (email,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=400, detail="Email not found")
        if user["password"] != password:
            raise HTTPException(status_code=400, detail="Invalid password")

        return {
            "status": "success",
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
