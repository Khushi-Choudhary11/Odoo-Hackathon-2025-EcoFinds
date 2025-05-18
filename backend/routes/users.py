from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.product import Product
from models.order import Order
from extensions import db

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    return jsonify(user.to_dict()), 200

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No input data provided"}), 400
    
    # Update fields that are allowed to be changed
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"message": "Username already taken"}), 409
        user.username = data['username']
    
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']
    
    # Update password if provided
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    db.session.commit()
    
    return jsonify({
        "message": "Profile updated successfully",
        "user": user.to_dict()
    }), 200

@users_bp.route('/products', methods=['GET'])
@jwt_required()
def get_user_products():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    products = user.products.order_by(Product.created_at.desc()).all()
    
    return jsonify({
        "products": [product.to_dict() for product in products]
    }), 200

@users_bp.route('/purchases', methods=['GET'])
@jwt_required()
def get_user_purchases():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        orders = user.orders.order_by(Order.created_at.desc()).all()
        
        # Return a plain array instead of nested object to match frontend expectations
        return jsonify([{
            "id": order.id,
            "title": order.product.name if order.product else "Unknown Product",
            "price": order.total_price,
            "image": order.product.image_url if order.product else "",
            "date": order.created_at.isoformat(),
            "impact": order.product.eco_impact if order.product else "Eco-friendly purchase"
        } for order in orders]), 200
    except Exception as e:
        # Return errors as JSON
        return jsonify({"error": str(e)}), 500
