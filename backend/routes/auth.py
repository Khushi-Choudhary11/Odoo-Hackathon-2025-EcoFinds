from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from datetime import datetime, timedelta
from models.user import User
from models.roles import Role
from extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No input data provided"}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password"}), 401
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Create JWT token
    access_token = create_access_token(
        identity=user.id,
        additional_claims={"role": user.role.name}
    )
    
    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No input data provided"}), 400
    
    # Check required fields
    required_fields = ['email', 'username', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"{field} is required"}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already registered"}), 409
    
    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"message": "Username already taken"}), 409
    
    # Get user role (default to 'user' role)
    role_id = data.get('role_id')
    if role_id:
        role = Role.query.get(role_id)
    else:
        role = Role.query.filter_by(name='user').first()
        
    if not role:
        return jsonify({"message": "Invalid role"}), 400
    
    # Create user
    user = User(
        email=data['email'],
        username=data['username'],
        role=role,
        avatar_url=data.get('avatar_url')
    )
    user.set_password(data['password'])
    
    # Save user to DB
    db.session.add(user)
    db.session.commit()
    
    # Create access token
    access_token = create_access_token(
        identity=user.id,
        additional_claims={"role": user.role.name}
    )
    
    return jsonify({
        "message": "User registered successfully",
        "token": access_token,
        "user": user.to_dict()
    }), 201

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    return jsonify({
        "message": "Token is valid",
        "user": user.to_dict()
    }), 200