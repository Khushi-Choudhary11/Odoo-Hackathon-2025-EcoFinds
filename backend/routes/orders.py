from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.order import Order
from models.user import User
from extensions import db

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    
    # Admin can see all orders
    if claims.get('role') == 'admin':
        orders = Order.query.order_by(Order.created_at.desc()).all()
        return jsonify({
            "orders": [order.to_dict() for order in orders]
        }), 200
    
    # Regular users can only see their own orders
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    orders = Order.query.filter_by(user_id=current_user_id).order_by(Order.created_at.desc()).all()
    
    return jsonify({
        "orders": [order.to_dict() for order in orders]
    }), 200

@orders_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_order(id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    
    order = Order.query.get(id)
    
    if not order:
        return jsonify({"message": "Order not found"}), 404
    
    # Check permission
    if order.user_id != current_user_id and claims.get('role') != 'admin':
        return jsonify({"message": "You don't have permission to view this order"}), 403
    
    return jsonify(order.to_dict()), 200