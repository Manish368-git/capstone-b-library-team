from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # ✅ Import CORS
from datetime import datetime
import logging

db = SQLAlchemy()

def create_app(test_config=None):
    app = Flask(__name__)
    logging.basicConfig(level=logging.INFO)

    # default config
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///library.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # override config for testing
    if test_config:
        app.config.update(test_config)

    db.init_app(app)

    CORS(app, resources={r"/*": {"origins": "*"}})

    from app.routes.book_routes import book_bp
    from app.routes.user_routes import user_bp
    from app.routes.borrow_routes import borrow_bp

    app.register_blueprint(book_bp, url_prefix="/api/books")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(borrow_bp, url_prefix="/api/borrow")

    @app.route("/healthz")
    def healthz():
        return {
        "status": "ok",
        "version": "alpha",
        "time": datetime.utcnow().isoformat()
    }, 200

    @app.after_request
    def log_request(response):
        app.logger.info(
        "%s %s %s",
        request.method,
        request.path,
        response.status_code
        )
        return response

    return app
