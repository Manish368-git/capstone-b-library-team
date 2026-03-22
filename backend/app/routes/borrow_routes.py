from flask import Blueprint, request, jsonify
from app.models.borrow import Borrow
from app.models.book import Book
from app.models.user import User
from app import db
from datetime import datetime, timedelta

borrow_bp = Blueprint('borrow_bp', __name__)


# ✅ Borrow a book
@borrow_bp.route('/', methods=['POST'])
def borrow_book():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    book_id = data.get('book_id')
    user_id = data.get('user_id')

    if not book_id or not user_id:
        return jsonify({"message": "book_id and user_id are required"}), 400

    book = db.session.get(Book, book_id)
    user = db.session.get(User, user_id)

    if not book:
        return jsonify({"message": "Book not found"}), 404

    if not user:
        return jsonify({"message": "User not found"}), 404

    if not book.available:
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

    return jsonify({"message": f"Book '{book.title}' borrowed successfully!"}), 200


# ✅ Return a book
@borrow_bp.route('/return', methods=['PUT'])
def return_book():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    book_id = data.get("book_id")

    if not book_id:
        return jsonify({"message": "book_id is required"}), 400

    borrow = Borrow.query.filter_by(book_id=book_id, returned=False).first()

    if not borrow:
        return jsonify({"message": "No active borrow record found"}), 400

    book = db.session.get(Book, book_id)

    borrow.returned = True
    book.available = True

    db.session.commit()

    return jsonify({"message": "Book returned successfully"}), 200


# ✅ Borrow report
@borrow_bp.route('/report', methods=['GET'])
def borrow_report():
    borrows = Borrow.query.all()

    result = []
    for b in borrows:
        result.append({
            'id': b.id,
            'user_name': b.user.name if b.user else None,
            'book_title': b.book.title if b.book else None,
            'borrow_date': b.borrow_date.strftime('%Y-%m-%d'),
            'returned': b.returned
        })

    return jsonify(result), 200