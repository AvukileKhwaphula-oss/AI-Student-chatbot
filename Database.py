import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash


from pathlib import Path

DATABASE = str(
    Path(__file__).resolve().parent / "students.db"
)


def get_connection():

    connection = sqlite3.connect(DATABASE)

    connection.row_factory = sqlite3.Row

    return connection


def create_database():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            student_number TEXT UNIQUE NOT NULL,

            email TEXT UNIQUE NOT NULL,

            password TEXT NOT NULL,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )
    """)

    connection.commit()

    connection.close()


def create_student(student_number, email, password):

    connection = get_connection()

    cursor = connection.cursor()

    hashed_password = generate_password_hash(password)

    try:

        cursor.execute("""
            INSERT INTO students
            (student_number, email, password)

            VALUES (?, ?, ?)
        """, (
            student_number,
            email,
            hashed_password
        ))

        connection.commit()

        return True

    except sqlite3.IntegrityError:

        return False

    finally:

        connection.close()


def verify_student(email, password):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM students
        WHERE email = ?
    """, (email,))

    student = cursor.fetchone()

    connection.close()


    if student is None:

        return None


    if check_password_hash(student["password"], password):

        return student

        return None


def reset_password(email, new_password):

    connection = get_connection()

    cursor = connection.cursor()

    hashed_password = generate_password_hash(
        new_password
    )

    cursor.execute("""
        UPDATE students

        SET password = ?

        WHERE email = ?
    """, (
        hashed_password,
        email
    ))

    connection.commit()

    changed = cursor.rowcount > 0

    connection.close()

    return changed