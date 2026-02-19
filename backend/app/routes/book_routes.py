from flask import Blueprint, jsonify, request
from app.models.book import Book
from app import db

book_bp = Blueprint('book_bp', __name__)

# Get all books
@book_bp.route('/', methods=['GET'])
def get_books():
    books = Book.query.all()
    books_list = []
    for book in books:
        books_list.append({
            'id': book.id,
            'title': book.title,
            'author': book.author,
            'isbn': book.isbn,
            'available': book.available
        })
    return jsonify(books_list)

# Add a new book
@book_bp.route('/', methods=['POST'])
def add_book():
    data = request.get_json()
    new_book = Book(
        title=data['title'],
        author=data['author'],
        isbn=data['isbn'],
        available=True
    )
    db.session.add(new_book)
    db.session.commit()
    return jsonify({"message": f"Book '{new_book.title}' added successfully!"})
