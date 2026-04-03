import uuid
import json
import os


def test_create_user_valid(client):
    email = f"sujit_{uuid.uuid4().hex}@example.com"
    res   = client.post("/api/users/", json={"name": "Sujit Giri", "email": email, "age": 25})
    assert res.status_code == 201
    assert res.get_json()["message"] == "User added successfully"


def test_create_user_invalid_fields(client):
    res  = client.post("/api/users/", json={"name": "", "email": "bad", "age": -1})
    data = res.get_json()
    assert res.status_code == 400
    assert "errors" in data
    assert len(data["errors"]) >= 1


def test_create_user_duplicate_email(client):
    email   = f"dup_{uuid.uuid4().hex}@example.com"
    payload = {"name": "Sujit Giri", "email": email, "age": 25}

    res1 = client.post("/api/users/", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/users/", json=payload)
    assert res2.status_code == 400
    assert res2.get_json()["errors"][0]["field"] == "email"


def _payload(u):
    return {"name": u.get("name"), "email": u.get("email"), "age": u.get("age")}


def test_dataset_driven_negative_cases(client):
    dataset_path = os.path.join(os.path.dirname(__file__), "..", "mock", "users.json")

    with open(dataset_path) as f:
        users = json.load(f)

    by_case = {u.get("case"): u for u in users if isinstance(u, dict) and u.get("case")}

    for u in users:
        if u.get("valid", True):
            continue

        if u.get("case") == "duplicate_email_second":
            first = by_case.get("duplicate_email_first")
            if first:
                seed = client.post("/api/users/", json=_payload(first))
                assert seed.status_code == 201
            res  = client.post("/api/users/", json=_payload(u))
            data = res.get_json()
            assert res.status_code == 400
            assert "errors" in data
            assert data["errors"][0]["field"] == "email"
            continue

        res  = client.post("/api/users/", json=_payload(u))
        data = res.get_json()
        assert res.status_code == 400
        assert "errors" in data
        assert len(data["errors"]) >= 1
