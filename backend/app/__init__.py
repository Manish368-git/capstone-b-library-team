from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # ✅ Import CORS

db = SQLAlchemy()

def create_app(test_config=None):
    app = Flask(__name__)

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

    return app
