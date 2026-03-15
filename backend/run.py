import os
from app import create_app

app = create_app()

@app.route("/")
def home():
    return {
        "service": "Library Management System API",
        "status": "running",
        "health_endpoint": "/healthz"
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
