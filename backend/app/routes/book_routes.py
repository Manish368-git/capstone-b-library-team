from flask import Blueprint, jsonify, request
from app.models.book import Book
from app import db

book_bp = Blueprint('book_bp', __name__)

CATEGORIES = ['General', 'Fiction', 'Non-Fiction', 'Science', 'Technology',
              'History', 'Biography', 'Children', 'Education', 'Other']

@book_bp.route('/', methods=['GET'])
def get_books():
    books = Book.query.all()
    return jsonify([{
        'id':        book.id,
        'title':     book.title,
        'author':    book.author,
        'isbn':      book.isbn,
        'available': book.available,
        'category':  book.category or 'General',
    } for book in books])


@book_bp.route('/categories', methods=['GET'])
def get_categories():
    return jsonify(CATEGORIES)


@book_bp.route('/', methods=['POST'])
def add_book():
    data     = request.get_json(silent=True) or {}
    errors   = []
    title    = data.get('title',    '').strip()
    author   = data.get('author',   '').strip()
    isbn     = data.get('isbn',     '').strip()
    category = data.get('category', 'General').strip()

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

    new_book = Book(title=title, author=author, isbn=isbn,
                    available=True, category=category)
    db.session.add(new_book)
    db.session.commit()
    return jsonify({"message": f"Book '{new_book.title}' added successfully!"}), 201


@book_bp.route('/<int:book_id>', methods=['PUT'])
def edit_book(book_id):
    book = db.session.get(Book, book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404

    data     = request.get_json(silent=True) or {}
    errors   = []
    title    = data.get('title',    '').strip()
    author   = data.get('author',   '').strip()
    isbn     = data.get('isbn',     '').strip()
    category = data.get('category', 'General').strip()

    if not title:
        errors.append({'field': 'title',  'message': 'Title is required.'})
    if not author:
        errors.append({'field': 'author', 'message': 'Author is required.'})
    if not isbn:
        errors.append({'field': 'isbn',   'message': 'ISBN is required.'})
    if errors:
        return jsonify({'errors': errors}), 400

    existing = Book.query.filter_by(isbn=isbn).first()
    if existing and existing.id != book_id:
        return jsonify({'errors': [{'field': 'isbn', 'message': 'ISBN already exists.'}]}), 400

    book.title    = title
    book.author   = author
    book.isbn     = isbn
    book.category = category
    db.session.commit()
    return jsonify({'message': f"Book '{book.title}' updated successfully!"}), 200


@book_bp.route('/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    book = db.session.get(Book, book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404

    if not book.available:
        return jsonify({'error': 'Cannot delete a book that is currently on loan'}), 400

    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': f"Book '{book.title}' deleted successfully!"}), 200
