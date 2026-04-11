from flask import Blueprint, request, jsonify
from app.models.borrow import Borrow
from app.models.book import Book
from app.models.user import User
from app import db
from datetime import datetime, timedelta

borrow_bp = Blueprint('borrow_bp', __name__)


@borrow_bp.route('/', methods=['POST'])
def borrow_book():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    book_id = data.get('book_id')
    user_id = data.get('user_id')

    if book_id is None or user_id is None:
        return jsonify({"error": "book_id and user_id are required"}), 400

    try:
        book_id = int(book_id)
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({"error": "book_id and user_id must be integers"}), 400

    book = db.session.get(Book, book_id)
    user = db.session.get(User, user_id)

    if not book:
        return jsonify({"error": "Book not found"}), 404
    if not user:
        return jsonify({"error": "User not found"}), 404
    if not book.available:
        return jsonify({"error": "Book not available"}), 400

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

    return jsonify({
        "message": f"Book '{book.title}' borrowed successfully!",
        "due_date": borrow.due_date.strftime('%Y-%m-%d')
    }), 200


@borrow_bp.route('/return', methods=['PUT'])
def return_book():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    book_id = data.get("book_id")
    if book_id is None:
        return jsonify({"error": "book_id is required"}), 400

    try:
        book_id = int(book_id)
    except (ValueError, TypeError):
        return jsonify({"error": "book_id must be an integer"}), 400

    borrow = Borrow.query.filter_by(book_id=book_id, returned=False).first()
    if not borrow:
        return jsonify({"error": "No active borrow record found"}), 400

    book = db.session.get(Book, book_id)
    borrow.returned = True
    book.available  = True
    db.session.commit()

    return jsonify({"message": "Book returned successfully"}), 200


@borrow_bp.route('/report', methods=['GET'])
def borrow_report():
    search = request.args.get('search', '').strip().lower()
    status = request.args.get('status', '').strip().lower()
    borrows = Borrow.query.all()
    result  = []

    for b in borrows:
        user_name      = b.user.name  if b.user  else ''
        book_title     = b.book.title if b.book  else ''
        due_date_str   = b.due_date.strftime('%Y-%m-%d')   if b.due_date   else None
        borrow_date_str = b.borrow_date.strftime('%Y-%m-%d') if b.borrow_date else None

        if b.returned:
            record_status = 'returned'
        elif b.due_date and b.due_date < datetime.now():
            record_status = 'overdue'
        else:
            record_status = 'active'

        if search:
            if search not in f"{user_name} {book_title}".lower():
                continue
        if status and status != 'all':
            if record_status != status:
                continue

        result.append({
            'id':          b.id,
            'book_id':     b.book_id,
            'user_name':   user_name,
            'book_title':  book_title,
            'borrow_date': borrow_date_str,
            'due_date':    due_date_str,
            'returned':    b.returned,
            'status':      record_status
        })

    return jsonify(result), 200


@borrow_bp.route('/member/<int:user_id>', methods=['GET'])
def member_history(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'Member not found'}), 404

    borrows = Borrow.query.filter_by(user_id=user_id).order_by(Borrow.borrow_date.desc()).all()
    result  = []

    for b in borrows:
        book_title = b.book.title if b.book else ''
        due_date_str   = b.due_date.strftime('%Y-%m-%d')   if b.due_date   else None
        borrow_date_str = b.borrow_date.strftime('%Y-%m-%d') if b.borrow_date else None

        if b.returned:
            record_status = 'returned'
        elif b.due_date and b.due_date < datetime.now():
            record_status = 'overdue'
        else:
            record_status = 'active'

        result.append({
            'id':          b.id,
            'book_id':     b.book_id,
            'book_title':  book_title,
            'borrow_date': borrow_date_str,
            'due_date':    due_date_str,
            'returned':    b.returned,
            'status':      record_status
        })

    return jsonify({
        'member': {'id': user.id, 'name': user.name, 'email': user.email},
        'borrows': result,
        'total': len(result),
        'active': len([b for b in result if b['status'] == 'active']),
        'overdue': len([b for b in result if b['status'] == 'overdue']),
        'returned': len([b for b in result if b['status'] == 'returned']),
    }), 200
