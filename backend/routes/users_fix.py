from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.product import Product
from extensions import db
import traceback

users_bp = Blueprint('users', __name__)

@users_bp.route('/products', methods=['GET'])
@jwt_required()
def get_user_products():
    try:
        current_user_id = get_jwt_identity()
        print(f"Get products for user ID: {current_user_id}, type: {type(current_user_id)}")
        
        # Handle string user ID (convert to int if needed)
        if isinstance(current_user_id, str) and current_user_id.isdigit():
            current_user_id = int(current_user_id)
            
        user = User.query.get(current_user_id)
        if not user:
            print(f"User not found: {current_user_id}")
            return jsonify({"message": "User not found"}), 404
        
        # Fetch products listed by the user
        products = Product.query.filter_by(seller_id=current_user_id).all()
        print(f"Found {len(products)} products for user {current_user_id}")
        
        # Convert products to dictionaries
        products_data = [product.to_dict() for product in products]
        
        return jsonify(products_data), 200
        
    except Exception as e:
        print(f"Error getting user products: {str(e)}")
        traceback.print_exc()
        return jsonify({"message": "Error retrieving user products", "details": str(e)}), 500

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    try:
        current_user_id = get_jwt_identity()
        print(f"Get profile for user ID: {current_user_id}")
        
        # Handle string user ID
        if isinstance(current_user_id, str) and current_user_id.isdigit():
            current_user_id = int(current_user_id)
            
        user = User.query.get(current_user_id)
        
        if not user:
            print(f"User not found: {current_user_id}")
            return jsonify({"message": "User not found"}), 404
            
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        print(f"Error getting user profile: {str(e)}")
        return jsonify({"message": "Error retrieving user profile", "details": str(e)}), 500