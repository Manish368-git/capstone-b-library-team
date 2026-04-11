from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.admin import Admin
from app import db

auth_bp = Blueprint('auth_bp', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    data     = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    admin = Admin.query.filter_by(username=username).first()

    if not admin or not admin.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401

    token = create_access_token(identity=username)
    return jsonify({
        'token':    token,
        'username': username,
        'message':  'Login successful'
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    username = get_jwt_identity()
    return jsonify({'username': username}), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    data         = request.get_json(silent=True) or {}
    old_password = (data.get('old_password') or '').strip()
    new_password = (data.get('new_password') or '').strip()

    if not old_password or not new_password:
        return jsonify({'error': 'Old and new password are required'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400

    username = get_jwt_identity()
    admin    = Admin.query.filter_by(username=username).first()

    if not admin or not admin.check_password(old_password):
        return jsonify({'error': 'Current password is incorrect'}), 401

    admin.set_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Password changed successfully!'}), 200
