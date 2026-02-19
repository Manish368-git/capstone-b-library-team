from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # ✅ Import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///library.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # ✅ Enable CORS for frontend requests
    CORS(app, resources={r"/*": {"origins": "*"}})

    from app.routes.book_routes import book_bp
    from app.routes.user_routes import user_bp
    from app.routes.borrow_routes import borrow_bp

    app.register_blueprint(book_bp, url_prefix='/api/books')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(borrow_bp, url_prefix='/api/borrow')

    return app
