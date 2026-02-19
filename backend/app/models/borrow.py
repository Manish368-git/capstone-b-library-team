from app import db
from datetime import datetime, timedelta

class Borrow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    borrow_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(days=14))
    returned = db.Column(db.Boolean, default=False)

    # Relationships
    user = db.relationship('User', backref='borrowed_books')
    book = db.relationship('Book', backref='borrowed_by')

    def __repr__(self):
        return f'<Borrow User:{self.user_id} Book:{self.book_id}>'
