from flask import Blueprint, jsonify
from app.models.book import Book
from app import db

return_bp = Blueprint("return_bp", __name__)  # ✅ THIS MUST MATCH

@return_bp.route("/<int:book_id>", methods=["POST"])
def return_book(book_id):
    book = Book.query.get(book_id)

    if not book:
        return jsonify({"error": "Book not found"}), 404

    if book.available:
        return jsonify({"error": "Book already available"}), 400

    book.available = True
    db.session.commit()

    return jsonify({"message": "Book returned successfully"}), 200