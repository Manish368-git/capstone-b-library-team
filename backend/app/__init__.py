from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import logging

db = SQLAlchemy()

def create_app(test_config=None):
    app = Flask(__name__)
    logging.basicConfig(level=logging.INFO)

    # default config
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///library_new.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # override config for testing
    if test_config:
        app.config.update(test_config)

    db.init_app(app)

    with app.app_context():
        from app.models.book import Book

        db.drop_all()
        db.create_all()

        if not Book.query.first():
            book1 = Book(
                title="Test Book 1",
                author="Author 1",
                isbn="ISBN001",
                available=True
            )

            book2 = Book(
                title="Test Book 2",
                author="Author 2",
                isbn="ISBN002",
                available=True
            )

            db.session.add_all([book1, book2])
            db.session.commit()

    CORS(app, resources={r"/*": {"origins": "*"}})

    from app.routes.book_routes import book_bp
    from app.routes.user_routes import user_bp
    from app.routes.borrow_routes import borrow_bp
    from app.routes.return_routes import return_bp

    app.register_blueprint(book_bp, url_prefix="/api/books")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(borrow_bp, url_prefix="/api/borrow")
    app.register_blueprint(return_bp, url_prefix="/api/return")

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
            response.status_code,
        )
        return response

    return app