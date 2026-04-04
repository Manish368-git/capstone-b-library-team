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
