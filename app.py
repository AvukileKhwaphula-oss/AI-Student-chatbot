from flask import (
    Flask,
    request,
    jsonify,
    send_from_directory,
    session
)

from chatbot_model import predict_intent, get_response

from Database import (
    create_database,
    create_student,
    verify_student,
    reset_password
)

app = Flask(__name__, static_folder=".")

import os

app.secret_key = os.environ.get("SECRET_KEY")

create_database()


@app.route("/")
def home():

    return send_from_directory(
        ".",
        "index.html"
    )


@app.route("/<path:filename>")
def files(filename):

    return send_from_directory(
        ".",
        filename
    )

@app.post("/api/login")
def login():
    try:
        data = request.get_json(silent=True) or {}

        email = str(data.get("email", "")).strip()
        password = str(data.get("password", ""))

        if not email or not password:
            return jsonify({
                "success": False,
                "message": "Email and password are required."
            }), 400

        student = verify_student(email, password)

        if student is None:
            return jsonify({
                "success": False,
                "message": "Incorrect email or password."
            }), 401

        session["student_id"] = student["id"]
        session["student_number"] = student["student_number"]
        session["email"] = student["email"]

        return jsonify({
            "success": True,
            "message": "Login successful."
        }), 200

    except Exception:
        app.logger.exception("LOGIN ERROR")

        return jsonify({
            "success": False,
            "message": "A server error occurred during login. Please try again."
        }), 500


@app.post("/api/logout")
def logout():

    session.clear()
    return jsonify({
        "success": True,
        "message":
        "Logged out successfully."

    })


@app.post("/api/reset-password")
def reset_password_route():

    data = request.get_json(
        silent=True
    ) or {}


    email = str(
        data.get("email", "")
    ).strip()

    new_password = str(
        data.get("password", "")
    )

    if not email or not new_password:

        return jsonify({

            "success": False,

            "message":
            "Email and new password are required."

        }), 400

    if len(new_password) < 8:

        return jsonify({
            "success": False,
            "message":
            "Password must contain at least 8 characters."

        }), 400


    changed = reset_password(
        email,
        new_password
    )


    if not changed:
        return jsonify({
            "success": False,
            "message":
            "No account was found with that email."

        }), 404


    return jsonify({

        "success": True,
        "message":
        "Password successfully changed."

    })

@app.post("/api/chat")
def chat():
    # Check that the student is signed in
    if "student_id" not in session:
        return jsonify({
            "success": False,
            "error": "Please sign in first."
        }), 401

    # Get the message sent by JavaScript
    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).strip()

    if not message:
        return jsonify({
            "success": False,
            "error": "Please enter a message."
        }), 400

    try:
        # Use the NLP model to understand the question
        intent, confidence = predict_intent(message)

        # Generate the chatbot's response
        answer = get_response(intent, confidence)

        return jsonify({
            "success": True,
            "intent": intent,
            "confidence": round(float(confidence), 3),
            "response": answer
        })

    except Exception:
        app.logger.exception("Error processing chatbot message")

        return jsonify({
            "success": False,
            "error": "The chatbot encountered an internal error."
        }), 500


@app.post("/api/register")
def register():

    data = request.get_json(silent=True) or {}

    student_number = str(
        data.get("student_number", "")
    ).strip()

    email = str(
        data.get("email", "")
    ).strip()

    password = str(
        data.get("password", "")
    )


    if (
        not student_number
        or not email
        or not password
    ):

        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400


    if len(password) < 8:

        return jsonify({
            "success": False,
            "message":
                "Password must contain at least 8 characters."
        }), 400


    created = create_student(
        student_number,
        email,
        password
    )


    if not created:

        return jsonify({
            "success": False,
            "message":
                "Student number or email already exists."
        }), 409


    return jsonify({
        "success": True,
        "message":
            "Student account created successfully."
    })

if __name__ == "__main__":
    app.run(debug=False)