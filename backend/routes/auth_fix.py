from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
import datetime
from models.user import User
from models.roles import Role
from extensions import db
import logging

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        logging.info(f"Login attempt with data: {data}")
        
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
        user.last_login = datetime.datetime.utcnow()
        db.session.commit()
        
        # Convert user.id to string to ensure JWT compatibility
        user_id_str = str(user.id)
        logging.info(f"Creating token for user ID: {user_id_str} (type: {type(user_id_str)})")
        
        # Create JWT token with string identity and explicit expiration
        access_token = create_access_token(
            identity=user_id_str,  # Use string identity
            additional_claims={"role": user.role.name if user.role else "user"},
            expires_delta=datetime.timedelta(days=1)  # Set explicit expiration
        )
        
        logging.info(f"Login successful for user {email}")
        
        return jsonify({
            "message": "Login successful",
            "token": access_token,
            "user": user.to_dict()
        }), 200
    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        return jsonify({"message": f"Login failed: {str(e)}"}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
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
        
        # Convert user.id to string to ensure JWT compatibility
        user_id_str = str(user.id)
        
        # Create access token with string identity
        access_token = create_access_token(
            identity=user_id_str,
            additional_claims={"role": user.role.name if user.role else "user"},
            expires_delta=datetime.timedelta(days=1)  # Set explicit expiration
        )
        
        return jsonify({
            "message": "User registered successfully",
            "token": access_token,
            "user": user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Registration error: {str(e)}")
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        current_user_id = get_jwt_identity()
        logging.info(f"Token verification for user ID: {current_user_id}, type: {type(current_user_id)}")
        
        # Handle string or integer user ID
        try:
            if isinstance(current_user_id, str) and current_user_id.isdigit():
                current_user_id = int(current_user_id)
        except ValueError:
            pass
            
        user = User.query.get(current_user_id)
        
        if not user:
            logging.warning(f"User not found: {current_user_id}")
            return jsonify({"message": "User not found"}), 404
            
        return jsonify({
            "message": "Token is valid",
            "user": user.to_dict()
        }), 200
    except Exception as e:
        logging.error(f"Token verification error: {str(e)}")
        return jsonify({"message": f"Token verification failed: {str(e)}"}), 500