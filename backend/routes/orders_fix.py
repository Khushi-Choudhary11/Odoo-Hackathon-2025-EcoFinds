from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.order import Order
from models.order_item import OrderItem
from extensions import db
import traceback

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    """Get all orders for the current user"""
    try:
        # Get user ID from JWT
        current_user_id = get_jwt_identity()
        print(f"GET orders request from user ID: {current_user_id}, type: {type(current_user_id)}")
        
        # Handle string user ID (convert to int if needed)
        if isinstance(current_user_id, str) and current_user_id.isdigit():
            current_user_id = int(current_user_id)
            
        # Check if user exists
        user = User.query.get(current_user_id)
        if not user:
            print(f"User not found: {current_user_id}")
            return jsonify({"message": "User not found"}), 404
        
        # Query orders for the user
        orders = Order.query.filter_by(user_id=current_user_id).order_by(Order.created_at.desc()).all()
        print(f"Found {len(orders)} orders for user {current_user_id}")
        
        # Return orders as JSON
        orders_data = []
        for order in orders:
            order_dict = order.to_dict()
            
            # Add items from the order_items relationship
            try:
                order_dict['items'] = [item.to_dict() for item in order.order_items]
                print(f"Added {len(order.order_items)} items to order {order.id}")
            except Exception as e:
                print(f"Error processing order items for order {order.id}: {str(e)}")
                order_dict['items'] = []
                order_dict['items_error'] = str(e)
            
            orders_data.append(order_dict)
        
        return jsonify({
            "orders": orders_data
        }), 200
        
    except Exception as e:
        print(f"Error fetching orders: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "message": "Error fetching orders",
            "details": str(e)
        }), 500

@orders_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_order(id):
    """Get a specific order by ID"""
    try:
        # Get user ID from JWT
        current_user_id = get_jwt_identity()
        print(f"GET order {id} request from user ID: {current_user_id}")
        
        # Handle string user ID (convert to int if needed)
        if isinstance(current_user_id, str) and current_user_id.isdigit():
            current_user_id = int(current_user_id)
            
        # Check if order exists
        order = Order.query.get(id)
        if not order:
            return jsonify({"message": "Order not found"}), 404
        
        # Check if order belongs to current user
        if order.user_id != current_user_id:
            print(f"User {current_user_id} tried to access order {id} belonging to user {order.user_id}")
            return jsonify({"message": "You do not have permission to access this order"}), 403
        
        # Get order details
        order_dict = order.to_dict()
        
        # Add items using the order_items relationship
        try:
            order_dict['items'] = [item.to_dict() for item in order.order_items]
        except Exception as e:
            print(f"Error processing order items for order {id}: {str(e)}")
            order_dict['items'] = []
            order_dict['items_error'] = str(e)
        
        return jsonify({
            "order": order_dict
        }), 200
        
    except Exception as e:
        print(f"Error fetching order {id}: {str(e)}")
        return jsonify({
            "message": "Error fetching order",
            "details": str(e)
        }), 500