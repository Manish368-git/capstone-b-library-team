import uuid
import pytest
from app import create_app, db


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True

    # Use in-memory DB for tests
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    with app.app_context():
        db.create_all()

    with app.test_client() as client:
        yield client


def test_create_user_valid(client):
    email = f"sujit_{uuid.uuid4().hex}@example.com"

    res = client.post("/api/users/", json={
        "name": "Sujit Giri",
        "email": email,
        "age": 25
    })

    assert res.status_code == 201
    assert res.get_json()["message"] == "User added successfully"


def test_create_user_invalid_fields(client):
    res = client.post("/api/users/", json={"name": "", "email": "bad", "age": -1})
    assert res.status_code == 400
    data = res.get_json()
    assert "errors" in data
    assert len(data["errors"]) >= 1


def test_create_user_duplicate_email(client):
    email = f"dup_{uuid.uuid4().hex}@example.com"
    payload = {"name": "Sujit Giri", "email": email, "age": 25}

    res1 = client.post("/api/users/", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/users/", json=payload)
    assert res2.status_code == 400
    data = res2.get_json()
    assert data["errors"][0]["field"] == "email"

import json
import os

def test_dataset_driven_negative_cases(client):
    # Load dataset
    dataset_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "mock",
        "users.json"
    )

    with open(dataset_path) as f:
        users = json.load(f)

    for user in users:
        if not user.get("valid", True):
            res = client.post("/api/users/", json=user)

            assert res.status_code == 400
            data = res.get_json()

            assert "errors" in data
            assert len(data["errors"]) >= 1