
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash


def get_connection():
    database_url = os.environ.get("DATABASE_URL")

    if not database_url:
        raise RuntimeError(
            "DATABASE_URL environment variable is not configured."
        )

    return psycopg2.connect(database_url)


def create_database():

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id SERIAL PRIMARY KEY,
                student_number TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        connection.commit()
        cursor.close()

    finally:
        connection.close()


def create_student(student_number, email, password):

    connection = get_connection()

    try:
        cursor = connection.cursor()

        hashed_password = generate_password_hash(password)

        cursor.execute("""
            INSERT INTO students
            (student_number, email, password)
            VALUES (%s, %s, %s)
            ON CONFLICT DO NOTHING
            RETURNING id
        """, (
            student_number,
            email,
            hashed_password
        ))

        student = cursor.fetchone()

        connection.commit()

        return student is not None

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


def verify_student(email, password):

    connection = get_connection()

    try:
        cursor = connection.cursor(
            cursor_factory=RealDictCursor
        )

        cursor.execute("""
            SELECT *
            FROM students
            WHERE email = %s
        """, (email,))

        student = cursor.fetchone()

        if student is None:
            return None

        if check_password_hash(student["password"], password):
            return student

        return None

    finally:
        connection.close()


def reset_password(email, new_password):

    connection = get_connection()

    try:
        cursor = connection.cursor()

        hashed_password = generate_password_hash(new_password)

        cursor.execute("""
            UPDATE students
            SET password = %s
            WHERE email = %s
        """, (
            hashed_password,
            email
        ))

        connection.commit()

        return cursor.rowcount > 0

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()
