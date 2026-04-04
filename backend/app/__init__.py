from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import datetime, timezone, timedelta
import logging

db = SQLAlchemy()

def create_app(test_config=None):
    app = Flask(__name__)
    logging.basicConfig(level=logging.INFO)

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///library_new.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = "gyaan-lms-secret-key-2026"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=8)

    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    JWTManager(app)

    with app.app_context():
        from app.models.book import Book
        from app.models.user import User
        from app.models.borrow import Borrow
        from app.models.admin import Admin

        db.create_all()

        if not Book.query.first():
            db.session.add_all([
                Book(title="The Great Gatsby", author="F. Scott Fitzgerald", isbn="ISBN001", available=True),
                Book(title="To Kill a Mockingbird", author="Harper Lee", isbn="ISBN002", available=True),
            ])

        if not User.query.first():
            db.session.add(User(name="Test User", email="test@example.com"))

        # ✅ Create default admin account
        if not Admin.query.first():
            admin = Admin(username="admin")
            admin.set_password("gyaan2026")
            db.session.add(admin)

        db.session.commit()

    CORS(app, resources={r"/*": {"origins": "*"}})

    from app.routes.book_routes import book_bp
    from app.routes.user_routes import user_bp
    from app.routes.borrow_routes import borrow_bp
    from app.routes.auth_routes import auth_bp

    app.register_blueprint(book_bp,  url_prefix="/api/books")
    app.register_blueprint(user_bp,  url_prefix="/api/users")
    app.register_blueprint(borrow_bp, url_prefix="/api/borrow")
    app.register_blueprint(auth_bp,  url_prefix="/api/auth")

    @app.route("/healthz")
    def healthz():
        return {
            "status": "ok",
            "version": "alpha",
            "time": datetime.now(timezone.utc).isoformat()
        }, 200

    @app.after_request
    def log_request(response):
        app.logger.info("%s %s %s", request.method, request.path, response.status_code)
        return response

    return app
