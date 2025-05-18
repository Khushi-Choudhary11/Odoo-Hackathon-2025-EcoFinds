from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.product import Product
from models.cart_item import CartItem
from models.order import Order
from models.order_item import OrderItem
from extensions import db

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    cart_items = CartItem.query.filter_by(user_id=current_user_id).all()
    
    # Calculate total
    total = sum(item.product.price for item in cart_items if item.product and not item.product.is_sold)
    
    # Check for unavailable items
    unavailable_items = [item.id for item in cart_items if item.product and item.product.is_sold]
    
    return jsonify({
        "cartItems": [item.to_dict() for item in cart_items],
        "total": total,
        "unavailableItems": unavailable_items
    }), 200

@cart_bp.route('', methods=['POST'])
@jwt_required()
def add_to_cart():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    data = request.get_json()
    
    if not data or 'product_id' not in data:
        return jsonify({"message": "Product ID is required"}), 400
    
    product_id = data['product_id']
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({"message": "Product not found"}), 404
    
    if product.is_sold:
        return jsonify({"message": "Product is no longer available"}), 400
    
    # Check if product is already in cart
    existing_item = CartItem.query.filter_by(user_id=current_user_id, product_id=product_id).first()
    if existing_item:
        return jsonify({"message": "Product is already in your cart"}), 400
    
    # Prevent adding own products to cart
    if product.seller_id == current_user_id:
        return jsonify({"message": "You cannot add your own products to cart"}), 400
    
    # Add to cart
    cart_item = CartItem(user_id=current_user_id, product_id=product_id)
    db.session.add(cart_item)
    db.session.commit()
    
    return jsonify({
        "message": "Product added to cart",
        "cartItem": cart_item.to_dict()
    }), 201

@cart_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(id):
    current_user_id = get_jwt_identity()
    
    cart_item = CartItem.query.get(id)
    
    if not cart_item:
        return jsonify({"message": "Cart item not found"}), 404
    
    if cart_item.user_id != current_user_id:
        return jsonify({"message": "You don't have permission to remove this item"}), 403
    
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({
        "message": "Item removed from cart"
    }), 200

@cart_bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    data = request.get_json() or {}
    shipping_address = data.get('shipping_address', '')
    
    # Get cart items
    cart_items = CartItem.query.filter_by(user_id=current_user_id).all()
    
    if not cart_items:
        return jsonify({"message": "Your cart is empty"}), 400
    
    # Check if all products are available
    unavailable_products = []
    for item in cart_items:
        if not item.product or item.product.is_sold:
            unavailable_products.append(item.product_id if item.product else item.id)
    
    if unavailable_products:
        return jsonify({
            "message": "Some products are no longer available",
            "unavailableProducts": unavailable_products
        }), 400
    
    # Calculate total
    total_amount = sum(item.product.price for item in cart_items)
    
    # Create order
    order = Order(
        user_id=current_user_id,
        total_amount=total_amount,
        shipping_address=shipping_address
    )
    db.session.add(order)
    
    # Create order items and mark products as sold
    for cart_item in cart_items:
        # Create order item
        order_item = OrderItem(
            order=order,
            product_id=cart_item.product_id,
            price=cart_item.product.price
        )
        db.session.add(order_item)
        
        # Mark product as sold
        cart_item.product.is_sold = True
        
        # Remove from cart
        db.session.delete(cart_item)
    
    db.session.commit()
    
    return jsonify({
        "message": "Order placed successfully",
        "order": order.to_dict()
    }), 201