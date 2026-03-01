from sqlalchemy.exc import IntegrityError
import re
from flask import Blueprint, jsonify, request
from app.models.user import User
from app import db

user_bp = Blueprint('user_bp', __name__)
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

def validate_user(data):
    errors = []

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    age = data.get("age")

    # name: 2–50 characters
    if len(name) < 2 or len(name) > 50:
        errors.append({"field": "name", "message": "Name must be 2-50 characters."})

    # email: simple format check
    if not EMAIL_RE.match(email):
        errors.append({"field": "email", "message": "Invalid email format."})

    # age: number 0–120
    try:
        age_int = int(age)
        if age_int < 0 or age_int > 120:
            errors.append({"field": "age", "message": "Age must be between 0 and 120."})
    except (TypeError, ValueError):
        errors.append({"field": "age", "message": "Age must be a number."})

    return errors

@user_bp.route('/', methods=['POST'])
def add_user():
    data = request.get_json(silent=True) or {}

    errors = validate_user(data)
    if errors:
        return jsonify({"errors": errors}), 400

    new_user = User(
        name=data["name"].strip(),
        email=data["email"].strip()
    )

    db.session.add(new_user)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify(
            {"errors": [{"field": "email", "message": "Email already exists."}]}
        ), 400

    return jsonify({"message": "User added successfully"}), 201