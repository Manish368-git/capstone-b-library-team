from flask import Blueprint, request, jsonify
from app.models.borrow import Borrow
from app.models.book import Book
from app import db
from datetime import datetime, timedelta

borrow_bp = Blueprint('borrow_bp', __name__)

# Borrow a book
@borrow_bp.route('/', methods=['POST'])
def borrow_book():
    data = request.get_json()
    book_id = data['book_id']
    user_id = data['user_id']

    book = Book.query.get(book_id)
    if not book or not book.available:
        return jsonify({"message": "Book not available"}), 400

    borrow = Borrow(
        book_id=book_id,
        user_id=user_id,
        borrow_date=datetime.now(),
        due_date=datetime.now() + timedelta(days=14),
        returned=False
    )

    book.available = False
    db.session.add(borrow)
    db.session.commit()

    return jsonify({"message": f"Book '{book.title}' borrowed successfully!"})


# Return a book
@borrow_bp.route('/return', methods=['PUT'])
def return_book():
    data = request.get_json()
    book_id = data.get("book_id")

    borrow = Borrow.query.filter_by(book_id=book_id, returned=False).first()

    if not borrow:
        return jsonify({"message": "No active borrow record found"}), 400

    borrow.returned = True
    book = Book.query.get(book_id)
    book.available = True

    db.session.commit()

    return jsonify({"message": "Book returned successfully"}), 200

# Borrow Report (to display all borrowed books)
@borrow_bp.route('/report', methods=['GET'])
def borrow_report():
    borrows = Borrow.query.all()
    result = []
    for b in borrows:
        result.append({
            'id': b.id,
            'user_name': b.user.name,
            'book_title': b.book.title,
            'borrow_date': b.borrow_date.strftime('%Y-%m-%d'),
            'returned': b.returned
        })
    return jsonify(result)
