from flask import Blueprint, jsonify, request
from app.models.book import Book
from app import db

book_bp = Blueprint('book_bp', __name__)


@book_bp.route('/', methods=['GET'])
def get_books():
    books = Book.query.all()
    return jsonify([{
        'id':        book.id,
        'title':     book.title,
        'author':    book.author,
        'isbn':      book.isbn,
        'available': book.available
    } for book in books])


@book_bp.route('/', methods=['POST'])
def add_book():
    data   = request.get_json(silent=True) or {}
    errors = []
    title  = data.get('title',  '').strip()
    author = data.get('author', '').strip()
    isbn   = data.get('isbn',   '').strip()

    if not title:
        errors.append({'field': 'title',  'message': 'Title is required.'})
    if not author:
        errors.append({'field': 'author', 'message': 'Author is required.'})
    if not isbn:
        errors.append({'field': 'isbn',   'message': 'ISBN is required.'})
    if errors:
        return jsonify({'errors': errors}), 400

    if Book.query.filter_by(isbn=isbn).first():
        return jsonify({'errors': [{'field': 'isbn', 'message': 'ISBN already exists.'}]}), 400

    new_book = Book(title=title, author=author, isbn=isbn, available=True)
    db.session.add(new_book)
    db.session.commit()
    return jsonify({"message": f"Book '{new_book.title}' added successfully!"}), 201
