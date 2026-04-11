from app import db
from datetime import datetime, timezone

class Book(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    title      = db.Column(db.String(150), nullable=False)
    author     = db.Column(db.String(100), nullable=False)
    isbn       = db.Column(db.String(20), unique=True, nullable=False)
    available  = db.Column(db.Boolean, default=True)
    category   = db.Column(db.String(50), nullable=True, default='General')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Book {self.title}>'
